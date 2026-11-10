import type { GateMode } from "./config";

/**
 * Where a visit should go instead of joining interactively, or null to stay.
 * Only "enforce" redirects, and only standalone (not framed by MainSite) attendee entry points:
 * a join link/code or the legacy connect form. The presenter's stage deck at "/" never redirects.
 */
export function standaloneRedirectTarget(opts: {
  mode: GateMode;
  embedded: boolean;
  pathname: string;
  search: string;
  joining?: boolean;
  captureUrl: string;
}): string | null {
  if (opts.mode !== "enforce" || opts.embedded) return null;
  const hasJoin = new URLSearchParams(opts.search).has("join");
  if (opts.joining || hasJoin || opts.pathname === "/connect") return opts.captureUrl;
  return null;
}
