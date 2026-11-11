# PNW2 gate: Stage 3 applied (interactive enabled, enforcement held)

Applied 2026-11-11 04:19:27 UTC from revision `179b28d`, after confirming the Stage 2 dual frontend was live.

## Stage 2 deployment evidence (checked before Stage 3)
- Root deployment `27a81f8b-470f-4082-ac1e-8a5d84d74352` at `179b28d`.
- `https://drupalpnw.lovable.app/` (04:18:12 UTC, `cache-control: no-cache`) serves `assets/index-DB8uZkt3.js` and `assets/index-Ci6aXrcx.css`. The previous bundle was `index-BJwF2DXK.js`.
- Offline rebuild of the clean `179b28d` tree (`vite build`): the same two file names. Every built JS/CSS asset (2 of 2) is **byte-identical** to the live copy:
  - `index-DB8uZkt3.js` sha256 `436b0ddf368a39ade93637bb48349c14a1659c69f030424054509015428331bd`
  - `index-Ci6aXrcx.css` sha256 `2e5e318443f5b77174c5b402d75f8d558348f99aa6050b0d46029c48709dc415`
- The live bundle contains `GATE_MODE` `"dual"`, the issuer `https://www.joshpenzell.com` and `pnw:access-request`.

## MainSite readiness (public, read-only)
- `GET https://www.joshpenzell.com/api/drupal-access/jwks`: exactly one key, `OKP` / `Ed25519` / `EdDSA` / `sig`, kid `46bdcdc5ccffcc8ea943480d`.
- `POST /api/drupal-access/introspect` with no token: 401, so the gate is on. A disabled gate would return 404.

## Pre-apply readback
- Config: `interactive_enabled=false`, presentation 16460, workshop 9503, `canonical_session_id` null.
- Deck-table policies: 32 / `b1c83ed64863d09a0e83aa8bd65aed2e`, the same as Stage 1. All public policies: 41 / `4408c27df26a532757700d387ba553a3`.
- Rows: sessions 375 (370 active), polls 240, responses 180, connect_submissions 19, presenter_sessions 0, presenter_authorizations 0.
  - Note: sessions went from 372 to 375 after Stage 1. The new rows are `RQVD` (2026-11-10 11:29:51), `6BAZ` and `UWX5` (11:36:34), all on `S0-sponsors`.
  - They match the old auto-starting stage deck from before dual was published. This work did not create them, and they were left untouched.

## Applied
`gate/data/stage3_enable_interactive.sql` (sha256 `0168d03254e4dc255203f136ccf2dc15e8b46cf1f4b5dc6d8d3b884fa7e2d601`), run verbatim with the data tool. It updates one row.

## Post-apply readback
- Config: `interactive_enabled=true`, `updated_at` 2026-11-11T04:19:27.77468Z, `canonical_session_id` null. Everything else is unchanged.
- Policies: 32 / `b1c83ed6…` (deck) and 41 / `4408c27d…` (all), both unchanged.
- Rows: the same as before (375 / 240 / 180 / 19 / 0 / 0). No session, lead, response or presenter row was created.

## Synthetic denial probes against live `submit-interaction`
Tokens were forged locally with a throwaway Ed25519 key. None can pass the signature check, so introspection was never reached and no lead or grant was created.

| Probe | Result |
|---|---|
| identify, no token | 401 `access_required` |
| identify, malformed token | 401 `malformed` |
| identify, contract-shaped token, unknown kid | 401 `unknown_kid` |
| identify, contract-shaped token, real kid `46bdcdc5…`, wrong key | 401 `bad_signature` |
| poll_response, same forged token | 401 `bad_signature` |
| foreign Origin | 403 `origin` |
| `participant_id` in body | 400 `identity_not_allowed` |

The `unknown_kid` result versus the `bad_signature` result shows that the deployed edge runtime fetched the live www JWKS and selected kid `46bdcdc5…`. An unreachable JWKS would have returned 503 instead.

## Not verified here
These need root's real browser capture, which the gate never simulates:
- a real signed token and a positive introspection (`active`/`sub`/`scope`/`policy_version`);
- the framed nonce handshake and its 4-minute renewal;
- MainSite revocation denying the next action;
- HubSpot persistence.

## Expected behavior now
- **Framed attendee with a valid token:** the deck opens and self-guided features work.
  - No canonical session exists, so live poll and story writes answer `session_inactive` ("live activity not running"). No session is ever auto-created.
- **Standalone visitors:** no change yet ("dual"). The old anonymous path stays open until Stage 4.
- **The 12 legacy paid functions:** still unguarded, as before. In the frame they now receive the attendee Bearer header.

## Held (Stage 4)
The 12 guarded paid copies, the retired `send-connect-notification`, `02_enforce.sql` and `GATE_MODE` "enforce" are all held until root supplies the browser capture, HubSpot and token acceptance. The live `supabase/functions/*` paid sources are still the legacy versions; none matches its `gate/` guarded copy.

## Rollback for Stage 3
Run `gate/data/rollback_maintenance.sql`: attendee actions return to `maintenance`, and no policy reopens or changes.
