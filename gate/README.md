# PNW2 interactive gate: staged and inactive (final MainSite contract)

Nothing in this folder is deployed, migrated or published.

This folder targets the final MainSite contract from candidate `9f83abd40800c045c0b9cda2f03a23a3386fad38` (the contact-review document, "External-deck protocol"), with one correction: the issuer and parent origin are **`https://www.joshpenzell.com`**. The MainSite document assumed the apex domain; that is being corrected on their side.

- **Server code:** `gate/functions/*` sits outside `supabase/functions/`, so nothing there deploys.
- **SQL:** `gate/migrations/*` and `gate/data/*` have not been applied. Database changes take effect immediately on the shared live backend, which is why they wait for their stage.
- **Page code:** the code in `src/lib/gate/*` is compiled into the app but inactive while `GATE_MODE = "off"`. With the flag off, every attendee write and every paid-function call runs exactly the code it ran before; it is only wrapped in `gate.route(...)` or `invokeFunction(...)`.

## Contract as implemented

### Token (`_shared/accessToken.ts`)
- **Algorithm and key:** EdDSA/Ed25519 only. The `kid` must be in the JWKS. Key-carrying headers (`jku`, `jwk`, `x5u`, `x5c`, `crit`) are refused. `typ` must be `JWT` or absent.
- **Claims:** all must match exactly.

  | Claim | Required value |
  |---|---|
  | `iss` | `https://www.joshpenzell.com` |
  | `aud` | `pnw2:e10466e1-025e-4530-8f10-a62efb7a9ea8` (a string, not an array) |
  | `presentation_id`, `workshop_id` | Integers `16460` and `9503` |
  | `scope` | Exactly the set `["slides:interact","session:qa"]` |
  | `policy_version` | `1` |
  | `sub` / `jti` | Both the same UUID |

- **Timestamps:** `iat`, `nbf` and `exp` must be positive safe integers, in order, with a lifetime of 300 seconds or less. Up to 30 seconds of clock skew is tolerated, only for `iat`/`nbf` being ahead. `exp` gets no grace.
- **Personal data:** a token containing personal-data claims is refused.
- **Reuse:** `jti` is the reusable grant id. A token may be used for many actions until it expires; there is no single-use replay table.
- **Identity:** `participant_key = lead_ + sha256(issuer|sub|16460|9503)[0..32]`, derived on the server. The client never chooses it.

### Policy service (`_shared/mainsite.ts`, `_shared/runtime.ts`)
- **Fixed endpoints:** `GET https://www.joshpenzell.com/api/drupal-access/jwks` and `POST https://www.joshpenzell.com/api/drupal-access/introspect`. Both derive from the pinned issuer, never from environment settings, tokens or requests. The call uses `Authorization: Bearer <token>`, `redirect: "error"`, a 3-second timeout and no caching.
- **Every protected action:** local verification, then live introspection. A positive introspection result is never cached. Only the public keys are cached, for 5 minutes.
- **What passes:** only `200 {active:true, sub:<same>, scope ∋ "slides:interact", policy_version:1}`.
- **What denies:**
  - `{active:false}` or a 401 → `access_revoked` (401).
  - 404 (MainSite gate off), 429, 5xx, non-JSON, timeout or network failure → `policy_unavailable` (503).
  - A different `sub`, scope or policy version → denied.
- **Secrets:** none to share.

### Embedded handshake (`src/lib/gate/parentHandshake.ts`)
- **Request:** the child posts `{type:"pnw:access-request", nonce}` to `https://www.joshpenzell.com` only. The nonce is 32 random bytes, base64url-encoded (43 characters, within the 128 limit). Up to 4 requests can be outstanding, each for 30 seconds.
- **Response accepted only when:**
  - `origin` is exact;
  - `source === window.parent`;
  - `type === "pnw:access-response"`;
  - the nonce is outstanding (each nonce is used once);
  - the token is JWT-shaped and 4096 characters or fewer.
- **Storage:** the token is kept in memory only. A test checks that the gate code never touches storage, cookies, history or analytics.
- **Renewal:** a fresh handshake 60 seconds before the server-verified expiry. If no reply arrives, access lapses; nothing extends it.

### Post-event, self-guided use (the emailed resource link)
- **No live session needed:** a captured visitor with a valid MainSite token, positively introspected right now, can open and explore the whole deck, the paid demos, the canvas and the rehearsal tool. Josh does not have to start anything.
- **Live writes only:** only poll answers and story volunteering or words need a running canonical session. Without one, the server answers `session_inactive`, and the deck shows "Live activity isn't running right now — explore the deck and demos on your own." Nothing ever auto-creates a presenter or session.
- **Old sessions:** never closed or deleted by any staged step.

### Session binding for live writes (no `session_code` from MainSite)
- **Canonical session:** `gate_config.canonical_session_id` is set only when the presenter deliberately creates a session through the password-checked path, which records presentation 16460 / workshop 9503.
- **Server-chosen:** live writes resolve that session on the server. Codes, session ids and identity fields sent by the caller are refused (`identity_not_allowed`). Polls in any other session return `wrong_session`.
- **Joining inside MainSite:** the deck auto-joins the live session if one is running, and picks it up on the next token renewal if one starts later. Any `?join=` code is ignored for binding.

### Whole-deck entry (`src/components/gate/AccessGate.tsx`, enforce only)
- **Inside the MainSite frame:** every page waits for a verified token, otherwise shows "open from the event page" with a link to MainSite capture.
- **Standalone:** every page — the stage root `/`, `/canvas`, `/rehearsal`, `/connect` and join links — opens only for a login the server confirms as password-authorized (`create-presenter-session` `status`). Anyone else is sent to `https://www.joshpenzell.com/p/ai-for-all-minds-pnw-drupal-summit-2026-10-17`.
- **Presenter entry:** `/presenter` takes the existing presentation password, then opens the deck. It creates no session.
- **Free pages:** unsubscribe pages stay open.
- **No automatic sign-in:** the automatic anonymous sign-in is skipped when enforced.
- **Real enforcement is on the server:** this page layer keeps the UI honest; the backend enforces.

### Protected surfaces once enforced
- **Attendee writes:** only through `submit-interaction`, with these actions: `identify`, `poll_response`, `my_responses`, `story_volunteer`, `story_word`.
- **Direct database writes:** `02_enforce.sql` closes every direct anonymous or self-identified write: responses, sessions, story volunteers, words and topics, big-idea submissions, and the legacy `connect_submissions`.
- **Paid functions:** each of the 12 refuses any request that lacks either a verified and introspected attendee token (while interactive services are enabled; no live session needed) or a password-authorized presenter login. The check runs before any provider call.
- **Attendee tokens:** an EdDSA bearer is always handled as an attendee token. It never falls through to presenter checks, and it is refused outright by `create-presenter-session`.
- **Notification:** `send-connect-notification` is replaced by a 410 stub that sends no email. MainSite is the canonical lead capture.
- **Presenter:** the existing `PRESENTATION_PASSWORD`, compared the same way `verify-password` does, plus a verified login, recorded for 12 hours. Stage operations work through RLS `is_proven_presenter`. A bare anonymous sign-in is never presenter proof.
- **Free, not gated:** viewing the deck; reading sessions, polls and responses; captions and `translate-caption`; the MainSite recording, transcript and TXT.

## Published vs candidate
The live bundle `index-BJwF2DXK.js` contains markers from commit `8ee343f`. This is evidence, not attestation: the hosting service exposes no commit id, and a byte-identical rebuild was not done.

`git diff --stat 8ee343f -- src` shows 32 files:
- `src/lib/gate/**` — new.
- `SessionContext` and `PollContext` — branches that only run when the gate flag is on.
- 3 story/number screens — wrapped in `gate.route`.
- 22 call sites in 16 files — `invokeFunction`.
- `Connect.tsx` — gate-on branch.
- `App.tsx` + `components/gate/AccessGate.tsx` — entry gate, which passes straight through unless enforced.
- `previewAuthStorage.ts` — platform-generated; not from the gate work.

Outside `src`: `gate/**`, `AGENTS.md`, `roadmap.md` and `.lovable/plan*`. No slide content, running order or presenter controls changed.

## Prerequisites still open (concrete)
1. **MainSite issuer:** `DRUPAL_CONTACT_ORIGIN`/issuer set to exactly `https://www.joshpenzell.com`. The document's apex assumption must be corrected; until then every token fails `wrong_issuer` (fail closed).
2. **Apex visitors:** `https://joshpenzell.com/` currently serves 200 itself; it does not redirect to www. This was checked read-only today. A visitor on the apex domain has parent origin `https://joshpenzell.com`, so the deck's message to `www` is dropped and that visitor cannot interact. MainSite must redirect apex to www, or make every capture link use www.
3. **MainSite parent iframe:** `src` set to `https://drupalpnw.lovable.app/`, or any path on that origin; no code is needed. The deck currently sends no `X-Frame-Options` or `frame-ancestors`, so it can be framed. This was checked read-only today.
4. **MainSite gate, keys and capacity:** the MainSite gate must be ON and its JWKS must serve the Ed25519 key before Stage 3; a disabled introspect returns 404, which the deck denies. The introspect rate budget must cover one call per attendee action, plus one per token renewal (every 4 minutes per attendee), across the room.
5. **Outbound access:** the edge runtime must be able to reach `www.joshpenzell.com`. This is checked at Stage 3 with one synthetic token.
6. **Live sessions:** none are needed for the emailed post-event link. If Josh ever wants live polls or the story game again, he signs in at `/presenter` and starts a session deliberately.
7. **Coordinated window:** the enforcement switch on both sides, done in one controlled window.

No new secret is needed on this side. `PRESENTATION_PASSWORD` already exists, and `PNW2_ALLOWED_ORIGINS` is optional (default `https://drupalpnw.lovable.app`).

## Staged activation
"Live now" means the change takes effect immediately on the shared backend. Page changes go live only on Publish.

| Stage | Steps | When live |
|---|---|---|
| 1. Dormant | Apply `migrations/01_dormant_gate.sql` (additive; no policy or grant changes). Run `data/stage1_config.sql` (maintenance). Copy `_shared/{accessToken,mainsite,attendee,gateHttp,interactiveGuard,runtime,guardRuntime}.ts` and deploy `submit-interaction` and `create-presenter-session`. Attendee actions answer `maintenance`. | Live now. Harmless: today's policies are untouched (tested). |
| 2. Page dual | Set `GATE_MODE = "dual"` and publish. In the MainSite frame, attendees use tokens when available; elsewhere the old path. Presenter creation moves to the password path. A live session is only needed if Josh runs live polls or the story game. | On publish. |
| 3. Synthetic check | Run `data/stage3_enable_interactive.sql`. One synthetic MainSite capture: handshake, identify (no live session, so the deck opens and live writes say not running), revoke on MainSite, next action denied. No real leads and no provider call. | Live now. |
| 4. Enforce | Deploy the 12 guarded copies and the retired notification. Apply `migrations/02_enforce.sql`, then immediately set `GATE_MODE = "enforce"` and publish (every standalone page except `/presenter` and unsubscribe needs presenter proof, otherwise it redirects to `https://www.joshpenzell.com/p/ai-for-all-minds-pnw-drupal-summit-2026-10-17`; framed pages need a MainSite token). | SQL and functions live now; page on publish. |
| Rollback | Run `data/rollback_maintenance.sql`: attendee actions and attendee paid calls are denied with `maintenance`. Enforced policies stay; no old anonymous write path is reopened; nothing is dropped. MainSite revokes grants as authorized and disables interactive entry; the public recording and transcript stay open. | Live now. |

## Test evidence (synthetic only)
`bash gate/test/run.sh` starts a throwaway local Postgres 17 on 127.0.0.1:54329. Its schema is reproduced from the live backend: tables, constraints, every policy verbatim, grants and default function grants. MainSite is replaced by in-process synthetic Ed25519 keys and a controllable introspection stand-in. There are no network or live calls.

Latest run: **68 pass, 0 fail.**

| Suite | Count | What it covers |
|---|---|---|
| Verifier and policy client | 11 | Exact token shape. EdDSA pinned (ES256, HS256, none, RS256 and EC keys refused). `iss` www-exact (apex, trailing slash and http refused). `aud` exact string. Integer event ids (string ids refused). Exact scope set. `policy_version` 1. `sub` must equal `jti` and be a UUID. Every bad timestamp shape; lifetime over 300 s; future `iat`/`nbf`; expiry; reuse within lifetime. Key-header injection, tampering and personal data. Identity stability. Fixed endpoints. Introspection request shape (POST, Bearer, no redirect). Every negative, odd or unavailable reply fails closed. |
| Handlers and real SQL | 22 | Post-event with no live session: identify, paid demos allowed; every live write returns `session_inactive`; no session created; an attendee token cannot create one. Presenter status only after the password. Presenter proof: no login, wrong password and attendee token refused; the newest password session becomes canonical; a bare anonymous owner gets nothing. `session_inactive` before a canonical session exists. Identify binds to the canonical session. Token reuse with one introspection per action. Revocation applies on the very next action. Policy-service or key-fetch outage gives 503 for actions and paid calls. Missing, forged, expired, cross-event and wrong-audience tokens are refused before introspection. Exact origin. Server-derived identity, upsert and read-back. One identity across renewed tokens. Identity and session fields refused. Old, arbitrary or closed polls refused. Payload validation (slider range, multiple-choice options). Story slots, cap, lottery and turns. Unknown actions. Paid guard (attendee, presenter, expired presenter, bare anonymous, publishable key, wrong origin). Maintenance rollback denies all attendee paths, keeps the presenter, and reopens no write. Browser roles denied on every gate function and table. |
| RLS | 6 | Dormant equals baseline. Enforce closes every direct attendee write. The proven presenter keeps stage operations. Public reads kept. Maintenance keeps the enforced policy snapshot. No staged SQL recreates any old anonymous or self-write policy, drops a table, schema or column, or closes or deletes sessions or their data. |
| Guarded copies | 14 | All 12 are present and current with the live source. The guard sits right after the preflight. No wildcard CORS. Removing the guard restores the original byte for byte. Classification is complete. The notification sends no email. |
| Page | 15 | Whole-deck entry rules (root, canvas, rehearsal, connect need presenter proof standalone; framed visits wait for access; unsubscribe free; off/dual unchanged). Access without a live session reports `session_inactive`. Exact request message. Origin, source and outstanding-nonce matching, each nonce used once. Nonce shape. No storage, URLs or analytics. Standalone detection. Flag off is a pure passthrough. Identify flow and Bearer header. Renewal at expiry minus 60 s with no extension. Server denial. Dual vs enforce routing. Standalone redirect rules. |

Also clean:
- The app type-check.
- `deno check` of every staged function.
- `generate-guarded --check` (the copies match today's 12 functions).
- The existing project tests: 20 pass.

**Not exercised:**
- The supabase-js transport inside `runtime.ts`: `getClaims`, the real rpc client, real fetches to MainSite.
- The deployed edge runtime.
- A real browser frame on MainSite.

Stage 3's single synthetic capture covers these.
