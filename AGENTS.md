# Project Decisions

- Keep event identity in semantic global color tokens and `PresentationModeContext` so the deck, controls, and connection page stay synchronized.
- Shorten a run by flagging optional screens in `SPARE_IDS` in `src/pages/Index.tsx`, never by deleting slides, so the presenter can drop or restore them live and the full deck stays shareable afterwards.
