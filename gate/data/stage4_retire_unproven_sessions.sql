-- STAGED data step, OPTIONAL at Stage 4 (needs explicit approval): close live sessions that
-- were not created through the password-checked path (old test sessions such as TQR1).
-- Attendees are only ever bound to the canonical session anyway; this only stops old ones reading as active.
UPDATE public.sessions SET is_active = false
WHERE is_active IS TRUE AND id NOT IN (SELECT session_id FROM public.presenter_sessions);
