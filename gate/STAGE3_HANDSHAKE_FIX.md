# Stage 3 root acceptance — framed handshake fallback (diagnosis and fix)

Reported (04:21 UTC 2026-11-11): after a real MainSite capture (HubSpot confirmed by root), the
framed deck loaded `/assets/index-DB8uZkt3.js` but showed old room KE6R and no not-running notice.

## Evidence (live, read-only)
- `submit-interaction` edge logs: the only requests since deploy are the 7 forged-token probes
  at 04:19:49–50 UTC. **No `identify` call from any browser reached the backend.**
- Backend request log, referer `https://drupalpnw.lovable.app/`, 04:20:50–04:21:05 UTC:
  `GET sessions?id=eq.<KE6R id>&is_active=eq.true` (the stored-presenter restore query), then ~30
  `PATCH sessions?id=eq.<KE6R id>` (presenter slide sync, one per slide step).
- KE6R: created 2026-11-10 06:34 by the pre-gate auto-start; its presenter is an anonymous login
  created 2026-11-02 that made 3 sessions — a login persisted in that browser's frame storage.
- MainSite live parent (`presentation-resources-CYmDh4Dr.js`): child origin
  `https://drupalpnw.lovable.app`, exact-source + nonce ≤128 checks, replies
  `{type:"pnw:access-response", nonce, token}` to that origin — compatible with the deck. Not at fault.

## Cause (deck, dual build `179b28d`)
1. `SessionContext` restored `presenter_session_id` from frame storage as presenter, and the
   framed auto-join returned early when that key existed, so `gate.connect()` never posted
   `pnw:access-request`. The frame then drove KE6R's `current_slide`.
2. In dual, `AccessGate` returned before subscribing, so the not-running notice could never show
   even after a successful handshake.

## Fix (source only)
- `src/contexts/SessionContext.tsx`: gate on + framed → skip presenter restore; auto-join no longer
  depends on a saved presenter key. Standalone presenter behavior unchanged.
- `src/components/gate/AccessGate.tsx`: dual + framed → listen for verified access and show the
  not-running notice when no live session is bound. Deck never blocked in dual.
- Saved keys are ignored, not deleted; no session closed, created or changed.

## Offline evidence
- `GATE_TEST_MODE=dual` build + `run_dual_frame_check.py`: before fix 8/14 (stale room: 0 nonces,
  0 identify, slide writes); after fix 14/14.
- Enforce acceptance `run_browser_acceptance.py`: 36/36. Gate unit/SQL: 69/69. App: 5/5.

## Root test path after publish
1. Same browser profile as before (keeps the saved KE6R key — the regression case).
2. Open the MainSite capture page with the eight-hour cookie; wait for the frame.
3. Expect: the "Live activity isn't running right now" notice, no room code, and in the backend
   log one `submit-interaction` 200 for `identify`; no `PATCH sessions` from the frame on stepping.
4. Keep the tab ~4 minutes: a second handshake and a second `identify` 200 (renewal).
5. Revoke at MainSite, then trigger an action (or wait for renewal): `access_revoked`, no write.
