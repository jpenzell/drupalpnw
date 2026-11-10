// STAGED — not deployed. Shared check for every attendee-reachable paid/interactive function.
// Accepts EITHER a live grant (from redeem-access) OR proven presenter authority.
// Presenter authority = a verified login token whose user owns an active session that was
// created through create-presenter-session (password-checked), recorded in presenter_sessions.
// A bare anonymous sign-in, or a caller-supplied presenter/session id, is never enough.

// deno-lint-ignore-file no-explicit-any
export type Access =
  | { kind: "attendee"; participantKey: string; sessionId: string | null }
  | { kind: "presenter"; userId: string; sessionId: string };

export async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** `admin` is a service-role client; `userClient` verifies the caller's own login token. */
export async function requireInteractiveAccess(req: Request, admin: any, userClient: any): Promise<Access | null> {
  const grant = req.headers.get("x-pnw2-grant");
  if (grant && grant.length <= 128) {
    const { data } = await admin
      .from("access_grants")
      .select("participant_key, session_id, expires_at, revoked_at")
      .eq("grant_hash", await sha256Hex(grant))
      .maybeSingle();
    if (data && !data.revoked_at && new Date(data.expires_at).getTime() > Date.now()) {
      return { kind: "attendee", participantKey: data.participant_key, sessionId: data.session_id };
    }
  }

  const auth = req.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) {
    const { data: claims } = await userClient.auth.getClaims(auth.slice(7));
    const userId = claims?.claims?.sub;
    if (userId) {
      // Authority comes from the server-written row, not from anything the caller sends.
      const { data: ps } = await admin
        .from("presenter_sessions")
        .select("session_id, sessions!inner(is_active, presenter_id)")
        .eq("presenter_user_id", userId)
        .eq("sessions.is_active", true)
        .eq("sessions.presenter_id", userId)
        .limit(1)
        .maybeSingle();
      if (ps) return { kind: "presenter", userId, sessionId: ps.session_id };
    }
  }
  return null;
}

export function allowedOrigin(req: Request, allowed: string[]): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-pnw2-grant",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}
