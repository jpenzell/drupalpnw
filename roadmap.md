# Closing experience
- [x] Update closing email identity to AI for All Minds.
- [x] Add the official Inclusion Academy example to the QR destination and closing screen.
- [x] Verify phone links and form submission, deploy the email update, and check delivery status (sent event confirmed).

# Running order
- [x] Add and verify live phone percentages and room results for Slam dunk and Rarely on A1-3b; joined phone submitted 90% and 15%, both read back on stage.
- [x] Keep CC and Québec French controls visible on joined phones and the closing QR form; verified both buttons and preserved typed form input.
- [x] Cut AM-duck, AM-duck-results and AM-1000 from the delivered run (appendix only, nothing deleted).
- [x] Move AM-pupils to play right after AM-aware.
- [x] Re-lay out the bio slide (S1-bio) across the full stage width.
- [x] Rebuild the four uploaded diagnosis charts after the bio and verify their values and projector layout.
- [ ] Publish so the QR destination and today's phone fixes go live.

# Interactive access gate (MainSite canonical)
- [x] Stage 0: staged implementation aligned to the final MainSite contract (Ed25519, per-action introspection, server-side canonical session, nonce handshake, maintenance-only rollback, 12 guarded paid functions, post-event self-guided access with whole-deck entry gate) — 69 synthetic tests + 36/36 offline browser checks pass (gate/ACCEPTANCE.md).
- [x] MainSite: published; live JWKS serves Ed25519 kid 46bdcdc5ccffcc8ea943480d; introspect gate ON (401 without token).
- [x] Stage 1: dormant migration, maintenance config, shared modules, submit-interaction and create-presenter-session live; denials verified (gate/STAGE1_APPLIED.md).
- [x] Stage 2 source: `GATE_MODE` "dual"; tests, trial build and offline browser checks pass (gate/STAGE2_PREPARED.md).
- [x] Stage 2 publish — root deployment 27a81f8b at 179b28d; live bundle byte-identical to offline rebuild (gate/STAGE3_APPLIED.md).
- [x] Stage 3: interactive_enabled=true; forged-token denials and live JWKS reach verified (gate/STAGE3_APPLIED.md).
- [x] Stage 3 handshake fallback diagnosed (saved pre-gate presenter room skipped the handshake) and fixed in source; offline dual check 14/14 (gate/STAGE3_HANDSHAKE_FIX.md).
- [x] Publish the handshake fix (Stage 2 frontend redeploy) — root deployment 89beddf7.
- [x] Stage 3 acceptance: real framed identify 200 (04:31:15 UTC) and renewal 200 (04:35:16 UTC).
- [ ] Stage 3 live revocation check — not possible yet: MainSite has no supported revoke path (read-only production DB). Offline revoked-denial tests pass.
- [x] Stage 4 backend: 12 guards + retired notification deployed, 02_enforce.sql applied, GATE_MODE "enforce" in source (gate/STAGE4_APPLIED.md).
- [ ] Stage 4 publish of the enforce page — root publishes after review, then browser acceptance in gate/STAGE4_APPLIED.md.
