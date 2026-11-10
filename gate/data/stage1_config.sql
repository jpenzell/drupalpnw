-- STAGED data step (run with the database data tool, not as a migration).
-- Stage 1: configuration row present but redemption DISABLED — functions answer not_configured.
INSERT INTO public.gate_config (id, redeem_enabled, presentation, workshop)
VALUES (1, false, '16460', '9503');
