-- STAGED data step (run with the database data tool, not as a migration).
-- Stage 1: configuration present, interactive services in MAINTENANCE (attendee actions denied).
INSERT INTO public.gate_config (id, interactive_enabled, presentation_id, workshop_id)
VALUES (1, false, 16460, 9503);
