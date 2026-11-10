// STAGED — the only attendee write path once enforced. Every action resolves the grant in the
// database (unexpired, unrevoked, bound session still active and in this event) and writes with
// the grant's server-derived identity. Callers may not send identity or session fields at all.
import { sha256Hex } from "../_shared/accessToken.ts";
import { corsFor, GateDeps, GRANT_RE, jsonResponse, mapDbError, readJson, UUID_RE } from "../_shared/gateHttp.ts";

const IDENTITY_FIELDS = ["participant_id", "participant_key", "session_id", "added_by", "submitted_by", "user_id", "presenter_id"];

type Built = { fn: string; args: Record<string, unknown> } | { error: string };

function build(action: unknown, body: Record<string, unknown>, grantHash: string): Built {
  switch (action) {
    case "poll_response":
      if (typeof body.poll_id !== "string" || !UUID_RE.test(body.poll_id)) return { error: "malformed" };
      if (!body.value || typeof body.value !== "object" || Array.isArray(body.value)) return { error: "invalid_value" };
      return { fn: "gate_submit_poll_response", args: { p_grant_hash: grantHash, p_poll_id: body.poll_id, p_value: body.value } };
    case "my_responses":
      if (typeof body.poll_id !== "string" || !UUID_RE.test(body.poll_id)) return { error: "malformed" };
      return { fn: "gate_my_responses", args: { p_grant_hash: grantHash, p_poll_id: body.poll_id } };
    case "story_volunteer":
      if (typeof body.name !== "string" || body.name.length > 200) return { error: "invalid_name" };
      if (body.mode !== "slot" && body.mode !== "lottery") return { error: "malformed" };
      return { fn: "gate_story_volunteer", args: { p_grant_hash: grantHash, p_name: body.name, p_mode: body.mode } };
    case "story_word":
      if (typeof body.word !== "string" || body.word.length > 200) return { error: "invalid_word" };
      return { fn: "gate_story_word", args: { p_grant_hash: grantHash, p_word: body.word } };
    default:
      return { error: "unknown_action" };
  }
}

export async function handleSubmit(req: Request, deps: GateDeps): Promise<Response> {
  const cors = corsFor(req, deps.allowedOrigins);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return jsonResponse(cors, { error: "method" }, 405);
  const origin = req.headers.get("Origin");
  if (!origin || !deps.allowedOrigins.includes(origin)) return jsonResponse(cors, { error: "origin" }, 403);

  const grant = req.headers.get("x-pnw2-grant");
  if (!grant || !GRANT_RE.test(grant)) return jsonResponse(cors, { error: "access_required" }, 401);

  const body = await readJson(req);
  if (!body) return jsonResponse(cors, { error: "malformed" }, 400);
  for (const f of IDENTITY_FIELDS) {
    if (f in body) return jsonResponse(cors, { error: "identity_not_allowed" }, 400);
  }

  const built = build(body.action, body, await sha256Hex(grant));
  if ("error" in built) return jsonResponse(cors, { error: built.error }, 400);

  const { data, error } = await deps.admin.rpc(built.fn, built.args);
  if (error) {
    const m = mapDbError(error.message);
    return jsonResponse(cors, { error: m.code }, m.status);
  }
  return jsonResponse(cors, { ok: true, data });
}
