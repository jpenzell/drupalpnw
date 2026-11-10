// OFFLINE stand-in for src/integrations/supabase/client.ts, used ONLY by the browser acceptance
// build (gate/test/browser/vite.gate-test.config.ts). It never contacts any backend: reads return
// empty, realtime is inert, auth lives in memory, and functions.invoke goes to the synthetic host
// https://functions.gate.test which the Playwright harness fulfils locally. It mirrors
// supabase-js behavior the gate depends on: Authorization defaults to the login's token unless the
// caller overrides it, and non-2xx replies return { data: null, error: FunctionsHttpError{context} }.

const FN = "https://functions.gate.test";
type Session = { access_token: string; user: { id: string } } | null;
let session: Session = null;
const authListeners = new Set<(event: string, s: Session) => void>();

const report = (kind: string, detail: unknown = {}) =>
  fetch(`${FN}/__report/${kind}`, { method: "POST", body: JSON.stringify(detail) }).catch(() => undefined);

function query(single = false): any {
  const result = () => Promise.resolve({ data: single ? null : [], error: null, count: 0 });
  const target: any = {
    then: (res: any, rej: any) => result().then(res, rej),
    catch: (rej: any) => result().catch(rej),
    finally: (f: any) => result().finally(f),
  };
  return new Proxy(target, {
    get(t, prop) {
      if (prop in t) return t[prop];
      if (prop === "single" || prop === "maybeSingle") return () => query(true);
      return () => query(single);
    },
  });
}

function channel(name: string): any {
  const ch: any = {
    name,
    on: () => ch,
    subscribe: (cb?: (s: string) => void) => { cb?.("SUBSCRIBED"); return ch; },
    send: async () => "ok",
    track: async () => "ok",
    untrack: async () => "ok",
    presenceState: () => ({}),
    unsubscribe: async () => "ok",
  };
  return ch;
}

export const supabase: any = {
  auth: {
    async getSession() { return { data: { session }, error: null }; },
    async getUser() { return { data: { user: session?.user ?? null }, error: null }; },
    onAuthStateChange(cb: (event: string, s: Session) => void) {
      authListeners.add(cb);
      return { data: { subscription: { unsubscribe: () => authListeners.delete(cb) } } };
    },
    async signInAnonymously() {
      await report("signin");
      session = { access_token: `fake-login-${crypto.randomUUID()}`, user: { id: crypto.randomUUID() } };
      authListeners.forEach((l) => l("SIGNED_IN", session));
      return { data: { user: session.user, session }, error: null };
    },
    async signOut() { session = null; return { error: null }; },
  },
  functions: {
    async invoke(name: string, opts: { body?: unknown; headers?: Record<string, string> } = {}) {
      const headers: Record<string, string> = {
        "content-type": "application/json",
        Authorization: session ? `Bearer ${session.access_token}` : "Bearer sb_publishable_fake",
        ...(opts.headers ?? {}),
      };
      let res: Response;
      try {
        res = await fetch(`${FN}/${name}`, { method: "POST", headers, body: JSON.stringify(opts.body ?? {}) });
      } catch (e) {
        return { data: null, error: Object.assign(new Error("FunctionsFetchError"), { context: e }) };
      }
      if (!res.ok) return { data: null, error: Object.assign(new Error("FunctionsHttpError"), { context: res }) };
      return { data: await res.json(), error: null };
    },
  },
  from: () => query(),
  rpc: () => query(),
  channel,
  removeChannel: async () => "ok",
  removeAllChannels: async () => [],
  getChannels: () => [],
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: { message: "offline" } }),
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
      remove: async () => ({ data: null, error: null }),
    }),
  },
};
