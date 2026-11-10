-- STAGED — reverses 02_enforce.sql to the exact policies captured from the live backend on
-- 2026-11-10 (verified by gate/test/sql.test.ts: policy snapshot after rollback == baseline).
-- Pair with gate/data/rollback_disable.sql and redeploying the unguarded paid functions.

DROP POLICY IF EXISTS "Proven presenter can add responses" ON public.responses;
DROP POLICY IF EXISTS "Proven presenter can add volunteers" ON public.story_volunteers;
DROP POLICY IF EXISTS "Proven presenter can update volunteers" ON public.story_volunteers;
DROP POLICY IF EXISTS "Proven presenter can add words" ON public.story_words;
DROP POLICY IF EXISTS "Proven presenter can add topics" ON public.story_topics;

CREATE POLICY "Authenticated users can create sessions" ON public.sessions FOR INSERT TO authenticated
  WITH CHECK (presenter_id = auth.uid());

CREATE POLICY "Participants can submit responses without sign-in" ON public.responses FOR INSERT TO anon
  WITH CHECK ((length(participant_id) > 0) AND (EXISTS (SELECT 1 FROM (polls p JOIN sessions s ON ((s.id = p.session_id))) WHERE ((p.id = responses.poll_id) AND s.is_active))));
CREATE POLICY "Participants can update responses without sign-in" ON public.responses FOR UPDATE TO anon
  USING ((EXISTS (SELECT 1 FROM (polls p JOIN sessions s ON ((s.id = p.session_id))) WHERE ((p.id = responses.poll_id) AND s.is_active))))
  WITH CHECK ((length(participant_id) > 0) AND (EXISTS (SELECT 1 FROM (polls p JOIN sessions s ON ((s.id = p.session_id))) WHERE ((p.id = responses.poll_id) AND s.is_active))));
CREATE POLICY "Users can submit own responses" ON public.responses FOR INSERT TO authenticated
  WITH CHECK (((participant_id = (auth.uid())::text) OR (EXISTS (SELECT 1 FROM (polls p JOIN sessions s ON ((s.id = p.session_id))) WHERE ((p.id = responses.poll_id) AND (s.presenter_id = auth.uid()))))));
CREATE POLICY "Users can update own responses" ON public.responses FOR UPDATE TO authenticated
  USING ((participant_id = (auth.uid())::text));

CREATE POLICY "Authenticated can volunteer" ON public.story_volunteers FOR INSERT TO authenticated
  WITH CHECK (((participant_id = (auth.uid())::text) OR is_session_presenter(session_id)));
CREATE POLICY "Presenter or self can update volunteers" ON public.story_volunteers FOR UPDATE TO authenticated
  USING ((is_session_presenter(session_id) OR (participant_id = (auth.uid())::text)));
CREATE POLICY "Authenticated can add words" ON public.story_words FOR INSERT TO authenticated
  WITH CHECK (((added_by = (auth.uid())::text) OR is_session_presenter(session_id)));
CREATE POLICY "Authenticated can submit topics" ON public.story_topics FOR INSERT TO authenticated
  WITH CHECK (((submitted_by = (auth.uid())::text) OR is_session_presenter(session_id)));
CREATE POLICY "Authenticated can vote" ON public.story_topic_votes FOR INSERT TO authenticated
  WITH CHECK (((participant_id = (auth.uid())::text) OR (EXISTS (SELECT 1 FROM (story_topics t JOIN sessions s ON ((s.id = t.session_id))) WHERE ((t.id = story_topic_votes.topic_id) AND (s.presenter_id = auth.uid()))))));
CREATE POLICY "Users can submit own big idea" ON public.big_idea_submissions FOR INSERT TO authenticated
  WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "Anyone can submit" ON public.connect_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (true);
