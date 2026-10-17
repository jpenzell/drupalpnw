# Project Decisions

- Keep event identity in semantic global color tokens and `PresentationModeContext` so the deck, controls, and connection page stay synchronized.
- Shorten a run by flagging optional screens in `SPARE_IDS` in `src/pages/Index.tsx`, never by deleting slides, so the presenter can drop or restore them live and the full deck stays shareable afterwards.
- Set the delivered running order with `RUN_ORDER` in `src/pages/Index.tsx` (screen definitions stay where they are; unlisted screens fall to the appendix), so the talk can be resequenced without moving slide code.
- Restart the preview server only after file writes have landed, never in the same batch as the edits it should serve, because a server that starts mid-write keeps serving the pre-edit module until the next restart.
- Keep brand text colors readable on full-bleed photo slides by lifting them to light tints inside the `.zen-dark` scope in `src/index.css`, and use the `paper` overlay on `ZenBackdrop` when a slide should read light — so no slide ships brand-colored text that disappears against its own backdrop.
- Let participants join and answer polls even without a completed anonymous sign-in (anon-role RLS policies on active sessions/polls/responses plus a local fallback participant id), because the sign-up endpoint is rate-limited per IP and a full room shares one venue IP.
- Render the shared connection form directly on S29 for joined participants, while the stage links to /connect by QR, so phones need not scan their own screen and both paths keep the same options.
- Keep closing resources in the shared connection page, including its confirmation state, so QR visitors and joined participants have identical access before and after submitting.
- Present personal clinical evidence as a rebuilt graphic of the one number that carries the story, never as the report page itself, because the document's fine print is unreadable at projector distance and it names the presenter.
