// Binds the gate core to the real backend client and the MainSite parent frame.
// With GATE_MODE "off" (current), every export behaves exactly like the existing direct calls.
import { supabase } from "@/integrations/supabase/client";
import { GATE_MODE, HANDSHAKE_MESSAGE_TYPE, MAINSITE_CAPTURE_URL, MAINSITE_ORIGIN, RENEW_BEFORE_MS } from "./config";
import { createGateCore, type TokenSource } from "./gateCore";
import { isEmbedded, startHandshake } from "./parentHandshake";
import { standaloneRedirectTarget } from "./standalone";

type InvokeOptions = Parameters<typeof supabase.functions.invoke>[1];

export function isEmbeddedWindow(): boolean {
  return typeof window !== "undefined" && isEmbedded(window as unknown as { parent: unknown; self: unknown });
}

function frameTokenSource(): TokenSource | null {
  if (GATE_MODE === "off" || !isEmbeddedWindow()) return null;
  const subs = new Set<(t: string) => void>();
  let handle: ReturnType<typeof startHandshake> | null = null;
  const ensure = () => {
    if (handle) return handle;
    handle = startHandshake(
      { parentOrigin: MAINSITE_ORIGIN, messageType: HANDSHAKE_MESSAGE_TYPE },
      { win: window, postToParent: (m, origin) => window.parent.postMessage(m, origin) },
      (t) => subs.forEach((s) => s(t)),
    );
    return handle;
  };
  return {
    request: () => ensure().requestToken(),
    onToken: (cb) => { subs.add(cb); return () => subs.delete(cb); },
  };
}

export const gate = createGateCore({
  mode: GATE_MODE,
  invoke: (name, opts) => supabase.functions.invoke(name, opts as InvokeOptions),
  tokens: frameTokenSource(),
  renewBeforeMs: RENEW_BEFORE_MS,
});

/** Drop-in for supabase.functions.invoke on guarded paid functions: adds the grant when held. */
export function invokeFunction<T = any>(name: string, options?: InvokeOptions) {
  return supabase.functions.invoke<T>(name, gate.withGrantHeader(options as { headers?: Record<string, string> }) as InvokeOptions);
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
 * presentation password (checked server-side), then creates a session bound to this event.
 */
export async function createPresenterSessionGated(askPassword: () => string | null = () => window.prompt("Presenter password") ) {
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
