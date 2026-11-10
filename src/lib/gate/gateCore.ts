// Grant lifecycle for attendees, independent of React and the backend client (testable).
// A grant is held in memory only and is never used past its own expiry; renewal happens only
// by asking the verified MainSite parent for a fresh token and redeeming it again.
import type { GateMode } from "./config";

export interface Grant {
  grant: string;
  participantKey: string;
  sessionId: string;
  sessionCode: string;
  expiresAt: number; // ms
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
}

export type SubmitResult = { ok: true; data: any } | { ok: false; error: string };

export function createGateCore(deps: GateCoreDeps) {
  const now = deps.now ?? (() => Date.now());
  const setTimer = deps.setTimer ?? ((fn, ms) => setTimeout(fn, ms));
  const clearTimer = deps.clearTimer ?? ((id) => clearTimeout(id as ReturnType<typeof setTimeout>));
  const renewBefore = deps.renewBeforeMs ?? 60_000;
  let current: Grant | null = null;
  let boundCode: string | null = null;
  let renewTimer: unknown = null;
  let unsubscribe: (() => void) | null = null;
  const listeners = new Set<(g: Grant | null) => void>();

  const emit = () => listeners.forEach((l) => l(grant()));

  function grant(): Grant | null {
    return current && current.expiresAt > now() ? current : null;
  }

  async function redeem(token: string, code: string): Promise<Grant | null> {
    const { data, error } = await deps.invoke("redeem-access", { body: { token, session_code: code } });
    if (error || !data?.grant || typeof data.expires_at !== "string") return null;
    const expiresAt = Date.parse(data.expires_at);
    if (!Number.isFinite(expiresAt) || expiresAt <= now()) return null;
    return { grant: data.grant, participantKey: data.participant_key, sessionId: data.session_id, sessionCode: code, expiresAt };
  }

  function schedule(g: Grant) {
    if (renewTimer) clearTimer(renewTimer);
    const wait = Math.max(5_000, g.expiresAt - now() - renewBefore);
    renewTimer = setTimer(() => deps.tokens?.request(), wait);
  }

  function ensureSubscribed() {
    if (unsubscribe || !deps.tokens) return;
    unsubscribe = deps.tokens.onToken(async (token) => {
      if (!boundCode) return;
      const next = await redeem(token, boundCode);
      if (next) {
        current = next; // replaces, never extends: expiry comes from the new token
        schedule(next);
        emit();
      }
    });
  }

  async function connect(sessionCode: string): Promise<Grant | null> {
    if (deps.mode === "off" || !deps.tokens) return null;
    boundCode = sessionCode.toUpperCase();
    ensureSubscribed();
    const existing = grant();
    if (existing && existing.sessionCode === boundCode) return existing;
    current = null;
    const waitMs = deps.tokenWaitMs ?? 8_000;
    const got = await new Promise<Grant | null>((resolve) => {
      let done = false;
      const off = listen((g) => {
        if (!done && g) { done = true; off(); clearTimer(t); resolve(g); }
      });
      const t = setTimer(() => { if (!done) { done = true; off(); resolve(null); } }, waitMs);
      deps.tokens!.request();
    });
    return got;
  }

  function listen(cb: (g: Grant | null) => void): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }

  function disconnect() {
    boundCode = null;
    current = null;
    if (renewTimer) clearTimer(renewTimer);
    renewTimer = null;
    unsubscribe?.();
    unsubscribe = null;
    emit();
  }

  async function submit(action: string, payload: Record<string, unknown>): Promise<SubmitResult> {
    const g = grant();
    if (!g) return { ok: false, error: "access_required" };
    const { data, error } = await deps.invoke("submit-interaction", {
      body: { action, ...payload },
      headers: { "x-pnw2-grant": g.grant },
    });
    if (error || !data?.ok) return { ok: false, error: "failed" };
    return { ok: true, data: data.data };
  }

  /** Off: always the existing direct write. Grant held: gated. Enforce without grant: blocked. */
  async function route<T>(gated: (g: Grant) => Promise<T>, direct: () => Promise<T>, blocked: T): Promise<T> {
    if (deps.mode === "off") return direct();
    const g = grant();
    if (g) return gated(g);
    if (deps.mode === "enforce") return blocked;
    return direct();
  }

  function withGrantHeader<O extends object>(opts: O | undefined): O | undefined {
    const g = deps.mode === "off" ? null : grant();
    if (!g) return opts;
    const prev = (opts as { headers?: Record<string, string> } | undefined)?.headers ?? {};
    return { ...(opts ?? ({} as O)), headers: { ...prev, "x-pnw2-grant": g.grant } } as O;
  }

  return { grant, connect, disconnect, submit, route, withGrantHeader, listen };
}

export type GateCore = ReturnType<typeof createGateCore>;
