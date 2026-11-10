-- STAGED — apply only at Stage 4 (activation), together with the page publish.
-- Removes every direct attendee write path; presenter writes stay via presenter_id = auth.uid()
-- AND a server-recorded presenter_sessions row.

UPDATE public.gate_config SET enforce = true, updated_at = now() WHERE id = 1;

-- Sessions: only create-presenter-session (service role) may create them.
DROP POLICY "Authenticated users can create sessions" ON public.sessions;

CREATE OR REPLACE FUNCTION public.is_proven_presenter(_session_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sessions s JOIN public.presenter_sessions ps ON ps.session_id = s.id
    WHERE s.id = _session_id AND s.presenter_id = auth.uid() AND ps.presenter_user_id = auth.uid()
  )
$$;

-- Responses: attendee writes only via submit-interaction (service role).
DROP POLICY "Participants can submit responses without sign-in" ON public.responses;
DROP POLICY "Participants can update responses without sign-in" ON public.responses;
DROP POLICY "Users can submit own responses" ON public.responses;
DROP POLICY "Users can update own responses" ON public.responses;
CREATE POLICY "Proven presenter can write responses" ON public.responses FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.polls p WHERE p.id = responses.poll_id AND public.is_proven_presenter(p.session_id)));

-- Story game and big-idea writes: proven presenter only (attendee actions to be routed through submit-interaction).
DROP POLICY "Authenticated can vote" ON public.story_topic_votes;
DROP POLICY "Authenticated can submit topics" ON public.story_topics;
DROP POLICY "Authenticated can volunteer" ON public.story_volunteers;
DROP POLICY "Presenter or self can update volunteers" ON public.story_volunteers;
DROP POLICY "Authenticated can add words" ON public.story_words;
DROP POLICY "Users can submit own big idea" ON public.big_idea_submissions;
CREATE POLICY "Proven presenter can add topics" ON public.story_topics FOR INSERT TO authenticated WITH CHECK (public.is_proven_presenter(session_id));
CREATE POLICY "Proven presenter can manage volunteers" ON public.story_volunteers FOR ALL TO authenticated USING (public.is_proven_presenter(session_id)) WITH CHECK (public.is_proven_presenter(session_id));
CREATE POLICY "Proven presenter can add words" ON public.story_words FOR INSERT TO authenticated WITH CHECK (public.is_proven_presenter(session_id));

-- Legacy lead form: MainSite is canonical.
DROP POLICY "Anyone can submit" ON public.connect_submissions;
