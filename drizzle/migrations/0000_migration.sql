ALTER PUBLICATION supabase_realtime ADD TABLE public.responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
ALTER TABLE public.responses REPLICA IDENTITY FULL;
ALTER TABLE public.polls REPLICA IDENTITY FULL;