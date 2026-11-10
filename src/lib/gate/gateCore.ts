// Attendee access lifecycle, independent of React and the backend client (testable).
// The MainSite token is held in memory only and never used at or past its own expiry.
// Renewal = a fresh token through the verified parent handshake, re-confirmed by the server.
import type { GateMode } from "./config";

export interface SessionRow {
  id: string;
  code: string;
  current_slide: string;
  is_active: boolean;
  created_at: string;
}

export interface Access {
  token: string;
  expiresAt: number; // ms, as verified and returned by the server
  participantKey: string;
  session: SessionRow | null; // live canonical session chosen server-side; null = none running (self-guided)
}

export type Invoker = (
  name: string,
  opts: { body?: unknown; headers?: Record<string, string> },
) => Promise<{ data: any; error: unknown }>;

export interface TokenSource {
  request(): void;
  onToken(cb: (token: string) => void): () => void;
}

export interface GateCoreDeps {
  mode: GateMode;
  invoke: Invoker;
  tokens: TokenSource | null; // null when not framed by MainSite
  now?: () => number;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (id: unknown) => void;
  tokenWaitMs?: number;
  renewBeforeMs?: number;
  onError?: (code: string) => void; // e.g. session_inactive → "live activity not running"
}

export type SubmitResult = { ok: true; data: any } | { ok: false; error: string };

export function createGateCore(deps: GateCoreDeps) {
  const now = deps.now ?? (() => Date.now());
  const setTimer = deps.setTimer ?? ((fn, ms) => setTimeout(fn, ms));
  const clearTimer = deps.clearTimer ?? ((id) => clearTimeout(id as ReturnType<typeof setTimeout>));
  const renewBefore = deps.renewBeforeMs ?? 60_000;
  let current: Access | null = null;
  let active = false;
  let renewTimer: unknown = null;
  let unsubscribe: (() => void) | null = null;
  let inflight: Promise<Access | null> | null = null;
  const listeners = new Set<(a: Access | null) => void>();
  const emit = () => listeners.forEach((l) => l(access()));

  function access(): Access | null {
    return current && current.expiresAt > now() ? current : null;
  }

  async function identify(token: string): Promise<Access | null> {
    const { data, error } = await deps.invoke("submit-interaction", {
      body: { action: "identify" },
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = data?.data;
    if (error || !data?.ok || !d?.participant_key || typeof data.expires_at !== "string") return null;
    if (d.session !== null && !d.session?.id) return null;
    const expiresAt = Date.parse(data.expires_at);
    if (!Number.isFinite(expiresAt) || expiresAt <= now()) return null;
    return { token, expiresAt, participantKey: d.participant_key, session: d.session };
  }

  function schedule(a: Access) {
    if (renewTimer) clearTimer(renewTimer);
    renewTimer = setTimer(() => deps.tokens?.request(), Math.max(5_000, a.expiresAt - now() - renewBefore));
  }

  function ensureSubscribed() {
    if (unsubscribe || !deps.tokens) return;
    unsubscribe = deps.tokens.onToken(async (token) => {
      if (!active) return;
      const next = await identify(token);
      if (next) {
        current = next; // replaced, never extended: expiry comes from the new token
        schedule(next);
        emit();
      }
    });
  }

  function listen(cb: (a: Access | null) => void): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }

  /** Framed attendees only: handshake → server verification → canonical session. */
  async function connect(): Promise<Access | null> {
    if (deps.mode === "off" || !deps.tokens) return null;
    active = true;
    ensureSubscribed();
    const existing = access();
    if (existing) return existing;
    if (inflight) return inflight; // concurrent callers share one handshake
    current = null;
    inflight = new Promise<Access | null>((resolve) => {
      let done = false;
      const off = listen((a) => {
        if (!done && a) { done = true; off(); clearTimer(t); resolve(a); }
      });
      const t = setTimer(() => { if (!done) { done = true; off(); resolve(null); } }, deps.tokenWaitMs ?? 8_000);
      deps.tokens!.request();
    });
    const p = inflight;
    void p.finally(() => { if (inflight === p) inflight = null; });
    return p;
  }

  function disconnect() {
    active = false;
    current = null;
    if (renewTimer) clearTimer(renewTimer);
    renewTimer = null;
    unsubscribe?.();
    unsubscribe = null;
    emit();
  }

  async function submit(action: string, payload: Record<string, unknown>): Promise<SubmitResult> {
    const a = access();
    if (!a) {
      deps.onError?.("access_required");
      return { ok: false, error: "access_required" };
    }
    const { data, error } = await deps.invoke("submit-interaction", {
      body: { action, ...payload },
      headers: { Authorization: `Bearer ${a.token}` },
    });
    if (error || !data?.ok) {
      const code = typeof data?.error === "string" ? data.error : "failed";
      deps.onError?.(code);
      return { ok: false, error: code };
    }
    return { ok: true, data: data.data };
  }

  /** Off: always the existing direct write. Access held: gated. Enforce without access: blocked. */
  async function route<T>(gated: (a: Access) => Promise<T>, direct: () => Promise<T>, blocked: T): Promise<T> {
    if (deps.mode === "off") return direct();
    const a = access();
    if (a) return gated(a);
    if (deps.mode === "enforce") return blocked;
    return direct();
  }

  /** For guarded paid functions: send the attendee token as Authorization: Bearer when held. */
  function withAccessHeader<O extends object>(opts: O | undefined): O | undefined {
    const a = deps.mode === "off" ? null : access();
    if (!a) return opts;
    const prev = (opts as { headers?: Record<string, string> } | undefined)?.headers ?? {};
    return { ...(opts ?? ({} as O)), headers: { ...prev, Authorization: `Bearer ${a.token}` } } as O;
  }

  return { access, connect, disconnect, submit, route, withAccessHeader, listen };
}

export type GateCore = ReturnType<typeof createGateCore>;
