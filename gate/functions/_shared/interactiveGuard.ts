// STAGED — the check every guarded paid function runs before any provider work.
// Access = a MainSite attendee token (verified + introspected now) while interactive services are
// enabled, OR a presenter login authorized with the existing PRESENTATION_PASSWORD (server-recorded).
// An EdDSA bearer is always treated as an attendee token — it never falls through to presenter
// checks, so attendee tokens never grant host actions. Bare anonymous sign-ins are never enough.
import { looksLikeMainSiteToken } from "./accessToken.ts";
import { authenticateAttendee } from "./attendee.ts";
import { bearerOf, corsFor, type GateDeps, jsonResponse, originAllowed } from "./gateHttp.ts";

export type Access =
  | { kind: "attendee"; participant_key: string; session_id: string }
  | { kind: "presenter"; user_id: string };

export async function checkInteractiveAccess(req: Request, deps: GateDeps): Promise<Access | null> {
  const bearer = bearerOf(req);
  if (!bearer) return null;
  if (looksLikeMainSiteToken(bearer)) {
    const auth = await authenticateAttendee(req, deps);
    if (!auth.ok) return null;
    const { data, error } = await deps.admin.rpc("gate_check_access", { p_participant_key: auth.participantKey, p_presenter_user: null });
    return error || !data ? null : (data as Access);
  }
  const userId = await deps.getUserId(bearer);
  if (!userId) return null;
  const { data, error } = await deps.admin.rpc("gate_check_access", { p_participant_key: null, p_presenter_user: userId });
  return error || !data ? null : (data as Access);
}

/** Returns a ready 401/403 Response when access is missing, or null to continue. */
export async function denyWithoutAccess(req: Request, deps: GateDeps): Promise<Response | null> {
  const cors = corsFor(req, deps.allowedOrigins);
  if (!originAllowed(req, deps.allowedOrigins)) return jsonResponse(cors, { error: "origin" }, 403);
  const access = await checkInteractiveAccess(req, deps);
  if (!access) return jsonResponse(cors, { error: "access_required" }, 401);
  return null;
}
