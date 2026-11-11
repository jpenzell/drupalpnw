# Stage 3 acceptance monitoring (read-only) — next steps

Status at 04:31:32 UTC: live bundle `index-DGjbhbC1.js` (changed from `index-DB8uZkt3.js`); one `submit-interaction` POST 200 at 04:31:15 UTC (preflight 04:31:14); no KE6R reads/writes since 04:22.

1. Re-query `submit-interaction` request logs at about 04:35–04:36 UTC for the renewal: a second POST 200 confirms it; 401/403 means failed; no request means renewal never fired.
2. After root revokes at MainSite: the next action should get 401 `access_revoked`, with no new writes.
3. Optional: rebuild clean `95ef338` offline and hash-compare against the live bundle, to prove they are byte-identical.
4. Stage 4 stays held until steps 1–2 pass.
