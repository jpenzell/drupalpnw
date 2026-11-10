-- STAGED — Stage 1 only (see gate/README.md). Purely additive: no existing table, policy or
-- grant is touched, so the live deck keeps working exactly as today. No row data here; the
-- configuration row is written by gate/data/*.sql at the matching stage.
-- Every gate_* function is SECURITY DEFINER and executable ONLY by service_role (edge functions),
-- so no browser role gains any capability from this file.
-- Attendee authority is NOT stored here: MainSite owns it, and the edge function verifies the
-- signed token and introspects it live on every action before calling these functions with the
-- server-derived participant key. Deck entry and self-guided demos need no live session; only live
-- writes (polls, story) need the event's canonical session, chosen server-side. Nothing here creates,
-- closes or deletes sessions except the presenter's deliberate password-checked create.

CREATE TABLE public.gate_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  interactive_enabled boolean NOT NULL DEFAULT false, -- false = maintenance: attendee actions denied
  presentation_id integer NOT NULL,
  workshop_id integer NOT NULL,
  canonical_session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
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
  presentation_id integer NOT NULL,
  workshop_id integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.presenter_sessions TO service_role;
ALTER TABLE public.presenter_sessions ENABLE ROW LEVEL SECURITY;

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

-- Internal: validates the server-derived key and that interactive services are enabled
-- (false = maintenance, which is also the rollback state).
CREATE FUNCTION public.gate_require_enabled(p_participant_key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cfg public.gate_config%ROWTYPE;
BEGIN
  IF p_participant_key IS NULL OR p_participant_key !~ '^lead_[0-9a-f]{32}$' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:malformed';
  END IF;
  SELECT * INTO cfg FROM public.gate_config WHERE id = 1;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:not_configured'; END IF;
  IF cfg.interactive_enabled IS NOT TRUE THEN RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:maintenance'; END IF;
END $$;

-- Internal: the event's canonical LIVE session if one is running, else NULL. Chosen server-side only;
-- never created or closed here.
CREATE FUNCTION public.gate_canonical_session()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.id
  FROM public.gate_config cfg
  JOIN public.sessions s ON s.id = cfg.canonical_session_id
  JOIN public.presenter_sessions ps ON ps.session_id = s.id
  WHERE cfg.id = 1 AND s.is_active IS TRUE
    AND ps.presentation_id = cfg.presentation_id AND ps.workshop_id = cfg.workshop_id
$$;

-- Internal: live writes (polls, story) only — require the running canonical session.
CREATE FUNCTION public.gate_attendee_session(p_participant_key text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_session uuid;
BEGIN
  PERFORM public.gate_require_enabled(p_participant_key);
  v_session := public.gate_canonical_session();
  IF v_session IS NULL THEN RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:session_inactive'; END IF;
  RETURN v_session;
END $$;

-- Deck entry for a verified+introspected attendee. Works with no live session (post-event,
-- self-guided use): session is then NULL and only live writes are unavailable.
CREATE FUNCTION public.gate_identify(p_participant_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_session uuid; s jsonb;
BEGIN
  PERFORM public.gate_require_enabled(p_participant_key);
  v_session := public.gate_canonical_session();
  IF v_session IS NOT NULL THEN
    SELECT jsonb_build_object('id', id, 'code', code, 'current_slide', current_slide, 'is_active', is_active, 'created_at', created_at)
    INTO s FROM public.sessions WHERE id = v_session;
  END IF;
  RETURN jsonb_build_object('participant_key', p_participant_key, 'session', s);
END $$;

-- For guarded paid functions (self-guided demos, no session data mutated): a verified+introspected
-- attendee while interactive services are enabled — no live session needed — or a
-- password-authorized presenter.
CREATE FUNCTION public.gate_check_access(p_participant_key text, p_presenter_user uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_participant_key IS NOT NULL THEN
    BEGIN
      PERFORM public.gate_require_enabled(p_participant_key);
      RETURN jsonb_build_object('kind', 'attendee', 'participant_key', p_participant_key);
    EXCEPTION WHEN SQLSTATE 'P0001' THEN
      RETURN NULL; -- attendees never fall through to presenter checks
    END;
  END IF;
  IF p_presenter_user IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.presenter_authorizations a WHERE a.user_id = p_presenter_user AND a.expires_at > now()
  ) THEN
    RETURN jsonb_build_object('kind', 'presenter', 'user_id', p_presenter_user);
  END IF;
  RETURN NULL;
END $$;

-- Presenter entry check for the standalone deck: authorization expiry, or NULL.
CREATE FUNCTION public.gate_presenter_status(p_user uuid)
RETURNS timestamptz LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.expires_at FROM public.presenter_authorizations a WHERE a.user_id = p_user AND a.expires_at > now()
$$;

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

CREATE FUNCTION public.gate_submit_poll_response(p_participant_key text, p_poll_id uuid, p_value jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_session uuid := public.gate_attendee_session(p_participant_key); p public.polls%ROWTYPE; r jsonb;
BEGIN
  SELECT * INTO p FROM public.polls WHERE id = p_poll_id;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:poll_not_found'; END IF;
  IF p.session_id <> v_session THEN RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:wrong_session'; END IF;
  IF p.is_open IS FALSE THEN RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:poll_closed'; END IF;
  IF NOT public.gate_valid_value(p_value, p.poll_type, coalesce(p.poll_config, '{}'::jsonb)) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:invalid_value';
  END IF;
  INSERT INTO public.responses (poll_id, participant_id, value)
  VALUES (p.id, p_participant_key, p_value)
  ON CONFLICT (poll_id, participant_id) DO UPDATE SET value = EXCLUDED.value
  RETURNING to_jsonb(responses.*) INTO r;
  RETURN r;
END $$;

CREATE FUNCTION public.gate_my_responses(p_participant_key text, p_poll_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_session uuid := public.gate_attendee_session(p_participant_key); v_poll_session uuid;
BEGIN
  SELECT session_id INTO v_poll_session FROM public.polls WHERE id = p_poll_id;
  IF v_poll_session IS NULL OR v_poll_session <> v_session THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:wrong_session';
  END IF;
  RETURN coalesce((SELECT jsonb_agg(to_jsonb(r.*)) FROM public.responses r
                   WHERE r.poll_id = p_poll_id AND r.participant_id = p_participant_key), '[]'::jsonb);
END $$;

-- Positions follow the deck: 1..999 writer slots, 1000..9999 lottery pool, >=10000 discarded.
CREATE FUNCTION public.gate_story_volunteer(p_participant_key text, p_name text, p_mode text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_session uuid := public.gate_attendee_session(p_participant_key);
        v_name text := btrim(p_name); v_max integer; v_n integer; v_top integer; r jsonb;
BEGIN
  IF v_name IS NULL OR length(v_name) NOT BETWEEN 1 AND 40 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:invalid_name';
  END IF;
  IF p_mode IS NULL OR p_mode NOT IN ('slot', 'lottery') THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:malformed';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('story:' || v_session::text, 0));

  SELECT to_jsonb(v.*) INTO r FROM public.story_volunteers v
  WHERE v.session_id = v_session AND v.participant_id = p_participant_key;
  IF r IS NOT NULL THEN RETURN r; END IF; -- one entry per lead per session

  IF p_mode = 'slot' THEN
    SELECT max_volunteers INTO v_max FROM public.story_game_state WHERE session_id = v_session;
    v_max := coalesce(v_max, 3);
    SELECT count(*), coalesce(max(position), 0) INTO v_n, v_top
    FROM public.story_volunteers WHERE session_id = v_session AND position < 1000;
    IF v_n >= v_max OR v_top + 1 >= 1000 THEN RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:full'; END IF;
  ELSE
    SELECT coalesce(max(position), 1000) INTO v_top
    FROM public.story_volunteers WHERE session_id = v_session AND position >= 1000 AND position < 10000;
    IF v_top + 1 >= 10000 THEN RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:full'; END IF;
  END IF;

  INSERT INTO public.story_volunteers (session_id, participant_id, participant_name, position)
  VALUES (v_session, p_participant_key, v_name, v_top + 1)
  RETURNING to_jsonb(story_volunteers.*) INTO r;
  RETURN r;
END $$;

CREATE FUNCTION public.gate_story_word(p_participant_key text, p_word text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_session uuid := public.gate_attendee_session(p_participant_key);
        gs public.story_game_state%ROWTYPE; v_word text := btrim(p_word); v_pos integer; v_n integer; r jsonb;
BEGIN
  IF v_word IS NULL OR length(v_word) NOT BETWEEN 1 AND 40 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:invalid_word';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('story:' || v_session::text, 0));
  SELECT * INTO gs FROM public.story_game_state WHERE session_id = v_session;
  IF NOT FOUND OR NOT EXISTS (
    SELECT 1 FROM public.story_volunteers v
    WHERE v.session_id = v_session AND v.participant_id = p_participant_key
      AND v.position < 1000 AND v.position = coalesce(gs.current_writer_position, 1)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:not_your_turn';
  END IF;
  SELECT coalesce(max(position), 0) + 1 INTO v_pos FROM public.story_words WHERE session_id = v_session;
  INSERT INTO public.story_words (session_id, word, added_by, position)
  VALUES (v_session, v_word, p_participant_key, v_pos)
  RETURNING to_jsonb(story_words.*) INTO r;
  SELECT count(*) INTO v_n FROM public.story_volunteers WHERE session_id = v_session AND position < 1000;
  UPDATE public.story_game_state
  SET current_writer_position = (coalesce(current_writer_position, 1) % greatest(v_n, 1)) + 1, updated_at = now()
  WHERE session_id = v_session;
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

-- Creates a session for the configured event and makes it the canonical one attendees use.
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
  SELECT * INTO cfg FROM public.gate_config WHERE id = 1 FOR UPDATE;
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
      INSERT INTO public.presenter_sessions (session_id, presenter_user_id, presentation_id, workshop_id)
      VALUES (s.id, p_user, cfg.presentation_id, cfg.workshop_id);
      UPDATE public.gate_config SET canonical_session_id = s.id, updated_at = now() WHERE id = 1;
      RETURN to_jsonb(s);
    EXCEPTION WHEN unique_violation THEN
      NULL; -- code collision, try another
    END;
  END LOOP;
  RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'gate:unavailable';
END $$;

REVOKE ALL ON FUNCTION public.gate_require_enabled(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_canonical_session() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_attendee_session(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_presenter_status(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_identify(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_check_access(text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_valid_value(jsonb, public.poll_type, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_submit_poll_response(text, uuid, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_my_responses(text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_story_volunteer(text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_story_word(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_authorize_presenter(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gate_create_presenter_session(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_proven_presenter(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.gate_identify(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.gate_check_access(text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.gate_submit_poll_response(text, uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.gate_my_responses(text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.gate_story_volunteer(text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.gate_story_word(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.gate_authorize_presenter(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.gate_presenter_status(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.gate_create_presenter_session(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_proven_presenter(uuid) TO authenticated, service_role;
