-- STAGED — apply only at Stage 1 of gate/README.md. Additive; changes no existing access.
CREATE TABLE public.gate_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enforce boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gate_config TO anon, authenticated;
GRANT ALL ON public.gate_config TO service_role;
ALTER TABLE public.gate_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gate flag is public" ON public.gate_config FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.gate_config (id, enforce) VALUES (1, false);

CREATE TABLE public.access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jti text NOT NULL UNIQUE,
  lead_ref text NOT NULL,          -- opaque MainSite sub; no name/email
  participant_key text NOT NULL,   -- server-derived response identity
  session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  grant_hash text NOT NULL UNIQUE, -- sha256 of the opaque grant handed to the browser
  expires_at timestamptz NOT NULL, -- equals the token's exp; never extended
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.access_grants TO service_role;  -- no anon/authenticated access at all
ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.presenter_sessions (
  session_id uuid PRIMARY KEY REFERENCES public.sessions(id) ON DELETE CASCADE,
  presenter_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.presenter_sessions TO service_role;  -- written only by create-presenter-session
ALTER TABLE public.presenter_sessions ENABLE ROW LEVEL SECURITY;
