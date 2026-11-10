-- STAGED — Stage 4 (activation) only. Policy changes only (no row data).
-- After this, attendees have NO direct write path: every attendee write goes through
-- submit-interaction → gate_* functions with a server-derived identity bound to one session.
-- Reads are untouched, so the stage display and phones keep seeing what they see today.

-- Sessions: created only by create-presenter-session (password-checked, service role).
DROP POLICY "Authenticated users can create sessions" ON public.sessions;

-- Responses: drop all attendee write policies; proven presenter keeps manual stage entries.
DROP POLICY "Participants can submit responses without sign-in" ON public.responses;
DROP POLICY "Participants can update responses without sign-in" ON public.responses;
DROP POLICY "Users can submit own responses" ON public.responses;
DROP POLICY "Users can update own responses" ON public.responses;
CREATE POLICY "Proven presenter can add responses" ON public.responses FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.polls p WHERE p.id = responses.poll_id AND public.is_proven_presenter(p.session_id)));

-- Story game: attendee volunteering and words only via gate_story_volunteer / gate_story_word.
DROP POLICY "Authenticated can volunteer" ON public.story_volunteers;
DROP POLICY "Presenter or self can update volunteers" ON public.story_volunteers;
DROP POLICY "Authenticated can add words" ON public.story_words;
CREATE POLICY "Proven presenter can add volunteers" ON public.story_volunteers FOR INSERT TO authenticated
  WITH CHECK (public.is_proven_presenter(session_id));
CREATE POLICY "Proven presenter can update volunteers" ON public.story_volunteers FOR UPDATE TO authenticated
  USING (public.is_proven_presenter(session_id)) WITH CHECK (public.is_proven_presenter(session_id));
CREATE POLICY "Proven presenter can add words" ON public.story_words FOR INSERT TO authenticated
  WITH CHECK (public.is_proven_presenter(session_id));

-- Unused by the deck (no client code writes them): closed for attendees, presenter only.
DROP POLICY "Authenticated can submit topics" ON public.story_topics;
DROP POLICY "Authenticated can vote" ON public.story_topic_votes;
DROP POLICY "Users can submit own big idea" ON public.big_idea_submissions;
CREATE POLICY "Proven presenter can add topics" ON public.story_topics FOR INSERT TO authenticated
  WITH CHECK (public.is_proven_presenter(session_id));

-- Legacy lead form: MainSite is the canonical capture.
DROP POLICY "Anyone can submit" ON public.connect_submissions;
