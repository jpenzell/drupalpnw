// Interactive gate switch for the page.
//   "off"     — today's behavior exactly; no gate code runs (current setting).
//   "dual"    — inside the MainSite frame, attendee writes use the grant; otherwise the old path.
//   "enforce" — attendee writes require a grant; standalone joins go to MainSite capture.
// Change only at the coordinated stage in gate/README.md, together with the backend step.
export type GateMode = "off" | "dual" | "enforce";
export const GATE_MODE = "off" as GateMode;

export const MAINSITE_ORIGIN = "https://www.joshpenzell.com";
export const MAINSITE_CAPTURE_URL =
  "https://www.joshpenzell.com/p/ai-for-all-minds-pnw-drupal-summit-2026-10-17";
// PLACEHOLDER until MainSite's final contract names the message types.
export const HANDSHAKE_MESSAGE_TYPE = "pnw2-interactive-access";
// Ask the parent for a fresh token this long before the current grant expires.
export const RENEW_BEFORE_MS = 60_000;
