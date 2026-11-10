-- STAGED rollback (data step). Puts interactive services into MAINTENANCE: every attendee action and
-- attendee paid-function call is denied immediately. It deliberately does NOT reopen any old
-- anonymous write policy (02_enforce stays in force) and drops nothing; free recording/transcript
-- on MainSite and read-only deck viewing are unaffected. Pair with MainSite revoking grants as authorized.
UPDATE public.gate_config SET interactive_enabled = false, updated_at = now() WHERE id = 1;
