# Project Decisions

- Keep event identity in semantic global color tokens and `PresentationModeContext` so the deck, controls, and connection page stay synchronized.
- Shorten a run by flagging optional screens in `SPARE_IDS` in `src/pages/Index.tsx`, never by deleting slides, so the presenter can drop or restore them live and the full deck stays shareable afterwards.
- Set the delivered running order with `RUN_ORDER` in `src/pages/Index.tsx` (screen definitions stay where they are; unlisted screens fall to the appendix), so the talk can be resequenced without moving slide code.
- Restart the preview server only after file writes have landed, never in the same batch as the edits it should serve, because a server that starts mid-write keeps serving the pre-edit module until the next restart.
