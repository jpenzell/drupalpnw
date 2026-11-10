// Gate switch for the page. "off" keeps today's behavior exactly; flip only at coordinated activation.
export type GateMode = "off" | "enforce";
export const GATE_MODE: GateMode = "off";

export const MAINSITE_ORIGIN = "https://www.joshpenzell.com";
export const MAINSITE_CAPTURE_URL =
  "https://www.joshpenzell.com/p/ai-for-all-minds-pnw-drupal-summit-2026-10-17";
// Placeholder until MainSite sends the final contract.
export const HANDSHAKE_MESSAGE_TYPE = "pnw2-interactive-access";
