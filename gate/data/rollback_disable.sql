-- STAGED data step for rollback: stop issuing new grants immediately (existing ones lapse
-- within five minutes because grants never outlive their token).
UPDATE public.gate_config SET redeem_enabled = false, updated_at = now() WHERE id = 1;
