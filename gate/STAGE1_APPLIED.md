# PNW2 gate: Stage 1 applied (dormant, maintenance)

Applied 2026-11-10 (UTC), starting from reviewed revision `d065f16`. This was Stage 1 only.

## Not done
- The 12 guarded paid functions and the retired notification were not deployed.
- `02_enforce.sql` was not applied.
- `GATE_MODE` is still `"off"`.
- Nothing was published.

## Drift check before applying (live backend vs `gate/test/baseline_schema.sql`)
| Item | Live | Baseline | Result |
|---|---|---|---|
| Public policies on deck tables, md5 of name, command, roles, using and check | 32 / `b1c83ed64863d09a0e83aa8bd65aed2e` | 32 / `b1c83ed64863d09a0e83aa8bd65aed2e` | identical |
| Deck table columns, md5 | 64 / `c8408890e23e80298b455b5658bcff5c` | 64 / `c8408890e23e80298b455b5658bcff5c` | identical |
| Existing `gate_*` / `is_proven_presenter` objects | none | none | identical |
| `responses (poll_id, participant_id)` unique index, needed by the upsert | present | present | identical |

- **Staged files:** the hashes in `bun gate/scripts/activation-map.ts` match `gate/ACCEPTANCE.md`.
- **Tests:** `bash gate/test/run.sh` gave 69 pass, 0 fail.

## Applied
| Step | Evidence |
|---|---|
| Migration | `drizzle/migrations/0003_pnw2_gate_stage1_dormant.sql` (journal idx 3). sha256 `fca93595ef2a323df48c24d3189c42a3a6ab6a8b54d4a69c9687ab9336774f75`, byte-identical to `gate/migrations/01_dormant_gate.sql`. |
| Config row | `gate/data/stage1_config.sql`. Readback: `{"id":1,"interactive_enabled":false,"presentation_id":16460,"workshop_id":9503,"canonical_session_id":null,"updated_at":"2026-11-10T09:12:50.922851+00:00"}` |
| Shared modules | `supabase/functions/_shared/{accessToken,attendee,gateHttp,guardRuntime,interactiveGuard,mainsite,runtime}.ts`, each `cmp`-identical to its `gate/functions/_shared/` source. |
| `submit-interaction` | Deployed. Platform source_sha256 `cad6b27b79f2a929445e950c7a798e804d1cca208fb53792546259a385982971`. |
| `create-presenter-session` | Deployed. Platform source_sha256 `1f93a7a699ccb0b94853a36416c40fd7d3affbf677623cff184332fd8c54605f`. |

The deployed function files still carry the header comment "STAGED — not deployed". They were left unedited so they stay byte-identical to the reviewed source.

## Readback after applying

### Schema and permissions
- **Existing policies:** the policy digest is still `b1c83ed6…`, so no existing policy changed.
- **New tables:** RLS is on and there are no policies on `gate_config`, `presenter_authorizations` or `presenter_sessions`.
- **Visitor reads and writes on the new tables:**
  - visitor reads of all three tables return `[]`;
  - a visitor insert into `gate_config` returns 401 / 42501, RLS;
  - a visitor update returns 0 rows;
  - the config row is unchanged.

  Note: the platform's default privileges give the new tables the same anon/authenticated table grants as every existing table. RLS with no policies is what denies access.
- **Function execute rights:**
  - All 13 `gate_*` functions: anon false, authenticated false, service_role true.
  - `is_proven_presenter`: authenticated and service_role only.
  - Visitor RPC calls to `gate_identify`, `gate_authorize_presenter`, `gate_create_presenter_session` and `is_proven_presenter` return 401 / 42501.

### Maintenance at the database (synthetic key `lead_000…0`; nothing written)
| Call | Result |
|---|---|
| `gate_identify` | `gate:maintenance` |
| `gate_submit_poll_response` | `gate:maintenance`, raised before any insert |
| `gate_check_access` (attendee) | NULL |
| `gate_check_access` (unknown presenter) | NULL |
| `gate_presenter_status` | NULL |
| `gate_canonical_session()` | NULL |

### Function denials (no token was sent, so no request reached MainSite)
**`submit-interaction`:**
| Request | Result |
|---|---|
| Preflight from the deck origin | 200, exact `Access-Control-Allow-Origin` |
| Foreign origin or no origin | 403 `origin` |
| `identify` / `poll_response` without a token | 401 `access_required` |
| `participant_id` or `session_code` in the body | 400 `identity_not_allowed` |
| Unknown action | 400 |
| GET | 405 |

**`create-presenter-session`:**
| Request | Result |
|---|---|
| No login | 401 |
| Publishable key used as bearer | 401 |
| EdDSA attendee-shaped bearer | 403 `attendee_token_not_allowed` |
| Foreign origin | 403 |

Both functions' logs show clean boots and no errors.

### Preserved
| Item | State |
|---|---|
| Rows | sessions 372, polls 240, responses 180, connect_submissions 19. Unchanged; none created or closed. |
| Gate tables | `presenter_authorizations` 0, `presenter_sessions` 0 |
| Public deck reads (active sessions, polls) | still 200 |
| Published site | still serves `assets/index-BJwF2DXK.js` |
| Preview build | OK |
| Presenter flow | Today's flow (`verify-password` plus existing RLS) is untouched. |

## Rollback for Stage 1
The state is already maintenance; `gate/data/rollback_maintenance.sql` is the same state. No old policy was replaced, so there is nothing to reopen. Removing the objects is not needed and is not part of the plan.

## Next: Stage 2, held until MainSite key/source release is verified
1. Set `src/lib/gate/config.ts` `GATE_MODE` from `"off"` to `"dual"`, then **Publish**.

   Publishing also releases every pending `src` change listed in `gate/ACCEPTANCE.md`, including the phone footer fix and the roadmap's unpublished closing and phone fixes. Review that list in the same window.
2. Stage 3, in the coordinated window: run `gate/data/stage3_enable_interactive.sql` and make one synthetic MainSite capture. This is the first time the edge runtime calls `https://www.joshpenzell.com/api/drupal-access/{jwks,introspect}`.
3. Stage 4: as in `gate/README.md`.
