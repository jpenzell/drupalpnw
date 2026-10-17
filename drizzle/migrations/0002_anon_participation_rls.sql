-- Participants join on phones via a shared venue network, and anonymous
-- sign-up is rate-limited per IP. Allow unauthenticated participants to
-- read the active session, its polls, and answer them.

CREATE POLICY "Active sessions readable without sign-in"
  ON public.sessions
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Active session polls readable without sign-in"
  ON public.polls
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Active session responses readable without sign-in"
  ON public.responses
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1
      FROM public.polls p
      JOIN public.sessions s ON s.id = p.session_id
      WHERE p.id = responses.poll_id
        AND s.is_active
    )
  );

CREATE POLICY "Participants can submit responses without sign-in"
  ON public.responses
  FOR INSERT
  TO anon
  WITH CHECK (
    length(participant_id) > 0
    AND EXISTS (
      SELECT 1
      FROM public.polls p
      JOIN public.sessions s ON s.id = p.session_id
      WHERE p.id = responses.poll_id
        AND s.is_active
    )
  );

CREATE POLICY "Participants can update responses without sign-in"
  ON public.responses
  FOR UPDATE
  TO anon
  USING (
    EXISTS (
      SELECT 1
      FROM public.polls p
      JOIN public.sessions s ON s.id = p.session_id
      WHERE p.id = responses.poll_id
        AND s.is_active
    )
  )
  WITH CHECK (
    length(participant_id) > 0
    AND EXISTS (
      SELECT 1
      FROM public.polls p
      JOIN public.sessions s ON s.id = p.session_id
      WHERE p.id = responses.poll_id
        AND s.is_active
    )
  );

GRANT SELECT ON public.sessions TO anon;
GRANT SELECT ON public.polls TO anon;
GRANT SELECT, INSERT, UPDATE ON public.responses TO anon;