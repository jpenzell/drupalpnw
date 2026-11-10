// STAGED — presenter authority from the EXISTING PRESENTATION_PASSWORD secret (same comparison as
// verify-password) plus a verified Lovable Cloud login. "authorize" records the login server-side
// for 12 hours; "create_session" creates the event's canonical session. Attendee (MainSite) tokens
// are refused here outright: they never grant host actions.
import { looksLikeMainSiteToken } from "../_shared/accessToken.ts";
import { bearerOf, corsFor, type GateDeps, jsonResponse, mapDbError, readJson } from "../_shared/gateHttp.ts";

export function timingSafeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}

export async function handleCreatePresenterSession(req: Request, deps: GateDeps): Promise<Response> {
  const cors = corsFor(req, deps.allowedOrigins);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return jsonResponse(cors, { error: "method" }, 405);
  const origin = req.headers.get("Origin");
  if (!origin || !deps.allowedOrigins.includes(origin)) return jsonResponse(cors, { error: "origin" }, 403);

  const bearer = bearerOf(req);
  if (bearer && looksLikeMainSiteToken(bearer)) return jsonResponse(cors, { error: "attendee_token_not_allowed" }, 403);
  const userId = bearer ? await deps.getUserId(bearer) : null;
  if (!userId) return jsonResponse(cors, { error: "unauthorized" }, 401);

  const body = await readJson(req);
  if (!body) return jsonResponse(cors, { error: "malformed" }, 400);

  if (body.action === "authorize") {
    if (!deps.presentationPassword) return jsonResponse(cors, { error: "not_configured" }, 503);
    if (typeof body.password !== "string" || body.password.length === 0 || body.password.length > 100 ||
        !timingSafeEqual(body.password, deps.presentationPassword)) {
      return jsonResponse(cors, { error: "unauthorized" }, 401);
    }
    const { data, error } = await deps.admin.rpc("gate_authorize_presenter", { p_user: userId });
    if (error) {
      const m = mapDbError(error.message);
      return jsonResponse(cors, { error: m.code }, m.status);
    }
    return jsonResponse(cors, { authorized_until: data });
  }

  if (body.action === "create_session") {
    const { data, error } = await deps.admin.rpc("gate_create_presenter_session", { p_user: userId });
    if (error) {
      const m = mapDbError(error.message);
      return jsonResponse(cors, { error: m.code }, m.status);
    }
    return jsonResponse(cors, { session: data });
  }

  return jsonResponse(cors, { error: "unknown_action" }, 400);
}
