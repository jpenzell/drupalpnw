# Stage 4 (enforce): backend applied 2026-11-11 05:06–05:08 UTC; page switched in source, NOT published

## Acceptance carried in (from root)
- Real framed handoff: identify POST 200 at 04:31:15 UTC; natural renewal POST 200 at 04:35:16 UTC.
- One real QA lead persisted on MainSite (site 1210 / presentation 522 / HubSpot 591275144938), verified by root.
- **Live revocation NOT tested.** MainSite's supported production database access is read-only and no revoke
  endpoint exists, so no revocation was executed. Revoked-grant denial is proven only offline:
  - `gate.integration.test.ts` "revocation takes effect on the very next action": next action → 401
    `access_revoked`, and (added in this stage) the same revoked grant is refused by the paid-function guard;
  - verifier suite: `{active:false}` / 401 introspection → `access_revoked`; every non-positive reply fails closed;
  - `gateCore.test.ts` "server denial (revoked / maintenance) leaves no access";
  - offline browser `revoked: denied notice offers the event page`.

## Pre-flight (no drift)
- Live policies: deck tables 32 / `b1c83ed64863d09a0e83aa8bd65aed2e`, all public 41 / `4408c27df26a532757700d387ba553a3`
  (formula: md5 of `tablename|policyname|cmd|roles|qual|with_check`, newline-joined, ordered) — same as Stage 1/3.
- `generate-guarded --check` clean; all 7 shared modules and both gate functions byte-identical to `gate/`.
- No commit touched `supabase/functions` since Stage 1 (`18e2cf9`). Gate tests 69/69 before changes.

## Functions deployed (05:06 UTC), each byte-identical to its `gate/functions/<name>/index.ts`
| Function | file sha256 | deploy source_sha256 (bundle) |
|---|---|---|
| josh-gpt | 160b2cd108a7de29… | bf5916a9284ae65e… |
| live-ai-demo | 542dd4be51e23ab7… | e75a01c24ac6ad93… |
| multi-ai-estimate | 134735d97fc9f6f2… | edead97356f6f601… |
| pick-number | 60970d9fcdf8898f… | 11348c8c4245bf35… |
| presentation-ai-assistant | e9b8818c35e66a06… | 51f6d452a09ddb38… |
| probability-words-live | 776eea25bd75bcc2… | 5791195d3f7d7f13… |
| probability-words-persona | 0f719d9ab3867f03… | 84575f687273b5bc… |
| random-number-demo | b89159b9e727a332… | 8242b2e2daa061c8… |
| regenerate-era-image | d28ad6e88c9a4327… | 18695693caee0a03… |
| scene-rehearsal | e81c8f2c8ca3f56f… | b4ad28ab8ece3a3e… |
| test-prompt | 6e87fc9dfd7bec8b… | 52976a4a26ffcfa5… |
| transform-headshot | 17072ccd547963b6… | d523e53a05ca3867… |
| send-connect-notification (retired) | 90005447ff77a445… | 606417f8af072156… |

`deno check` clean on all 13. Pre-guard sources preserved as reference only in `gate/originals/` (never redeploy).

**Live denials (05:06 UTC, empty body, nothing reached a provider):** all 12 paid functions → no token 401
`access_required`, publishable key 401 `access_required`, foreign origin 403, preflight `Access-Control-Allow-Origin:
https://drupalpnw.lovable.app` (no wildcard). Forged EdDSA tokens (throwaway key; real kid and unknown kid) → 401.
`send-connect-notification` → 410 `retired`, no email. Boot logs clean.

## Migration (05:07 UTC)
- `drizzle/migrations/0004_pnw2_gate_stage4_enforce.sql` (journal idx 4), sha256
  `4194ec6109d4e100196b3cda84dfcc118f2f92f786465c0db00600aec88fbd73`, byte-identical to `gate/migrations/02_enforce.sql`.
- Policy audit after: deck tables 25 / `d54c8e8cec93056afb1dc63ed3513626` — exactly the snapshot produced by
  baseline + 01 + 02 on the local test Postgres (`gate/test/enforced_digest.ts`). Non-deck policies still 9 (all public 34).
- 12 dropped (sessions insert; 4 response writes; volunteer insert/update; word insert; topic insert; vote; big idea;
  connect_submissions insert), 5 added (proven-presenter inserts on responses, volunteers, words, topics; volunteer update).
- Every SELECT policy kept (12): anon reads of active sessions, polls, responses still 200.
- Live anon REST probes: inserts into connect_submissions, sessions, responses, story_volunteers → 42501; response update → 0 rows.
- Rows unchanged: sessions 375 (370 active), polls 240, responses 180, connect_submissions 19, story volunteers/words 0,
  big idea 0, presenter_authorizations 0, presenter_sessions 0.
- Config unchanged: `interactive_enabled=true`, 16460 / 9503, `canonical_session_id=null` (updated 2026-11-11T04:19:27Z).

## Page (source only)
- `src/lib/gate/config.ts`: `GATE_MODE` "dual" → "enforce" (+ comment). The 95ef338 frame fix is untouched.
- Live site still serves dual `index-DGjbhbC1.js` until root publishes.
- **Interim, until that publish:** framed attendees with a MainSite token keep working (token path). Standalone visitors
  on the dual page fall back to the old anonymous path, which is now refused (writes 42501, paid demos 401) — fail closed.

## Checks after
- Gate tests 69/69 (now also assert deployed files equal the guarded copies / retired stub, and revoked grant denied by
  the paid guard). App tests 21/21. `tsgo -b --noEmit` clean. Preview build OK.
- Offline browser (fake backend, all other network aborted): enforce acceptance 36/36; returning-browser frame check
  14/14 on the dual build and 14/14 on the enforce build (`GATE_FRAME_DIST=/tmp/gatetest/dist`).

## Rollback
`gate/data/rollback_maintenance.sql` only (maintenance; enforced policies and guards stay). Never redeploy `gate/originals/`.

## Remaining browser acceptance (after root publishes)
1. Live bundle name changes from `index-DGjbhbC1.js`; it contains `"enforce"`.
2. Framed MainSite visit: identify 200, not-running notice, Next works, one self-guided paid demo succeeds with the token.
3. Direct `https://drupalpnw.lovable.app/` (and `/connect`, `/?join=…`) redirects to the MainSite capture page.
4. `/presenter` with the password still opens the stage deck; no session auto-created.
5. Live revocation stays untested until MainSite has a supported revoke path.
