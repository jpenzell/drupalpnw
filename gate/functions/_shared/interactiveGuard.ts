// STAGED — the check every guarded paid function runs before doing any provider work.
// Access = a live grant bound to an active session of this event, OR a presenter whose login
// was authorized with the existing PRESENTATION_PASSWORD (server-recorded). A bare anonymous
// sign-in, a caller-supplied presenter id or a caller-supplied session id is never enough.
import { sha256Hex } from "./accessToken.ts";
import { bearerOf, corsFor, GateDeps, GRANT_RE, jsonResponse, originAllowed } from "./gateHttp.ts";

export type Access =
  | { kind: "attendee"; participant_key: string; session_id: string }
  | { kind: "presenter"; user_id: string };

export async function checkInteractiveAccess(
  req: Request,
  deps: Pick<GateDeps, "admin" | "getUserId">,
): Promise<Access | null> {
  const grant = req.headers.get("x-pnw2-grant");
  const grantHash = grant && GRANT_RE.test(grant) ? await sha256Hex(grant) : null;
  const bearer = bearerOf(req);
  const userId = bearer ? await deps.getUserId(bearer) : null;
  if (!grantHash && !userId) return null;
  const { data, error } = await deps.admin.rpc("gate_check_access", {
    p_grant_hash: grantHash,
    p_presenter_user: userId,
  });
  if (error || !data || typeof data !== "object") return null;
  return data as Access;
}

/** Returns a ready 401/403 Response when access is missing, or null to continue. */
export async function denyWithoutAccess(
  req: Request,
  deps: Pick<GateDeps, "admin" | "getUserId" | "allowedOrigins">,
): Promise<Response | null> {
  const cors = corsFor(req, deps.allowedOrigins);
  if (!originAllowed(req, deps.allowedOrigins)) return jsonResponse(cors, { error: "origin" }, 403);
  const access = await checkInteractiveAccess(req, deps);
  if (!access) return jsonResponse(cors, { error: "access_required" }, 401);
  return null;
}
