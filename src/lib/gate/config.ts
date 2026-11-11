// Interactive gate switch for the page.
//   "off"     — pre-gate behavior exactly; no gate code runs.
//   "dual"    — inside the MainSite frame, attendee writes use the MainSite token; otherwise old path (Stage 2).
//   "enforce" — attendee writes require the MainSite token; standalone joins go to MainSite capture (current setting, Stage 4).
// Change only at the coordinated stage in gate/README.md, together with the backend step.
export type GateMode = "off" | "dual" | "enforce";
export const GATE_MODE = "enforce" as GateMode;

// Exact parent origin (www; verified that the root does not redirect away from www).
export const MAINSITE_ORIGIN = "https://www.joshpenzell.com";
export const MAINSITE_CAPTURE_URL =
  "https://www.joshpenzell.com/p/ai-for-all-minds-pnw-drupal-summit-2026-10-17";
// Ask the parent for a fresh token this long before the current one expires (tokens last 300 s).
export const RENEW_BEFORE_MS = 60_000;
