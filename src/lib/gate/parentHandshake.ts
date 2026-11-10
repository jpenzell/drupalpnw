// MainSite parent-frame handshake, exactly per the final contract:
//   child → parent  {type:"pnw:access-request", nonce}            (to the exact parent origin)
//   parent → child  {type:"pnw:access-response", nonce, token}
// Accepted only from the exact origin, from window.parent itself, and only for a nonce we
// issued and have not yet used. The token lives in memory only (no storage, URL or analytics).

export const REQUEST_TYPE = "pnw:access-request";
export const RESPONSE_TYPE = "pnw:access-response";
const MAX_PENDING = 4;
const NONCE_TTL_MS = 30_000;

export interface HandshakeDeps {
  win: { parent: unknown; addEventListener: Window["addEventListener"]; removeEventListener: Window["removeEventListener"] };
  postToParent: (msg: unknown, origin: string) => void;
  randomNonce?: () => string;
  now?: () => number;
}

/** Embedded only when framed; standalone attendees are redirected to MainSite capture. */
export function isEmbedded(win: { parent: unknown; self?: unknown }): boolean {
  return win.parent !== undefined && win.parent !== null && win.parent !== (win.self ?? win);
}

export function defaultNonce(): string {
  const b = crypto.getRandomValues(new Uint8Array(32));
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); // 43 chars (≤ 128)
}

export function createParentChannel(parentOrigin: string, deps: HandshakeDeps) {
  const now = deps.now ?? (() => Date.now());
  const nonce = deps.randomNonce ?? defaultNonce;
  const pending = new Map<string, number>(); // nonce → issued at
  const subs = new Set<(token: string) => void>();

  const listener = (ev: MessageEvent) => {
    if (ev.origin !== parentOrigin) return;
    if (ev.source !== deps.win.parent) return;
    const d = ev.data as { type?: unknown; nonce?: unknown; token?: unknown } | null;
    if (!d || d.type !== RESPONSE_TYPE || typeof d.nonce !== "string" || typeof d.token !== "string") return;
    const issued = pending.get(d.nonce);
    if (issued === undefined || now() - issued > NONCE_TTL_MS) return;
    pending.delete(d.nonce); // single use
    if (d.token.length > 4096 || d.token.split(".").length !== 3) return;
    subs.forEach((s) => s(d.token as string));
  };
  deps.win.addEventListener("message", listener as EventListener);

  return {
    request() {
      for (const [n, at] of pending) if (now() - at > NONCE_TTL_MS) pending.delete(n);
      while (pending.size >= MAX_PENDING) pending.delete(pending.keys().next().value as string);
      const n = nonce();
      if (n.length === 0 || n.length > 128) throw new Error("nonce length");
      pending.set(n, now());
      deps.postToParent({ type: REQUEST_TYPE, nonce: n }, parentOrigin);
    },
    onToken(cb: (token: string) => void) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    stop() {
      deps.win.removeEventListener("message", listener as EventListener);
      pending.clear();
      subs.clear();
    },
  };
}
