# PNW2 gate: Stage 2 prepared (source only, not published)

- **Change:** `src/lib/gate/config.ts` `GATE_MODE` "off" → "dual" (plus comment wording). sha256 `5b716f293f877f47972e1ff2351da3f50a4ffdb5bc3c420972766567c228d85d`.
- **Test harness only:** `gate/test/browser/vite.gate-test.config.ts` now flips any single `GATE_MODE` line to "enforce" (it previously required "off"). Never deployed.
- **Backend:** unchanged. Stage 1 maintenance remains (`interactive_enabled=false`). No migration, function deploy, config write, publish, data, lead, session, provider or email.
- **MainSite key:** kid `46bdcdc5ccffcc8ea943480d` needs no deck change. The verifier selects the JWKS key by the token's `kid`; nothing is pinned. The JWKS was not fetched this stage.

## Pending frontend scope released by Publish
- **Published baseline:** bundle `assets/index-BJwF2DXK.js`, matching `8ee343f`. That is evidence, not attestation.
- **Against `8ee343f`:** 35 files under `src/` (1214+/110−). This is exactly the list in `gate/ACCEPTANCE.md`, plus:
  - `src/integrations/supabase/types.ts`: generated, +127 lines (gate tables), additive only;
  - the flag flip.
- **Since reviewed `d065f16`:** the only page changes are `config.ts` (the flag) and `types.ts` (generated types, no runtime effect).
- **Already live, not released by Publish:** `supabase/functions/*` and `drizzle/*` from Stage 1.

## What changes for visitors once "dual" is published (Stage 1 still maintenance)
- **Standalone visitors** (root, `/connect`, QR joins): no redirect. Same anonymous path as today.
- **Framed in MainSite:** the deck asks the parent for a token. `identify` answers `maintenance`, so there is no grant and every action falls back to the old path. Toast: "Interactive features are paused right now."
- **Stage deck:** no longer auto-starts a presenter session. Start Session prompts for the presentation password. This goes through `create-presenter-session` (live since Stage 1), which creates the canonical session.
- **Framed visitors:** Start/Restart/End Session controls are hidden.
- **Phone footer:** the only visual change, a fix for the clipped Next button.

## Evidence
- `bash gate/test/run.sh`: 69 pass, 0 fail. `bun test ./src`: 21 pass, 0 fail.
- `vite build` into `/tmp/stage2-dist`: OK. Bundle `index-DB8uZkt3.js` contains `"dual"` and the `pnw:access-request` handshake. The first trial build ran before the flag landed and showed `"off"`. It was rebuilt after the fix.
- Offline browser acceptance (enforce variant built from this source): 36/36. No real backend request.
- Live published site: still `index-BJwF2DXK.js`.

## Next
1. Root publishes MainSite, then publishes this frontend. Expect a new index bundle hash.
2. Stage 3 runs only on authorization: `gate/data/stage3_enable_interactive.sql` plus one synthetic capture.
   - Also check one framed paid demo while holding a grant. The 12 legacy functions are still unguarded until Stage 4 and will receive the attendee Bearer header.
3. Stage 4 runs only on authorization (see `gate/README.md`).
4. **Rollback for Stage 2:** set `GATE_MODE` back to "off" and publish. Backend maintenance needs no change.
