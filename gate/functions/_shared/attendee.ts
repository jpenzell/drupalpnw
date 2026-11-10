// STAGED — authenticates one attendee request: Authorization: Bearer <MainSite token>.
// 1) full local verification against the pinned issuer's JWKS, then 2) live introspection.
// Both must pass on every call; there is no positive cache and no fallback.
import { AccessTokenError, participantKey, verifyAccessToken } from "./accessToken.ts";
import { bearerOf, type GateDeps } from "./gateHttp.ts";

export type AttendeeAuth =
  | { ok: true; participantKey: string; exp: number }
  | { ok: false; status: number; code: string };

export async function authenticateAttendee(req: Request, deps: GateDeps): Promise<AttendeeAuth> {
  const token = bearerOf(req);
  if (!token) return { ok: false, status: 401, code: "access_required" };
  let jwks;
  try {
    jwks = await deps.jwks();
  } catch {
    return { ok: false, status: 503, code: "policy_unavailable" };
  }
  let access;
  try {
    access = await verifyAccessToken(token, jwks, deps.policy, deps.now());
  } catch (e) {
    return { ok: false, status: 401, code: e instanceof AccessTokenError ? e.code : "access_required" };
  }
  let result;
  try {
    result = await deps.introspect(token, access);
  } catch {
    return { ok: false, status: 503, code: "policy_unavailable" };
  }
  if (!result.active) {
    return result.reason === "unavailable"
      ? { ok: false, status: 503, code: "policy_unavailable" }
      : { ok: false, status: 401, code: "access_revoked" };
  }
  return { ok: true, participantKey: await participantKey(deps.policy, access), exp: access.exp };
}
