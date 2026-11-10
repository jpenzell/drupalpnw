# PNW2 interactive gate: bounded implementation plan

Nothing in this plan has been changed, published, created or called. It is the plan only.

## Agreed contract (from MainSite / Replit)
- **Issuer:** `https://www.joshpenzell.com`.
- **Audience:** `pnw2-interactive`.
- **Scope claims:** `presentation=16460`, `workshop=9503`.
- **Signature:** asymmetric, checked against MainSite's public key set (JWKS).
- **Lifetime:** 5 minutes.
- **No name or email in the token.**
- **Issued only** after MainSite has saved name and valid email, attribution, optional (unchecked by default) marketing consent, and a durable CRM job. Attendee-only.
- **Delivery:** PNW2 runs inside a MainSite iframe. The token arrives by a `postMessage` handshake that checks the exact origin and exact source window. The token is held in memory only, never in storage.
- **Standalone visits:** a visit to `drupalpnw.lovable.app` outside the iframe redirects to `https://www.joshpenzell.com/p/ai-for-all-minds-pnw-drupal-summit-2026-10-17`. There is no public interactive bypass.
- **Stays free:** the recording, full transcript and TXT are public on MainSite, and live captions stay available.

## Current state that matters
- **Owning domain:** `https://drupalpnw.lovable.app`. No custom domain is connected.
- **Live site vs preview:** the live bundle (`index-BJwF2DXK.js`) already contains every recent feature I checked:
  - the bio and T.O.V.A. charts slides
  - the percentage poll
  - Québec French captions
  - AM-pupils
  - the Inclusion Academy link
  - LinkedIn opening in a new tab
  - the anonymous fallback id
  - the swapped directing moves
  - Only the join QR moved beside the sponsors artwork is unconfirmed on the live site.
  - So a publish of the gate would release little or nothing besides the gate itself.
- **Backend today:**
  - Anonymous visitors can insert and update `responses` on any active session, using an id they choose themselves.
  - Any anonymous sign-in can write to the `story_*` tables and `big_idea_submissions`.
  - Anyone can insert `connect_submissions`.
  - Every server function allows `*` CORS and does not check the caller.

## Important: backend vs page changes go live differently
- Database rule changes and server functions take effect **immediately**, on the same backend the live site uses. There is no staging copy.
- Page changes go live only when Publish is clicked.
- If the database is locked first, the current live site breaks: polls fail for every attendee.
- If the page is published first without the backend lock, the gate is cosmetic and can be bypassed.

## Rollout that avoids half-activation
1. **Dormant backend (safe to ship early).**
   - Add the `access_grants` table, plus the `redeem-access` and `submit-interaction` functions.
   - Leave all current access rules untouched.
   - Add a kill switch: a `gate_config` row with `enforce=false`.
   - The JWKS URL, issuer, audience and scope are read from secrets and config, not hardcoded.
2. **Dual-path page (published while dormant).**
   - The iframe handshake and in-memory token are in place.
   - Writes go through `submit-interaction` when a grant exists. Otherwise they use the old direct path, but only while the gate is not enforced.
   - The standalone redirect stays behind the same flag.
3. **MainSite ready check.** One end-to-end test with a MainSite-issued test token, run when coordinated. No real leads.
4. **Activate in one step.**
   - Set `enforce=true`.
   - The same migration revokes direct anonymous and authenticated-attendee INSERT/UPDATE on `responses`, `story_*` and `big_idea_submissions`.
   - The page sees the flag and switches on the redirect.
   - **Rollback:** a single migration restores the current access rules and sets `enforce=false`.

## Backend protection
- **`redeem-access`**
  - Checks the token against the JWKS from `https://www.joshpenzell.com`, cached, and selected by `kid`.
  - Accepts only an algorithm on an allow-list. It never accepts HS256.
  - Checks `iss` and `aud` exactly, `presentation`/`workshop` must be 16460/9503, `exp` must be ≤ 5 min after issue (60s clock skew), and `jti` can be used only once.
  - Stores a grant (`jti`, opaque `sub`, scope, `exp`) and returns an opaque grant id. It never creates sessions.
- **`submit-interaction`**
  - Takes a grant id plus `{poll_id | story action, payload}`.
  - Checks that the grant is live and the session is active.
  - Writes as the server, with the participant id taken from the grant.
- **Grant lifetime: open decision.** The token lasts 5 minutes, but the talk lasts 45. I propose the grant lives up to session end with a 2-hour cap. Each new page load re-handshakes.
- **Presenter:** no new privileges. The presenter keeps the existing `presenter_id = auth.uid()` rules. Attendees still never create sessions.
- **Paid AI functions triggered by attendees:** these are `probability-words-*`, `multi-ai-estimate`, `pick-number`, `josh-gpt` and `scene-rehearsal`. Under enforcement they require a grant or the presenter. `translate-caption` stays free.
- **Reads:** reading aggregates stays as it is, so the stage display does not change.
- **CORS:** the new functions allow only the `drupalpnw.lovable.app` origin. The iframe parent is enforced in the page via `postMessage`, and the page sets `frame-ancestors https://www.joshpenzell.com` where the host allows it.
- **Cookies:** none. Third-party cookies inside an iframe are blocked by browsers, so the token lives in memory and is sent as a bearer header.

## `/connect` and email
These become redundant once MainSite is the canonical lead capture. Open decision: retire them under enforcement, or keep them as-is.

## Tests (bun, kept in the project)
- The token checker:
  - accepts a valid token
  - rejects a wrong `iss`
  - rejects a wrong `aud`
  - rejects the wrong presentation or workshop
  - rejects an expired token, and one whose lifetime is over 5 minutes
  - rejects a replayed `jti`
  - rejects HS256 and `alg:none`
  - rejects an unknown `kid`
- The handshake:
  - ignores a wrong origin
  - ignores a wrong source window
  - never writes the token to storage
- The rollout flag:
  - the old path is allowed while dormant
  - the old path is refused under enforcement
- All tests use local test keys only. They make no network calls or provider calls and create no live sessions.
- A database check after activation confirms that anonymous direct inserts are refused.

## Needed from MainSite before step 2
- The JWKS URL and `kid`.
- The exact `postMessage` message shape and the parent origin.
- A test token procedure.
- Confirmation that the iframe page can embed with the required permissions.
- Agreement on the grant lifetime.
