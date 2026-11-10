// Binds the gate core to the real backend client and the MainSite parent frame.
// With GATE_MODE "off" (current), every export behaves exactly like the existing direct calls.
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GATE_MODE, MAINSITE_CAPTURE_URL, MAINSITE_ORIGIN, RENEW_BEFORE_MS } from "./config";
import { createGateCore, type TokenSource } from "./gateCore";
import { createParentChannel, isEmbedded } from "./parentHandshake";
import { standaloneRedirectTarget } from "./standalone";

type InvokeOptions = Parameters<typeof supabase.functions.invoke>[1];

export function isEmbeddedWindow(): boolean {
  return typeof window !== "undefined" && isEmbedded(window as unknown as { parent: unknown; self: unknown });
}

function frameTokenSource(): TokenSource | null {
  if (GATE_MODE === "off" || !isEmbeddedWindow()) return null;
  let channel: ReturnType<typeof createParentChannel> | null = null;
  const ensure = () =>
    (channel ??= createParentChannel(MAINSITE_ORIGIN, {
      win: window,
      postToParent: (m, origin) => window.parent.postMessage(m, origin),
    }));
  return {
    request: () => ensure().request(),
    onToken: (cb) => ensure().onToken(cb),
  };
}

/** Like functions.invoke, but surfaces the gate's JSON error code from non-2xx replies. */
async function invokeWithCode(name: string, opts: unknown) {
  const r = await supabase.functions.invoke(name, opts as InvokeOptions);
  const ctx = (r.error as { context?: unknown } | null)?.context;
  if (r.error && ctx instanceof Response) {
    try {
      return { data: await ctx.clone().json(), error: r.error };
    } catch {
      /* not JSON */
    }
  }
  return r;
}

const ERROR_COPY: Record<string, string> = {
  session_inactive: "Live activity isn't running right now. You can still explore the deck and demos on your own.",
  maintenance: "Interactive features are paused right now.",
  access_revoked: "Your access has ended. Please reopen the presentation from the event page.",
  access_required: "Your access has expired. Please reopen the presentation from the event page.",
  policy_unavailable: "We couldn't confirm your access just now. Please try again in a moment.",
};

export const gate = createGateCore({
  mode: GATE_MODE,
  invoke: invokeWithCode,
  tokens: frameTokenSource(),
  renewBeforeMs: RENEW_BEFORE_MS,
  onError: (code) => {
    if (ERROR_COPY[code]) toast(ERROR_COPY[code]);
  },
});

/** Drop-in for supabase.functions.invoke on guarded paid functions: adds the attendee token when held. */
export function invokeFunction<T = any>(name: string, options?: InvokeOptions) {
  return supabase.functions.invoke<T>(name, gate.withAccessHeader(options));
}

/** In enforce mode, sends standalone attendee entry points to MainSite capture. Returns true if redirecting. */
export function redirectStandaloneAttendee(joining = false): boolean {
  if (typeof window === "undefined") return false;
  const target = standaloneRedirectTarget({
    mode: GATE_MODE,
    embedded: isEmbeddedWindow(),
    pathname: window.location.pathname,
    search: window.location.search,
    joining,
    captureUrl: MAINSITE_CAPTURE_URL,
  });
  if (!target) return false;
  window.location.replace(target);
  return true;
}

/**
 * Presenter session creation once the gate is on: proves presenter authority with the existing
 * presentation password (checked server-side), then creates the event's canonical session.
 */
export async function createPresenterSessionGated(askPassword: () => string | null = () => window.prompt("Presenter password")) {
  const create = () => supabase.functions.invoke("create-presenter-session", { body: { action: "create_session" } });
  let res = await create();
  if (res.error) {
    const password = askPassword();
    if (!password) return null;
    const auth = await supabase.functions.invoke("create-presenter-session", { body: { action: "authorize", password } });
    if (auth.error) return null;
    res = await create();
  }
  return (res.data?.session ?? null) as {
    id: string; code: string; current_slide: string; is_active: boolean; created_at: string; presenter_id?: string;
  } | null;
}

/** Standalone deck entry: is this browser's login a password-authorized presenter? (server-checked) */
export async function presenterAuthorized(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const r = await supabase.functions.invoke("create-presenter-session", { body: { action: "status" } });
  return !r.error && typeof r.data?.authorized_until === "string";
}

/** Deliberate presenter entry with the existing presentation password. Creates no session. */
export async function authorizePresenter(password: string): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) return false;
  }
  const r = await supabase.functions.invoke("create-presenter-session", { body: { action: "authorize", password } });
  return !r.error && typeof r.data?.authorized_until === "string";
}
