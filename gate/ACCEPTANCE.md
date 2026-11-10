# PNW2 gate: final pre-deployment acceptance (source only)

Nothing has been deployed, migrated, configured or published. The live site still runs the bundle built from `8ee343f`. The candidate source has `GATE_MODE = "off"`, so the live behavior of the candidate is also unchanged.

## Candidate revision
- **Candidate:** `be88bb3c0c11465d5b036cdcebddfd2117304f5b`, plus this acceptance commit (documentation, `gate/scripts/activation-map.ts`). The platform commits automatically; use the commit that contains this file.
- **Baseline (published):** `8ee343f`. This is evidence, not attestation: bundle markers match it, but the hosting service exposes no commit id.
- **Against `8ee343f`:**
  - Outside `gate/`: 37 files changed (36 under `src/`).
  - Under `gate/`: 44 files, all new and none deployed.

### Files outside `gate/` (`git diff --name-status 8ee343f`)

**Added**
```
.lovable/plan.md                       (planning note)
src/components/gate/AccessGate.tsx     entry gate (pass-through unless enforce)
src/lib/gate/{config,gateClient,gateCore,parentHandshake,standalone}.ts (+ 3 tests)
```

**Modified, with behavior when `GATE_MODE` is "off"**
```
AGENTS.md, roadmap.md                  notes
src/App.tsx                            wraps routes in AccessGate (renders children directly when off)
src/contexts/SessionContext.tsx        gate branches only when mode != off
src/contexts/PollContext.tsx           gate.route → direct path when off
src/pages/Index.tsx                    auto-start of presenter session skipped only when mode != off
src/components/PresentationLayout.tsx  session controls hidden only for framed visitors when mode != off;
                                       footer responsive below 640px (icon-only Previous, spares badge
                                       hidden) — the only change visible with the gate off
src/pages/Connect.tsx                  gate-on branch (no legacy row/email; MainSite instead)
src/components/screens/{OneWordStory,ElephantQuestion,TrueRandom}Screen.tsx   writes wrapped in gate.route
22 paid-function call sites in 16 files → invokeFunction (identical when off):
  AIAssistant, LiveAIDemo, PromptPlayground, AIAgeReveal, AIRandomNumbers, AIStoryDemo, AboutMe,
  Agenda, ElephantQuestion, NumberPicker, ProbabilisticDemo, ProbabilityWordsLive,
  ProbabilityWordsPersona, tt/AIRevealSlide, useHeadshotTransform, RehearsalTool
src/integrations/supabase/previewAuthStorage.ts   platform-generated; not gate work
```

No slide content, running order or presenter controls changed, except the phone-width footer noted above.

## Build evidence
- **Type check:** `tsgo -b --noEmit` on the whole app is clean.
- **Production build of the exact candidate:** `vite build` of the full app passed. It ran through the acceptance config, whose only differences are the gate flag and the offline client (see "Browser acceptance" below). `diff` confirms the flag is the only change to `config.ts`.
- **Edge functions:** `deno check` is clean on every staged function and shared module.
- **Guarded copies:** `generate-guarded --check` passes. All 12 guarded copies are current with today's live function source.
- **Preview build log:** the platform's own log was unavailable this turn because the sandbox restarted and cleared `/tmp`; its last recorded entry before the restart was "build OK".

## Automated tests: 69 pass, 0 fail (`bash gate/test/run.sh`)
These run against a disposable local Postgres 17, with synthetic Ed25519 keys and a stand-in for MainSite introspection. There is no network access.

| Suite | Count |
|---|---|
| Verifier and policy client | 11 |
| Handlers and real SQL | 22 |
| RLS | 6 |
| Guarded copies | 14 |
| Page | 16 |

The new page test covers concurrent connects sharing one handshake. The existing project tests (`bun test ./src`) also pass: 21.

## Browser acceptance: 36/36 checks pass (`gate/test/browser/`)
**Harness, fully offline:**
- **Build:** `vite.gate-test.config.ts` builds the candidate with exactly two substitutions:
  1. `GATE_MODE = "enforce"` (generated copy; refuses to build if the line is not found);
  2. the backend client replaced by `fakeSupabase.ts`. It makes no backend transport: reads return empty, realtime is inert, auth lives in memory, and functions go to a synthetic host.
- **Network:** `run_browser_acceptance.py` (Playwright, Chromium) answers every request locally:
  - the deck origin `https://drupalpnw.lovable.app` → the built files;
  - `https://www.joshpenzell.com/p/...` → a synthetic parent page mirroring MainSite candidate `DrupalContactGate` (exact origin and frame-source checks, nonce of 128 characters or fewer);
  - `https://functions.gate.test` → synthetic functions.

  Everything else is aborted and logged. **No request reached any real backend**, which is asserted. No real anonymous user, session, lead, provider call or email was created.

**Checks**

| Area | Result |
|---|---|
| Valid parent entry, post-event | Deck opens self-guided with the "Live activity isn't running" notice. One handshake per load. Nonce is 43 characters, base64url. `identify` carried the parent's token as Bearer. No sign-in, no session creation, no session controls inside the frame. The token is not in storage or the URL. |
| Keyboard | ArrowRight advances the framed deck. The presenter password field is reachable by Tab and submits with Enter. The notice is dismissible by keyboard. |
| Nonce discipline | A forged-nonce response and a replayed response were ignored; only the matching token was used. |
| Renewal | A second handshake with a new nonce ran about 10 s into a 70 s token (expiry minus 60 s). The server re-confirmed with the new token. |
| Malformed token / silent parent | Ignored; the deck stays closed with "opens from the event page". No `identify` was called. |
| Revoked / expired / maintenance | The deck stays closed with the event-page notice. |
| Free-resource escape | "Go to the event page" (`target=_top`) takes the top window to the MainSite capture page with the free recording and transcript. |
| Direct attendee | `/`, `/canvas`, `/rehearsal`, `/connect`, `/?join=ABCD` and `/S12` all redirect to `https://www.joshpenzell.com/p/ai-for-all-minds-pnw-drupal-summit-2026-10-17`, with no sign-in. `/unsubscribe` stays reachable. |
| Explicit presenter path | `/presenter`: wrong password refused; correct password opens the stage deck with a deliberate Start Session control. Exactly one deliberate sign-in, and no session auto-created. |
| Small screen (390×844) | No horizontal overflow; Previous/Next fully on screen (after the footer fix); the denied notice fits. |
| Live session running | The deck joins it with no notice. |

Screenshots of the key states were captured under the run's temporary folder and reviewed.

**Fixed during acceptance:**
1. The stage deck auto-started a presenter session on load. With the gate on, it now never does; Start Session is deliberate.
2. Framed visitors could see Start/Restart/End Session. These are now hidden inside the MainSite frame.
3. Each load made two handshakes; there is now one.
4. On phones the footer clipped the Next button.
5. The notice covered the top bar; it now floats above the footer.

**Not exercised in the browser:**
- the real supabase-js transport, real MainSite token and introspection, and the deployed edge runtime (Stage 3 covers these with one synthetic capture);
- a real live-poll write (the server path is covered by the SQL tests);
- presenter session persistence across reloads (the fake keeps auth in memory).

Framed visitors see the stage deck's normal viewing chrome (mode selector, theme, captions, zoom), but no session controls.

## Activation map
Generated by `bun gate/scripts/activation-map.ts`. sha256 values are truncated to 16 characters.

| Stage | Staged source | Destination | sha256 | Note |
|---|---|---|---|---|
| 1 | gate/migrations/01_dormant_gate.sql | migration tool | fca93595ef2a323d | additive tables, service-role-only functions |
| 1 | gate/data/stage1_config.sql | data tool | 9722ca707e859ae5 | config row, maintenance |
| 1 | gate/functions/_shared/{accessToken,attendee,gateHttp,guardRuntime,interactiveGuard,mainsite,runtime}.ts | supabase/functions/_shared/ | adaba422…, 92594867…, ebb6343e…, ab844e52…, 79993e5e…, 00110880…, ac2ea261… | new |
| 1 | gate/functions/submit-interaction/{index,handler}.ts | supabase/functions/submit-interaction/ | e4c90e59…, ec5ce997… | new function |
| 1 | gate/functions/create-presenter-session/{index,handler}.ts | supabase/functions/create-presenter-session/ | c7a31b44…, 032a7f6d… | new function |
| 2 | src/lib/gate/config.ts | (same) | — | `GATE_MODE` "off" → "dual", publish |
| 3 | gate/data/stage3_enable_interactive.sql | data tool | 0168d03254e4dc25 | interactive on; one synthetic capture |
| 4 | gate/functions/{12 paid}/index.ts | supabase/functions/{same}/index.ts | see script output | guarded copies replace live |
| 4 | gate/functions/send-connect-notification/index.ts | (same) | 90005447ff77a445 | retired, 410, no email |
| 4 | gate/migrations/02_enforce.sql | migration tool | 4194ec6109d4e100 | closes direct attendee writes |
| 4 | src/lib/gate/config.ts | (same) | — | "dual" → "enforce", publish |
| R | gate/data/rollback_maintenance.sql | data tool | 9f1dd7e15c080f2c | maintenance; reopens nothing |

**Effective timing:** database steps and function deploys take effect immediately on the shared backend; the page changes only on Publish.

## Maintenance rollback evidence
- **SQL test:** after `rollback_maintenance.sql`, `identify`, poll writes and story writes all return 503 `maintenance`. The attendee paid-function guard denies, and the presenter guard still passes. A direct anonymous response insert is still refused by RLS.
- **RLS test:** the policy snapshot after maintenance equals the enforced snapshot, not the baseline.
- **Static test:** no staged SQL recreates any old anonymous or self-write policy, drops a table, schema or column, or closes or deletes sessions or their data.
- **Browser:** the maintenance reply keeps the deck closed with the event-page notice, and free resources remain reachable.

## Readiness and remaining configuration
- **Deck side:** ready for Stage 1 when authorized. No new secret is needed; `PRESENTATION_PASSWORD` already exists.
- **MainSite (currently at `5685c0e6`):**
  1. The issuer must be exactly `https://www.joshpenzell.com`.
  2. Narrow canonicalization of the gated route only: the apex `/p/ai-for-all-minds-pnw-drupal-summit-2026-10-17` → www. Email links already use www.
  3. Secure Ed25519 signing-key provisioning (still being resolved), with the JWKS serving that key's `kid`.
  4. The MainSite gate flag must be on before Stage 3; a disabled introspect returns 404, which the deck denies.
  5. Introspect rate budget: one call per attendee action, plus one per renewal every 4 minutes per attendee.
  6. The parent iframe `src` on `https://drupalpnw.lovable.app` (root works).
- **Coordination:** Stage 3 needs one synthetic capture to confirm the edge runtime can reach www and that real tokens are accepted. The Stage 4 switch on both sides happens in one window.
