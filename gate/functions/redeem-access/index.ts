// STAGED — not deployed. Verifies a MainSite token and issues a grant that expires WITH the token.
// Never creates sessions. Never sends email. Renewal = a new MainSite token via the verified parent.
import { createClient } from "npm:@supabase/supabase-js@2";
import { AccessTokenError, PNW2_POLICY, grantExpiry, participantKey, verifyAccessToken } from "../_shared/accessToken.ts";
import { allowedOrigin, sha256Hex } from "../_shared/interactiveGuard.ts";

const ORIGINS = (Deno.env.get("PNW2_ALLOWED_ORIGINS") ?? "https://drupalpnw.lovable.app").split(",");
const JWKS_URL = Deno.env.get("MAINSITE_JWKS_URL"); // required input from MainSite
let jwksCache: { at: number; keys: any[] } | null = null;

async function jwks() {
  if (!JWKS_URL) throw new Error("not_configured");
  if (jwksCache && Date.now() - jwksCache.at < 10 * 60_000) return { keys: jwksCache.keys };
  const r = await fetch(JWKS_URL, { headers: { accept: "application/json" } });
  if (!r.ok) throw new Error("jwks_unavailable");
  const body = await r.json();
  jwksCache = { at: Date.now(), keys: Array.isArray(body.keys) ? body.keys : [] };
  return { keys: jwksCache.keys };
}

Deno.serve(async (req) => {
  const cors = allowedOrigin(req, ORIGINS);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
  if (!ORIGINS.includes(req.headers.get("Origin") ?? "")) return json({ error: "origin" }, 403);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cfg } = await admin.from("gate_config").select("enforce").eq("id", 1).maybeSingle();
  if (!cfg) return json({ error: "not_configured" }, 503);

  let body: { token?: unknown; session_code?: unknown };
  try { body = await req.json(); } catch { return json({ error: "malformed" }, 400); }
  if (typeof body.token !== "string") return json({ error: "malformed" }, 400);

  try {
    const access = await verifyAccessToken(body.token, await jwks(), PNW2_POLICY);
    const code = (access.sessionCode ?? (typeof body.session_code === "string" ? body.session_code : ""))
      .toUpperCase().slice(0, 8);
    let sessionId: string | null = null;
    if (code) {
      const { data: s } = await admin.from("sessions").select("id").eq("code", code).eq("is_active", true).maybeSingle();
      if (!s) return json({ error: "session_inactive" }, 409);
      sessionId = s.id;
    }
    const grant = crypto.randomUUID() + crypto.randomUUID();
    const { error } = await admin.from("access_grants").insert({
      jti: access.jti, // unique — replay fails here
      lead_ref: access.sub,
      participant_key: await participantKey(PNW2_POLICY.issuer, access),
      session_id: sessionId,
      grant_hash: await sha256Hex(grant),
      expires_at: grantExpiry(access).toISOString(),
    });
    if (error) return json({ error: error.code === "23505" ? "replayed" : "unavailable" }, error.code === "23505" ? 409 : 500);
    return json({ grant, expires_at: grantExpiry(access).toISOString() });
  } catch (e) {
    if (e instanceof AccessTokenError) return json({ error: e.code }, 401);
    return json({ error: "unavailable" }, 503);
  }
});
