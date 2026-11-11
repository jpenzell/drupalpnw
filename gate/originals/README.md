# Pre-guard function sources (reference only)

Byte copies of the 12 paid functions and `send-connect-notification` as they were live before Stage 4.
`gate/scripts/generate-guarded.ts` reads them to produce the guarded copies, and `gate/test/guarded.test.ts`
proves each guarded copy differs from its original only by the guard.

Never redeploy these files. Rollback is `gate/data/rollback_maintenance.sql` (maintenance, closed), never
the unguarded originals.
