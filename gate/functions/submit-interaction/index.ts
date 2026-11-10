// STAGED — not deployed. The only attendee write path once enforced.
// participant_id is taken from the grant, never from the request body.
import { createClient } from "npm:@supabase/supabase-js@2";
import { allowedOrigin, requireInteractiveAccess } from "../_shared/interactiveGuard.ts";

const ORIGINS = (Deno.env.get("PNW2_ALLOWED_ORIGINS") ?? "https://drupalpnw.lovable.app").split(",");

Deno.serve(async (req) => {
  const cors = allowedOrigin(req, ORIGINS);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
  if (!ORIGINS.includes(req.headers.get("Origin") ?? "")) return json({ error: "origin" }, 403);

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!);
  const access = await requireInteractiveAccess(req, admin, userClient);
  if (!access || access.kind !== "attendee") return json({ error: "access_required" }, 401);

  let body: { action?: unknown; poll_id?: unknown; value?: unknown };
  try { body = await req.json(); } catch { return json({ error: "malformed" }, 400); }
  if (body.action !== "poll_response" || typeof body.poll_id !== "string") return json({ error: "malformed" }, 400);
  const raw = JSON.stringify(body.value ?? null);
  if (raw.length > 2000) return json({ error: "too_large" }, 413);

  const { data: poll } = await admin
    .from("polls").select("id, session_id, is_open, sessions!inner(is_active)")
    .eq("id", body.poll_id).eq("sessions.is_active", true).maybeSingle();
  if (!poll || poll.is_open === false) return json({ error: "poll_closed" }, 409);
  if (access.sessionId && access.sessionId !== poll.session_id) return json({ error: "wrong_session" }, 403);

  const { error } = await admin.from("responses").upsert(
    { poll_id: poll.id, participant_id: access.participantKey, value: body.value ?? null },
    { onConflict: "poll_id,participant_id" },
  );
  if (error) return json({ error: "unavailable" }, 500);
  return json({ ok: true });
});
