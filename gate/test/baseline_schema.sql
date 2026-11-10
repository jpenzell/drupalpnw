-- Local, disposable reproduction of the live backend pieces the gate touches, captured read-only
-- on 2026-11-10: tables/constraints, RLS enabled, every policy verbatim, full table grants to
-- anon/authenticated/service_role (as on the live backend), and Supabase's default EXECUTE grant
-- on new public functions. auth.uid()/auth.role() read the same request.jwt.* settings Supabase uses.

CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;

CREATE SCHEMA auth;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
CREATE TABLE auth.users (id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
  $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS
  $$ SELECT nullif(current_setting('request.jwt.claim.role', true), '')::text $$;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

CREATE TYPE public.poll_type AS ENUM ('multiple_choice', 'slider', 'text');

CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  current_slide text DEFAULT 'P1',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  presenter_id uuid REFERENCES auth.users(id)
);
CREATE TABLE public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  slide_id text NOT NULL,
  poll_type public.poll_type NOT NULL,
  poll_config jsonb DEFAULT '{}'::jsonb,
  is_open boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, slide_id)
);
CREATE TABLE public.responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  participant_id text NOT NULL,
  value jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poll_id, participant_id)
);
CREATE TABLE public.story_game_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES public.sessions(id) ON DELETE CASCADE,
  stage text NOT NULL DEFAULT 'collecting',
  max_volunteers integer DEFAULT 5,
  current_writer_position integer DEFAULT 1,
  topic text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.story_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  text text NOT NULL,
  submitted_by text NOT NULL,
  vote_count integer DEFAULT 0,
  is_winner boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.story_topic_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.story_topics(id) ON DELETE CASCADE,
  participant_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (topic_id, participant_id)
);
CREATE TABLE public.story_volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  participant_id text NOT NULL,
  participant_name text NOT NULL DEFAULT 'Writer',
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, participant_id),
  UNIQUE (session_id, position)
);
CREATE TABLE public.story_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  word text NOT NULL,
  added_by text NOT NULL,
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.big_idea_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  photo_url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.connect_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text, email text,
  linkedin_clicked boolean NOT NULL DEFAULT false,
  wants_slides boolean NOT NULL DEFAULT false,
  wants_followup boolean NOT NULL DEFAULT false,
  note text, user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

CREATE FUNCTION public.is_session_presenter(_session_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.sessions WHERE id = _session_id AND presenter_id = auth.uid())
$$;

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_topic_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.big_idea_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connect_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Presenter can delete submissions" ON public.big_idea_submissions FOR DELETE TO authenticated USING (is_session_presenter(session_id));
CREATE POLICY "Presenter or owner can view big idea submissions" ON public.big_idea_submissions FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR is_session_presenter(session_id)));
CREATE POLICY "Users can submit own big idea" ON public.big_idea_submissions FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Anyone can submit" ON public.connect_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Active session polls readable without sign-in" ON public.polls FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated users can read polls" ON public.polls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Presenter can create polls" ON public.polls FOR INSERT TO authenticated WITH CHECK (is_session_presenter(session_id));
CREATE POLICY "Presenter can update polls" ON public.polls FOR UPDATE TO authenticated USING (is_session_presenter(session_id));

CREATE POLICY "Active session responses readable without sign-in" ON public.responses FOR SELECT TO anon USING ((EXISTS (SELECT 1 FROM (polls p JOIN sessions s ON ((s.id = p.session_id))) WHERE ((p.id = responses.poll_id) AND s.is_active))));
CREATE POLICY "Participants can submit responses without sign-in" ON public.responses FOR INSERT TO anon WITH CHECK (((length(participant_id) > 0) AND (EXISTS (SELECT 1 FROM (polls p JOIN sessions s ON ((s.id = p.session_id))) WHERE ((p.id = responses.poll_id) AND s.is_active)))));
CREATE POLICY "Participants can update responses without sign-in" ON public.responses FOR UPDATE TO anon USING ((EXISTS (SELECT 1 FROM (polls p JOIN sessions s ON ((s.id = p.session_id))) WHERE ((p.id = responses.poll_id) AND s.is_active)))) WITH CHECK (((length(participant_id) > 0) AND (EXISTS (SELECT 1 FROM (polls p JOIN sessions s ON ((s.id = p.session_id))) WHERE ((p.id = responses.poll_id) AND s.is_active)))));
CREATE POLICY "Presenter can delete responses" ON public.responses FOR DELETE TO authenticated USING ((EXISTS (SELECT 1 FROM (polls p JOIN sessions s ON ((s.id = p.session_id))) WHERE ((p.id = responses.poll_id) AND (s.presenter_id = auth.uid())))));
CREATE POLICY "Presenter or own responses readable" ON public.responses FOR SELECT TO authenticated USING (((participant_id = (auth.uid())::text) OR (EXISTS (SELECT 1 FROM (polls p JOIN sessions s ON ((s.id = p.session_id))) WHERE ((p.id = responses.poll_id) AND (s.presenter_id = auth.uid()))))));
CREATE POLICY "Users can submit own responses" ON public.responses FOR INSERT TO authenticated WITH CHECK (((participant_id = (auth.uid())::text) OR (EXISTS (SELECT 1 FROM (polls p JOIN sessions s ON ((s.id = p.session_id))) WHERE ((p.id = responses.poll_id) AND (s.presenter_id = auth.uid()))))));
CREATE POLICY "Users can update own responses" ON public.responses FOR UPDATE TO authenticated USING ((participant_id = (auth.uid())::text));

CREATE POLICY "Active sessions readable without sign-in" ON public.sessions FOR SELECT TO anon USING ((is_active = true));
CREATE POLICY "Authenticated users can create sessions" ON public.sessions FOR INSERT TO authenticated WITH CHECK ((presenter_id = auth.uid()));
CREATE POLICY "Only presenter can update session" ON public.sessions FOR UPDATE TO authenticated USING ((presenter_id = auth.uid()));
CREATE POLICY "Presenter or active sessions readable" ON public.sessions FOR SELECT TO authenticated USING (((presenter_id = auth.uid()) OR (is_active = true)));

CREATE POLICY "Authenticated can read game state" ON public.story_game_state FOR SELECT TO authenticated USING (true);
CREATE POLICY "Presenter can create game state" ON public.story_game_state FOR INSERT TO authenticated WITH CHECK (is_session_presenter(session_id));
CREATE POLICY "Presenter can update game state" ON public.story_game_state FOR UPDATE TO authenticated USING (is_session_presenter(session_id));

CREATE POLICY "Authenticated can read votes" ON public.story_topic_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can vote" ON public.story_topic_votes FOR INSERT TO authenticated WITH CHECK (((participant_id = (auth.uid())::text) OR (EXISTS (SELECT 1 FROM (story_topics t JOIN sessions s ON ((s.id = t.session_id))) WHERE ((t.id = story_topic_votes.topic_id) AND (s.presenter_id = auth.uid()))))));

CREATE POLICY "Authenticated can read topics" ON public.story_topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can submit topics" ON public.story_topics FOR INSERT TO authenticated WITH CHECK (((submitted_by = (auth.uid())::text) OR is_session_presenter(session_id)));
CREATE POLICY "Presenter can update topics" ON public.story_topics FOR UPDATE TO authenticated USING (is_session_presenter(session_id));

CREATE POLICY "Authenticated can read volunteers" ON public.story_volunteers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can volunteer" ON public.story_volunteers FOR INSERT TO authenticated WITH CHECK (((participant_id = (auth.uid())::text) OR is_session_presenter(session_id)));
CREATE POLICY "Presenter or self can update volunteers" ON public.story_volunteers FOR UPDATE TO authenticated USING ((is_session_presenter(session_id) OR (participant_id = (auth.uid())::text)));

CREATE POLICY "Authenticated can add words" ON public.story_words FOR INSERT TO authenticated WITH CHECK (((added_by = (auth.uid())::text) OR is_session_presenter(session_id)));
CREATE POLICY "Authenticated can read words" ON public.story_words FOR SELECT TO authenticated USING (true);
