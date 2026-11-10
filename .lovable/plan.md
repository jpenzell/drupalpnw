# PNW2 interactive-access gate — inspection report and proposed contract

Read-only findings. Nothing was changed, published, sent or created.

## 1. Owning domain
- Published and primary URL: `https://drupalpnw.lovable.app`. No custom domain is connected.
- The join QR and connect links are hardcoded to that origin (`PUBLIC_ORIGIN` in `src/lib/publicUrl.ts`).
- The published build is older than the preview. A publish is still pending from earlier work.

## 2. Current surface (all unauthenticated today)
This is a single-page app. The browser talks straight to the database with the public key. That means any gate built only into the page can be bypassed by calling the database directly.

Pages: `/` (deck, `?join=CODE`), `/connect` (`?join=`), `/canvas`, `/rehearsal`, `/unsubscribe`, `/email-unsubscribe`.

Sessions:
- The presenter signs in anonymously, then inserts into `sessions`, so `presenter_id` is set to `auth.uid()`.
- Attendees only read active sessions by code (anon or authenticated). Attendees never create sessions.

Interactive data and who can write it today:

| Data | Who can write today |
|---|---|
| `responses` (all live polls, percentage poll, random number) | Anonymous visitors can insert and update when the session is active. Any non-empty `participant_id` is accepted, including the local fallback id the client makes up itself. Signed-in users write their own rows. |
| `polls` | Only the presenter can write. Anyone can read. |
| `story_*` tables, `big_idea_submissions` | Any signed-in user, which includes anonymous sign-ins. |
| `connect_submissions` | Anyone can insert. This is the current lead form. |

Server functions:
- Functions that call paid AI providers: `translate-caption`, `live-ai-demo`, `presentation-ai-assistant`, `scene-rehearsal`, `probability-words-*`, `multi-ai-estimate`, `random-number-demo`, `pick-number`, `josh-gpt`, `transform-headshot`, `regenerate-era-image`, `test-prompt`.
- Other functions: `send-connect-notification`, `verify-password`.
- All of them answer CORS with `Access-Control-Allow-Origin: *`. None checks who the caller is.

Other notes:
- `PasswordGate` exists in the code but is not mounted anywhere. Presenter controls are not password-protected today.
- Captions run in the presenter's browser and reach phones over a live channel. Translation goes through `translate-caption`.

## 3. Answer: can the backend validate a short-lived signed access from MainSite?
Yes, but only if the check runs on the server. The smallest design that cannot be bypassed:

1. **MainSite issues the token.** It does this only after the lead is saved. The token is a JWT signed with EdDSA (Ed25519) or ES256. MainSite keeps the private key. PNW2 stores only the public key, as a secret named `MAINSITE_ACCESS_PUBLIC_KEY`.
2. **How the token arrives.** MainSite redirects the attendee to `https://drupalpnw.lovable.app/?join=CODE#access=<jwt>`. The fragment never reaches server logs. The page reads it, stores it in sessionStorage, and removes it from the URL.
3. **Redeeming the token.** A new function, `redeem-access`, checks the signature and claims. It records the token's `jti` once in a new table, `access_grants`, with columns `jti`, `lead_ref`, `presentation`, `session_code`, `participant_key` and `exp`. It returns an opaque grant id. It never creates sessions.
4. **Writes go through the server.** A new function, `submit-interaction`, takes the grant and the payload. It checks that the grant is unexpired and matches an active session, then writes to `responses`, `story_*` or `big_idea_submissions`. Writes use the service role, and the participant is derived from the grant.
5. **Direct writes are closed.** Anonymous and anonymous-signed-in users lose direct INSERT/UPDATE on those tables. The presenter keeps their current access, checked through `presenter_id = auth.uid()`. Reads of aggregates stay as they are, so the stage display does not change.
6. **Paid AI functions are protected.** Attendee-triggered paid functions require either a valid grant or the presenter. `translate-caption` stays free, because captions and transcript are free.

Stays free with no gate: viewing the deck, captions, Québec French translation, recordings and transcript.

## 4. Verification contract (needs MainSite to confirm)
```text
header: { alg: "EdDSA", kid: "<key id>", typ: "JWT" }
claims:
  iss  = "https://<mainsite origin>"        (exact match)
  aud  = "pnw2-interactive"                 (exact match)
  sub  = opaque lead reference (no email/name)
  pres = "ai-for-all-minds-2026"            (presentation scope)
  scode= "ABCD" | absent                    (optional session binding)
  iat, nbf, exp  (exp - iat <= 4h; 60s clock skew)
  jti  = UUID, single-redeem
```
- Key rotation: a `kid` lookup against a list of trusted public keys.
- Revocation: block by `jti` or `sub` in `access_grants`.
- The token carries no personal data. MainSite remains the canonical CRM.
- Redeem failure codes: `expired`, `bad_signature`, `wrong_audience`, `replayed`, `session_inactive`.

## 5. Origin, CORS and cookie constraints
- MainSite and `drupalpnw.lovable.app` are different sites. A cookie set by MainSite is third-party on PNW2, and Safari and Chrome block it. Use a token passed in the redirect and then a bearer header, not cookies.
- `redeem-access` and `submit-interaction` should allow only `https://drupalpnw.lovable.app`, plus the preview origin for testing. They should not use `*`.
- MainSite never calls PNW2's database directly. If MainSite needs server-to-server calls later (for example a revocation push), that needs a separate shared secret.
- A connected custom domain would change the allowed origin and the QR origin. Pick that domain before the contract is frozen.

## 6. Preserved
- All slides, the running order, spare screens, the presenter flow and session creation stay as they are.
- `/connect` stays for now. Once MainSite is canonical, the QR could point there instead.

## 7. Open decisions for the coordinated contract
1. Signing: asymmetric (recommended) or a shared HS256 secret?
2. Token lifetime, and whether it is tied to one session code.
3. Should the `/connect` form and `send-connect-notification` be retired in favor of MainSite?
4. Do presenter-only demos (paid AI on stage) need a presenter password? `PasswordGate` is currently unused.
5. Final public origin: keep `drupalpnw.lovable.app` or connect a custom domain.

Implementation starts only after MainSite provides the contract.
