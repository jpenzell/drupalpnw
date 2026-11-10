-- STAGED — Stage 1 only (see gate/README.md). Purely additive: no existing table, policy or
-- grant is touched, so the live deck keeps working exactly as today. Contains no row data;
-- configuration rows are written by gate/data/*.sql at the matching stage.
-- Every gate_* function is SECURITY DEFINER and executable ONLY by service_role (edge functions),
-- so no browser role gains a new capability from this file.

CREATE TABLE public.gate_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  redeem_enabled boolean NOT NULL DEFAULT false,
  presentation text NOT NULL,
  workshop text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.gate_config TO service_role;
ALTER TABLE public.gate_config ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.presenter_authorizations (
  user_id uuid PRIMARY KEY,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.presenter_authorizations TO service_role;
ALTER TABLE public.presenter_authorizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.presenter_sessions (
  session_id uuid PRIMARY KEY REFERENCES public.sessions(id) ON DELETE CASCADE,
  presenter_user_id uuid NOT NULL,
  presentation text NOT NULL,
  workshop text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.presenter_sessions TO service_role;
ALTER TABLE public.presenter_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jti text NOT NULL UNIQUE,                 -- persisted forever: a replayed token always fails
  lead_ref text NOT NULL,                   -- opaque MainSite sub; never a name or email
  participant_key text NOT NULL,            -- server-derived response identity
  presentation text NOT NULL,
  workshop text NOT NULL,
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE, -- always bound
  grant_hash text NOT NULL UNIQUE,          -- sha256 of the opaque grant held in browser memory
  expires_at timestamptz NOT NULL,          -- equals the token exp; never extended
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX access_grants_lead_ref_idx ON public.access_grants (lead_ref);
GRANT ALL ON public.access_grants TO service_role;
ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;

-- Used by RLS after enforcement: presenter of THIS session, and the session was created through
-- the password-checked function (a bare anonymous sign-in that owns a session is not enough).
CREATE FUNCTION public.is_proven_presenter(_session_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sessions s
    JOIN public.presenter_sessions ps ON ps.session_id = s.id
    WHERE s.id = _session_id AND s.presenter_id = auth.uid() AND ps.presenter_user_id = auth.uid()
  )
$$;

CREATE FUNCTION public.gate_redeem(
  p_jti text, p_lead_ref text, p_participant_key text, p_presentation text, p_workshop text,
  p_session_code text, p_grant_hash text, p_expires_at timestamptz
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cfg public.gate_config%ROWTYPE;
  v_session uuid;
BEGIN
  SELECT * INTO cfg FROM public.gate_config WHERE id = 1;
  IF NOT FOUND OR cfg.redeem_enabled IS NOT TRUE THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:not_configured';
  END IF;
  IF p_jti IS NULL OR length(p_jti) NOT BETWEEN 1 AND 200
     OR p_lead_ref IS NULL OR length(p_lead_ref) NOT BETWEEN 1 AND 200
     OR p_participant_key IS NULL OR p_participant_key !~ '^lead_[0-9a-f]{32}$'
     OR p_grant_hash IS NULL OR p_grant_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:malformed';
  END IF;
  IF p_presentation IS DISTINCT FROM cfg.presentation OR p_workshop IS DISTINCT FROM cfg.workshop THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:wrong_scope';
  END IF;
  IF p_expires_at IS NULL OR p_expires_at <= now() THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:expired';
  END IF;
  IF p_expires_at > now() + interval '6 minutes' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:lifetime_too_long';
  END IF;
  IF p_session_code IS NULL OR p_session_code !~ '^[A-Z0-9]{4,8}$' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:session_required';
  END IF;

  SELECT s.id INTO v_session
  FROM public.sessions s JOIN public.presenter_sessions ps ON ps.session_id = s.id
  WHERE s.code = p_session_code AND s.is_active IS TRUE
    AND ps.presentation = cfg.presentation AND ps.workshop = cfg.workshop;
  IF v_session IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:session_inactive';
  END IF;

  BEGIN
    INSERT INTO public.access_grants
      (jti, lead_ref, participant_key, presentation, workshop, session_id, grant_hash, expires_at)
    VALUES
      (p_jti, p_lead_ref, p_participant_key, cfg.presentation, cfg.workshop, v_session, p_grant_hash, p_expires_at);
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:replayed';
  END;

  RETURN jsonb_build_object('session_id', v_session, 'participant_key', p_participant_key, 'expires_at', p_expires_at);
END $$;

-- Internal: a grant is usable only while unexpired, unrevoked, and its bound session is still
-- active and still belongs to the configured presentation/workshop.
CREATE FUNCTION public.gate_resolve(p_grant_hash text, OUT o_participant_key text, OUT o_session_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  SELECT g.participant_key, g.session_id INTO o_participant_key, o_session_id
  FROM public.access_grants g
  JOIN public.sessions s ON s.id = g.session_id
  JOIN public.presenter_sessions ps ON ps.session_id = s.id
  WHERE g.grant_hash = p_grant_hash AND g.revoked_at IS NULL AND g.expires_at > now()
    AND s.is_active IS TRUE AND ps.presentation = g.presentation AND ps.workshop = g.workshop;
  IF o_participant_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:grant_invalid';
  END IF;
END $$;

-- For guarded paid functions: a live bound grant, or a password-authorized presenter.
CREATE FUNCTION public.gate_check_access(p_grant_hash text, p_presenter_user uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  IF p_grant_hash IS NOT NULL THEN
    BEGIN
      SELECT * INTO r FROM public.gate_resolve(p_grant_hash);
      RETURN jsonb_build_object('kind', 'attendee', 'participant_key', r.o_participant_key, 'session_id', r.o_session_id);
    EXCEPTION WHEN SQLSTATE 'P0001' THEN
      NULL; -- fall through to presenter check
    END;
  END IF;
  IF p_presenter_user IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.presenter_authorizations a WHERE a.user_id = p_presenter_user AND a.expires_at > now()
  ) THEN
    RETURN jsonb_build_object('kind', 'presenter', 'user_id', p_presenter_user);
  END IF;
  RETURN NULL;
END $$;

-- Payload validation matching responses.value (jsonb object) as the deck actually sends it:
-- { answer }, { choice }, { choices: [...] }, { number }, { year }, { text }, { "Slam dunk": n, ... }.
CREATE FUNCTION public.gate_valid_value(p_value jsonb, p_type public.poll_type, p_config jsonb)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE
  k text; v jsonb; e jsonb; n integer := 0;
  v_min numeric; v_max numeric;
BEGIN
  IF p_value IS NULL OR jsonb_typeof(p_value) <> 'object' OR octet_length(p_value::text) > 2000 THEN
    RETURN false;
  END IF;
  IF p_config IS NOT NULL AND jsonb_typeof(p_config -> 'min') = 'number' AND jsonb_typeof(p_config -> 'max') = 'number' THEN
    v_min := (p_config ->> 'min')::numeric; v_max := (p_config ->> 'max')::numeric;
  END IF;
  FOR k, v IN SELECT key, value FROM jsonb_each(p_value) LOOP
    n := n + 1;
    IF n > 20 OR length(k) NOT BETWEEN 1 AND 64 THEN RETURN false; END IF;
    CASE jsonb_typeof(v)
      WHEN 'string' THEN IF length(v #>> '{}') > 500 THEN RETURN false; END IF;
      WHEN 'boolean' THEN NULL;
      WHEN 'number' THEN
        IF p_type = 'slider' AND v_min IS NOT NULL AND ((v #>> '{}')::numeric < v_min OR (v #>> '{}')::numeric > v_max) THEN
          RETURN false;
        END IF;
      WHEN 'array' THEN
        IF jsonb_array_length(v) > 20 THEN RETURN false; END IF;
        FOR e IN SELECT value FROM jsonb_array_elements(v) LOOP
          IF jsonb_typeof(e) NOT IN ('string', 'number', 'boolean') THEN RETURN false; END IF;
          IF jsonb_typeof(e) = 'string' AND length(e #>> '{}') > 200 THEN RETURN false; END IF;
        END LOOP;
      ELSE RETURN false; -- null and nested objects are never sent by the deck
    END CASE;
  END LOOP;
  IF n = 0 THEN RETURN false; END IF;
  IF p_type = 'multiple_choice' AND p_config IS NOT NULL AND jsonb_typeof(p_config -> 'options') = 'array'
     AND p_value ? 'answer' AND NOT ((p_config -> 'options') @> jsonb_build_array(p_value -> 'answer')) THEN
    RETURN false;
  END IF;
  RETURN true;
END $$;

CREATE FUNCTION public.gate_submit_poll_response(p_grant_hash text, p_poll_id uuid, p_value jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g record; p public.polls%ROWTYPE; r jsonb;
BEGIN
  SELECT * INTO g FROM public.gate_resolve(p_grant_hash);
  SELECT * INTO p FROM public.polls WHERE id = p_poll_id;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:poll_not_found'; END IF;
  IF p.session_id <> g.o_session_id THEN RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:wrong_session'; END IF;
  IF p.is_open IS FALSE THEN RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:poll_closed'; END IF;
  IF NOT public.gate_valid_value(p_value, p.poll_type, coalesce(p.poll_config, '{}'::jsonb)) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:invalid_value';
  END IF;
  INSERT INTO public.responses (poll_id, participant_id, value)
  VALUES (p.id, g.o_participant_key, p_value)
  ON CONFLICT (poll_id, participant_id) DO UPDATE SET value = EXCLUDED.value
  RETURNING to_jsonb(responses.*) INTO r;
  RETURN r;
END $$;

CREATE FUNCTION public.gate_my_responses(p_grant_hash text, p_poll_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g record; v_session uuid;
BEGIN
  SELECT * INTO g FROM public.gate_resolve(p_grant_hash);
  SELECT session_id INTO v_session FROM public.polls WHERE id = p_poll_id;
  IF v_session IS NULL OR v_session <> g.o_session_id THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:wrong_session';
  END IF;
  RETURN coalesce((SELECT jsonb_agg(to_jsonb(r.*)) FROM public.responses r
                   WHERE r.poll_id = p_poll_id AND r.participant_id = g.o_participant_key), '[]'::jsonb);
END $$;

-- Positions follow the deck: 1..999 writer slots, 1000..9999 lottery pool, >=10000 discarded.
CREATE FUNCTION public.gate_story_volunteer(p_grant_hash text, p_name text, p_mode text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g record; v_name text := btrim(p_name); v_max integer; v_n integer; v_top integer; v_pos integer; r jsonb;
BEGIN
  SELECT * INTO g FROM public.gate_resolve(p_grant_hash);
  IF v_name IS NULL OR length(v_name) NOT BETWEEN 1 AND 40 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:invalid_name';
  END IF;
  IF p_mode IS NULL OR p_mode NOT IN ('slot', 'lottery') THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:malformed';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('story:' || g.o_session_id::text, 0));

  SELECT to_jsonb(v.*) INTO r FROM public.story_volunteers v
  WHERE v.session_id = g.o_session_id AND v.participant_id = g.o_participant_key;
  IF r IS NOT NULL THEN RETURN r; END IF; -- one entry per lead per session

  IF p_mode = 'slot' THEN
    SELECT max_volunteers INTO v_max FROM public.story_game_state WHERE session_id = g.o_session_id;
    v_max := coalesce(v_max, 3);
    SELECT count(*), coalesce(max(position), 0) INTO v_n, v_top
    FROM public.story_volunteers WHERE session_id = g.o_session_id AND position < 1000;
    IF v_n >= v_max OR v_top + 1 >= 1000 THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:full';
    END IF;
    v_pos := v_top + 1;
  ELSE
    SELECT coalesce(max(position), 1000) INTO v_top
    FROM public.story_volunteers WHERE session_id = g.o_session_id AND position >= 1000 AND position < 10000;
    IF v_top + 1 >= 10000 THEN RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:full'; END IF;
    v_pos := v_top + 1;
  END IF;

  INSERT INTO public.story_volunteers (session_id, participant_id, participant_name, position)
  VALUES (g.o_session_id, g.o_participant_key, v_name, v_pos)
  RETURNING to_jsonb(story_volunteers.*) INTO r;
  RETURN r;
END $$;

CREATE FUNCTION public.gate_story_word(p_grant_hash text, p_word text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g record; gs public.story_game_state%ROWTYPE; v_word text := btrim(p_word); v_pos integer; v_n integer; r jsonb;
BEGIN
  SELECT * INTO g FROM public.gate_resolve(p_grant_hash);
  IF v_word IS NULL OR length(v_word) NOT BETWEEN 1 AND 40 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:invalid_word';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('story:' || g.o_session_id::text, 0));
  SELECT * INTO gs FROM public.story_game_state WHERE session_id = g.o_session_id;
  IF NOT FOUND OR NOT EXISTS (
    SELECT 1 FROM public.story_volunteers v
    WHERE v.session_id = g.o_session_id AND v.participant_id = g.o_participant_key
      AND v.position < 1000 AND v.position = coalesce(gs.current_writer_position, 1)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:not_your_turn';
  END IF;
  SELECT coalesce(max(position), 0) + 1 INTO v_pos FROM public.story_words WHERE session_id = g.o_session_id;
  INSERT INTO public.story_words (session_id, word, added_by, position)
  VALUES (g.o_session_id, v_word, g.o_participant_key, v_pos)
  RETURNING to_jsonb(story_words.*) INTO r;
  SELECT count(*) INTO v_n FROM public.story_volunteers WHERE session_id = g.o_session_id AND position < 1000;
  UPDATE public.story_game_state
  SET current_writer_position = (coalesce(current_writer_position, 1) % greatest(v_n, 1)) + 1, updated_at = now()
  WHERE session_id = g.o_session_id;
  RETURN r;
END $$;

-- Called by create-presenter-session only after the PRESENTATION_PASSWORD check succeeded.
CREATE FUNCTION public.gate_authorize_presenter(p_user uuid)
RETURNS timestamptz LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_exp timestamptz := now() + interval '12 hours';
BEGIN
  IF p_user IS NULL THEN RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:malformed'; END IF;
  INSERT INTO public.presenter_authorizations (user_id, expires_at) VALUES (p_user, v_exp)
  ON CONFLICT (user_id) DO UPDATE SET expires_at = EXCLUDED.expires_at;
  RETURN v_exp;
END $$;

CREATE FUNCTION public.gate_create_presenter_session(p_user uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cfg public.gate_config%ROWTYPE;
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code text; v_bytes bytea; s public.sessions%ROWTYPE; i integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.presenter_authorizations a WHERE a.user_id = p_user AND a.expires_at > now()) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:presenter_required';
  END IF;
  SELECT * INTO cfg FROM public.gate_config WHERE id = 1;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:not_configured'; END IF;
  FOR attempt IN 1..10 LOOP
    v_bytes := decode(md5(gen_random_uuid()::text), 'hex');
    v_code := '';
    FOR i IN 0..3 LOOP
      v_code := v_code || substr(alphabet, 1 + (get_byte(v_bytes, i) % 32), 1);
    END LOOP;
    BEGIN
      INSERT INTO public.sessions (code, current_slide, presenter_id)
      VALUES (v_code, 'P1', p_user) RETURNING * INTO s;
      INSERT INTO public.presenter_sessions (session_id, presenter_user_id, presentation, workshop)
      VALUES (s.id, p_user, cfg.presentation, cfg.workshop);
      RETURN to_jsonb(s);
    EXCEPTION WHEN unique_violation THEN
      NULL; -- code collision, try another
    END;
  END LOOP;
  RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:unavailable';
END $$;

-- Operator tool (service role only): revoke every grant for one MainSite lead.
CREATE FUNCTION public.gate_revoke_lead(p_lead_ref text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  UPDATE public.access_grants SET revoked_at = now() WHERE lead_ref = p_lead_ref AND revoked_at IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

REVOKE ALL ON FUNCTION public.gate_redeem(text, text, text, text, text, text, text, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_resolve(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_check_access(text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_valid_value(jsonb, public.poll_type, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_submit_poll_response(text, uuid, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_my_responses(text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_story_volunteer(text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_story_word(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_authorize_presenter(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_create_presenter_session(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_revoke_lead(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_proven_presenter(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.gate_redeem(text, text, text, text, text, text, text, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.gate_check_access(text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.gate_submit_poll_response(text, uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.gate_my_responses(text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.gate_story_volunteer(text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.gate_story_word(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.gate_authorize_presenter(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.gate_create_presenter_session(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.gate_revoke_lead(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_proven_presenter(uuid) TO authenticated, service_role;
