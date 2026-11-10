# PNW2 interactive gate — staged, not active

Everything under `gate/` is inert. It is not in `supabase/functions/` and it is not a database migration, so nothing deploys from here. The only page-side files are in `src/lib/gate/`. Nothing imports them yet, and `GATE_MODE = "off"`.

## Baseline (verified 2026-11-10)
- **Published site:** `https://drupalpnw.lovable.app`, bundle `index-BJwF2DXK.js`. This matches commit `8ee343f` ("Added QR to first slide"). The sponsor-slide layout classes from that commit are present in the live bundle.
- **`8ee343f` to the pre-gate HEAD:** the only changes are `.lovable/plan.md` and the auto-generated `src/integrations/supabase/previewAuthStorage.ts` (a platform file for preview-only login sharing). No deck content changed.
- **Candidate diff:** the pre-gate HEAD plus this folder, `src/lib/gate/*`, `AGENTS.md` and `roadmap.md`. Publishing now would ship no behavior change, because the gate module is unused.

## Required inputs from MainSite (final contract)
1. JWKS URL, `kid`(s) and algorithm (EdDSA or ES256).
2. The exact `postMessage` shape: request type, reply type, field names, and how renewal is triggered.
3. The claim names for presentation and workshop, assumed to be `presentation` and `workshop`. Also: is `session_code` included?
4. The iframe parent origin, assumed to be exactly `https://www.joshpenzell.com`, and the `sandbox`/`allow` attributes MainSite uses.
5. A synthetic test key and token procedure for the Stage 3 check.

The config needed here: secret `MAINSITE_JWKS_URL`, and `PNW2_ALLOWED_ORIGINS` (default `https://drupalpnw.lovable.app`). `PRESENTATION_PASSWORD` already exists.

## Protected surface under enforcement

| Item | Under enforcement |
|---|---|
| `responses`, `story_*`, `big_idea_submissions` | No direct attendee writes. Attendee writes go only through `submit-interaction`, using an identity taken from the grant. |
| `sessions` | Only `create-presenter-session` can create them (password plus a verified login). |
| Paid functions: `probability-words-live`, `probability-words-persona`, `multi-ai-estimate`, `pick-number`, `random-number-demo`, `josh-gpt`, `scene-rehearsal`, `live-ai-demo`, `presentation-ai-assistant`, `transform-headshot`, `regenerate-era-image`, `test-prompt` | Each starts with `requireInteractiveAccess`: a live grant or a proven presenter, otherwise 401. CORS is limited to the allowed origins. |
| `send-connect-notification` | Not called on the new path. MainSite sends no automatic email from PNW2. The legacy `connect_submissions` insert is closed. |
| Free: deck viewing (non-interactive), captions, `translate-caption` | No gate. The recording, transcript and TXT live on MainSite. |

## Staged activation
Backend steps take effect immediately on the shared backend. Page steps take effect only on Publish.

0. **Now:** this folder plus tests. No backend or page behavior change.
1. **Dormant backend.**
   - Apply `migrations/01_dormant_gate_tables.sql` (additive; `enforce=false`).
   - Deploy `redeem-access`, `submit-interaction` and `create-presenter-session`.
   - Today's policies are not touched, so the live site keeps working.
2. **Dual-path page.**
   - Wire `src/lib/gate` behind `gate_config.enforce`. While it is false, polls use the old path.
   - Presenter session creation moves to the password function.
   - Publish this step on its own, with the diff reviewed against the baseline above.
3. **MainSite check.** One synthetic token, end to end. No real leads.
4. **Activate.**
   - Add `requireInteractiveAccess` to the paid functions.
   - Apply `migrations/02_enforce.sql`.
   - Then the page flips to redirecting standalone visits to the MainSite capture URL.
5. **Rollback.**
   - Apply `migrations/99_rollback_enforce.sql`, which restores the exact policies captured today.
   - Redeploy the paid functions without the guard.

## Tests
`bun test ./gate/functions/_shared/accessToken.test.ts ./src/lib/gate/parentHandshake.test.ts` (synthetic keys only).
