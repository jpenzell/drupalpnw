# PNW2 interactive gate: staged and inactive

Nothing in this folder is deployed, migrated or published.

- **Server code:** `gate/functions/*` sits outside `supabase/functions/`, so nothing there deploys.
- **SQL:** `gate/migrations/*` and `gate/data/*` have not been applied. Database changes take effect immediately on the shared live backend, which is why they stay here until the right stage.
- **Page code:** the code in `src/lib/gate/*` is compiled into the app but stays inactive while `GATE_MODE = "off"`. With the flag off, every attendee write and every paid-function call runs the exact code it ran before; it is only wrapped in `gate.route(...)` or `invokeFunction(...)`.

## Published vs candidate

**Evidence, not attestation.** The live bundle `index-BJwF2DXK.js` on `https://drupalpnw.lovable.app` contains the sponsor-slide layout class strings introduced in commit `8ee343f` ("Added QR to first slide"). It also contains every earlier feature marker checked. This shows the live build is at or after `8ee343f`. It does not prove that `8ee343f` is the exact published commit, because the hosting service exposes no commit id. A byte-level comparison would need a build of `8ee343f` with identical tooling, and that was not done.

**Candidate vs `8ee343f`:** `git diff --stat 8ee343f` shows 75 files.

| Area | What changed |
|---|---|
| `gate/**` | New, inert. |
| `src/lib/gate/**` | New gate modules and tests. |
| `src/contexts/SessionContext.tsx`, `src/contexts/PollContext.tsx` | Gate branches that only run when `GATE_MODE !== "off"`. |
| `OneWordStoryScreen`, `ElephantQuestionScreen`, `TrueRandomScreen` | Attendee writes wrapped in `gate.route`. With the flag off they run the original code. |
| 22 call sites in 16 files | `supabase.functions.invoke` → `invokeFunction` for the 12 paid functions. With the flag off this is identical. |
| `src/pages/Connect.tsx` | Gate-on branch: no legacy row, no email; opens MainSite capture instead. |
| `src/integrations/supabase/previewAuthStorage.ts` | Platform-generated preview login sharing; not from the gate work. |
| `AGENTS.md`, `roadmap.md`, `.lovable/plan*` | Notes and plans. |

No slide content, running order or presenter controls changed.

## Required inputs still missing from MainSite (the final contract)
1. JWKS URL (https), `kid`s, and whether the algorithm is EdDSA or ES256. Goes into secret `MAINSITE_JWKS_URL`.
2. The exact `postMessage` names for the request, reply and renewal, and the reply's field name. Placeholder today: `HANDSHAKE_MESSAGE_TYPE` in `src/lib/gate/config.ts`.
3. The claim names for presentation and workshop. Assumed `presentation` and `workshop`, as string or integer. Also: is `session_code` carried in the token? If not, the page sends the code the attendee joined with, and the server binds the grant to that one session.
4. Exact parent origin, assumed `https://www.joshpenzell.com`, and the iframe `src` MainSite will use, with or without `?join=CODE`.
5. A synthetic test key and token procedure for Stage 3.

Already present: the `PRESENTATION_PASSWORD` secret. Optional: `PNW2_ALLOWED_ORIGINS` (default `https://drupalpnw.lovable.app`).

## What is protected once enforced

**Attendee writes**
- Attendees can only write through `submit-interaction`. It supports four actions: `poll_response`, `my_responses`, `story_volunteer` and `story_word`.
- Each action resolves the grant in the database. The grant must be unexpired and unrevoked, and its bound session must be active and belong to presentation 16460 / workshop 9503.
- The answer identity is `lead_<sha256>`, derived on the server from the MainSite lead.
- Requests carrying `participant_id`, `session_id`, `added_by` or similar fields are refused.
- `story_topics`, `story_topic_votes` and `big_idea_submissions` have no callers in the deck, so attendee access to them is closed with no adapter.

**Grants**
- A grant expires exactly when its five-minute token expires.
- The page asks the verified parent for a fresh token 60 seconds before expiry. If no fresh token arrives, access simply lapses.
- Each `jti` is stored permanently, so a replayed token is always refused.

**Sessions and presenter**
- Sessions can only be created by `create-presenter-session`. It checks the existing presentation password (same comparison as `verify-password`) plus a verified login, then records authorization on the server for 12 hours.
- An anonymous sign-in, or a session id sent by the caller, is never treated as presenter proof.
- Stage operations (manual entries, voluntold, lottery commit, slide changes, polls, clearing) still work through RLS using `is_proven_presenter`.

**Paid functions**
- Each of the 12 paid functions refuses a request unless it carries a live grant or comes from an authorized presenter. The check runs right after the preflight, before any provider call. CORS is limited to the allowed origin.
- `send-connect-notification` is replaced by a 410 stub that sends no email.
- The legacy `connect_submissions` insert is closed.

**Free, not gated**
- Viewing the deck.
- Reading sessions, polls and responses.
- Captions and `translate-caption`.
- The MainSite recording, transcript and TXT.

## Behavior notes to approve
- **Story writer turn.** In the gated path, `gate_story_word` advances the writer turn on the server after verifying it is the caller's turn. Today the attendee's own turn-advance call is rejected by RLS.
- **Reconnect by name.** This becomes a no-op when the gate is on, because the identity is already stable per lead.
- **Presenter prompt.** When the gate is on, the presenter enters the presentation password (a browser prompt) the first time they start a live session.
- **Old sessions.** `data/stage4_retire_unproven_sessions.sql` closes old non-password sessions such as test codes. It is optional and needs explicit approval.

## Staged activation
"Live now" means the change takes effect immediately on the shared live backend. Page changes go live only on Publish.

| Stage | Steps | When live |
|---|---|---|
| 1. Dormant backend | Apply `migrations/01_dormant_gate.sql`, which is additive: new tables and service-role-only functions, with no policy or grant changes. Run `data/stage1_config.sql` (`redeem_enabled=false`). Copy `_shared/{accessToken,gateHttp,interactiveGuard,runtime,guardRuntime}.ts` and deploy `redeem-access`, `submit-interaction` and `create-presenter-session`. All three answer `not_configured` until Stage 3. | Live now. Harmless: today's policies are untouched (the RLS test proves the policy snapshot equals baseline). |
| 2. Page in dual mode | Set `GATE_MODE = "dual"`, set the final handshake names, publish. Inside the MainSite frame, attendees use grants when they have one; everywhere else the old path is used. Presenter session creation moves to the password path. | On publish. |
| 3. MainSite synthetic check | Run `data/stage3_enable_redeem.sql`, then one synthetic token end to end. No real leads. | Live now. |
| 4. Enforce | Deploy the 12 guarded copies and the retired notification stub. Apply `migrations/02_enforce.sql`. Then set `GATE_MODE = "enforce"` and publish: standalone `?join=` visits and `/connect` redirect to MainSite capture. Order: page publish (enforce) right after the SQL. | SQL and functions live now; page on publish. |
| Rollback | Run `data/rollback_disable.sql`, apply `migrations/99_rollback_enforce.sql` (restores the exact baseline policies, as tested), redeploy the original 12 functions and `send-connect-notification`, and set `GATE_MODE` back. | Live now, except the page. |

During the Stage 4 gap between the SQL and the publish, phones on the dual-mode page that hold no grant cannot write. They can still view.

## Tests (synthetic only)
`bash gate/test/run.sh` starts a throwaway local Postgres (port 54329, under `/tmp`). Its schema is reproduced read-only from the live backend: tables, constraints, every policy verbatim, grants and default function grants. It runs 55 tests:

| Suite | Count | What it covers |
|---|---|---|
| Verifier | 7 | Exact `iss`/`aud`/scope; fractional, negative, zero, string, null, huge or misordered timestamps; future `iat`/`nbf`; lifetime over 300s; expiry; `none`/HS256; `kid`/alg pinning; `jku`/`crit`; tampering; personal data; identity derivation. |
| Handlers + real SQL | 19 | Presenter proof; bare anonymous user refused; grant expiry equals token `exp`; replay after revoke; unbound, mismatched, inactive and foreign-workshop sessions; origin; disabled gate; forged key; identity-field tampering; cross-session; closed poll; payload validation per poll type; expired, revoked and ended-session grants; story slots, cap, lottery and turns; unknown actions; paid guard; browser roles denied on every gate function and table. |
| RLS | 5 | Dormant equals baseline; every attendee write closed after enforce; proven presenter operations kept; public reads kept; rollback equals baseline exactly. |
| Guarded copies | 14 | All 12 are present and current with the live source; the guard sits right after the preflight; no wildcard CORS remains; removing the guard restores the original byte for byte; every provider-calling function is classified; the retired notification sends no email. |
| Page | 10 | Handshake origin and source; grant core (flag off is a pure passthrough, renewal timing, no extension past expiry, dual vs enforce routing, token wait timeout); standalone redirect rules. |

Not exercised: the supabase-js calls inside `runtime.ts` (getClaims, rpc transport, JWKS fetch), and the deployed edge runtime. Stage 3 covers those.
