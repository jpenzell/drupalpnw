// Interactive access handshake with the MainSite parent frame.
// Dormant: nothing imports this until the gate is switched on (see gate/README.md).
// The token lives only in this module's memory — never localStorage/sessionStorage/URL.

export interface HandshakeConfig {
  parentOrigin: string; // exact, e.g. "https://www.joshpenzell.com"
  messageType: string; // exact message type agreed with MainSite
}

export interface HandshakeDeps {
  win: Pick<Window, "addEventListener" | "removeEventListener"> & { parent: unknown; top?: unknown };
  postToParent: (msg: unknown, origin: string) => void;
}

let currentToken: string | null = null;
let currentExp = 0;

export function getAccessToken(nowMs = Date.now()): string | null {
  return currentToken && currentExp * 1000 > nowMs ? currentToken : null;
}

export function clearAccessToken() {
  currentToken = null;
  currentExp = 0;
}

function readExp(token: string): number {
  // Unverified read only to schedule renewal; the server verifies the signature.
  try {
    const p = token.split(".")[1];
    const json = JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" ? json.exp : 0;
  } catch {
    return 0;
  }
}

/** Embedded only when we are inside a frame; standalone visits are redirected to MainSite. */
export function isEmbedded(win: { parent: unknown; top?: unknown; self?: unknown }): boolean {
  return win.parent !== undefined && win.parent !== (win.self ?? win);
}

export function startHandshake(cfg: HandshakeConfig, deps: HandshakeDeps, onToken?: (t: string) => void) {
  const listener = (ev: MessageEvent) => {
    if (ev.origin !== cfg.parentOrigin) return; // exact origin
    if (ev.source !== deps.win.parent) return; // exact source window
    const d = ev.data as { type?: unknown; token?: unknown } | null;
    if (!d || d.type !== cfg.messageType || typeof d.token !== "string") return;
    currentToken = d.token;
    currentExp = readExp(d.token);
    onToken?.(d.token);
  };
  deps.win.addEventListener("message", listener as EventListener);
  const requestToken = () => deps.postToParent({ type: `${cfg.messageType}:request` }, cfg.parentOrigin);
  requestToken();
  return {
    requestToken, // call again shortly before expiry to renew through the verified parent
    stop: () => deps.win.removeEventListener("message", listener as EventListener),
  };
}
