-- STAGED data step. Stage 3 (coordinated synthetic check) onward: allow attendee actions.
-- Each action still requires a valid MainSite token AND a live positive introspection.
UPDATE public.gate_config SET interactive_enabled = true, updated_at = now() WHERE id = 1;
