// STAGED — exchange a verified five-minute MainSite token for a grant that expires WITH it,
// bound to one active session of this presentation/workshop. Never creates sessions, never
// sends email, never stores name/email. Renewal = a fresh MainSite token via the parent frame.
import { AccessTokenError, grantExpiry, participantKey, sha256Hex, verifyAccessToken } from "../_shared/accessToken.ts";
import { corsFor, GateDeps, jsonResponse, mapDbError, randomGrant, readJson } from "../_shared/gateHttp.ts";

const STATUS_FOR_TOKEN_ERROR: Record<string, number> = { malformed: 400, unknown_kid: 401 };

export async function handleRedeem(req: Request, deps: GateDeps): Promise<Response> {
  const cors = corsFor(req, deps.allowedOrigins);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return jsonResponse(cors, { error: "method" }, 405);
  // Browser-only endpoint: Origin must be present AND exact.
  const origin = req.headers.get("Origin");
  if (!origin || !deps.allowedOrigins.includes(origin)) return jsonResponse(cors, { error: "origin" }, 403);

  const body = await readJson(req);
  if (!body || typeof body.token !== "string") return jsonResponse(cors, { error: "malformed" }, 400);
  if (body.session_code !== undefined && typeof body.session_code !== "string") {
    return jsonResponse(cors, { error: "malformed" }, 400);
  }

  let jwks;
  try {
    jwks = await deps.jwks();
  } catch {
    return jsonResponse(cors, { error: "not_configured" }, 503);
  }

  let access;
  try {
    access = await verifyAccessToken(body.token, jwks, deps.policy, deps.now());
  } catch (e) {
    if (e instanceof AccessTokenError) {
      return jsonResponse(cors, { error: e.code }, STATUS_FOR_TOKEN_ERROR[e.code] ?? 401);
    }
    return jsonResponse(cors, { error: "unavailable" }, 503);
  }

  // Binding: a token-carried session code wins and must agree with the page's code.
  const bodyCode = typeof body.session_code === "string" ? body.session_code.toUpperCase() : undefined;
  if (access.sessionCode && bodyCode && access.sessionCode !== bodyCode) {
    return jsonResponse(cors, { error: "wrong_session" }, 403);
  }
  const code = access.sessionCode ?? bodyCode;
  if (!code || !/^[A-Z0-9]{4,8}$/.test(code)) return jsonResponse(cors, { error: "session_required" }, 400);

  const grant = randomGrant();
  const expiresAt = grantExpiry(access).toISOString();
  const key = await participantKey(deps.policy.issuer, access);
  const { data, error } = await deps.admin.rpc("gate_redeem", {
    p_jti: access.jti,
    p_lead_ref: access.sub,
    p_participant_key: key,
    p_presentation: access.scope.presentation,
    p_workshop: access.scope.workshop,
    p_session_code: code,
    p_grant_hash: await sha256Hex(grant),
    p_expires_at: expiresAt,
  });
  if (error) {
    const m = mapDbError(error.message);
    return jsonResponse(cors, { error: m.code }, m.status);
  }
  const row = data as { session_id: string };
  return jsonResponse(cors, { grant, participant_key: key, session_id: row.session_id, expires_at: expiresAt });
}
