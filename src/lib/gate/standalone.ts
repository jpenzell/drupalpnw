import type { GateMode } from "./config";

/** Pages that must stay reachable for everyone (email unsubscribe links). */
export const FREE_PATHS = ["/unsubscribe", "/email-unsubscribe"];
/** Deliberate presenter entry: existing presentation password, checked server-side. */
export const PRESENTER_PATH = "/presenter";

export type Entry =
  | "render" // gate off/dual, or a free page
  | "await_access" // inside MainSite: wait for a verified token before showing the deck
  | "presenter_login" // standalone presenter entry
  | "check_presenter"; // any other standalone visit: show only to an authorized presenter, else redirect

/**
 * Whole-deck entry rule once enforced: every interactive page — stage root, canvas, rehearsal,
 * connect, join links — needs either MainSite access (framed) or proven presenter authority.
 */
export function entryDecision(opts: { mode: GateMode; embedded: boolean; pathname: string }): Entry {
  if (opts.mode !== "enforce") return "render";
  if (FREE_PATHS.includes(opts.pathname)) return "render";
  if (opts.embedded) return "await_access";
  if (opts.pathname === PRESENTER_PATH) return "presenter_login";
  return "check_presenter";
}

/**
 * Where a join/connect attempt should go instead, or null to stay (enforce, standalone only).
 * Kept for the join and connect handlers; whole-page entry is decided by entryDecision.
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
