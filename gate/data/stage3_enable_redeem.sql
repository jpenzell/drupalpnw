-- STAGED data step. Stage 3 (MainSite synthetic check) onward: allow token redemption.
UPDATE public.gate_config SET redeem_enabled = true, updated_at = now() WHERE id = 1;
