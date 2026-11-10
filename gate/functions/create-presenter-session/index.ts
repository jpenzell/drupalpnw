// STAGED — not deployed. Under enforcement this is the only way to create a session.
// Presenter authority = the existing PRESENTATION_PASSWORD secret + a verified login token.
// Records the pairing server-side in presenter_sessions, which interactiveGuard trusts.
import { createClient } from "npm:@supabase/supabase-js@2";
import { allowedOrigin } from "../_shared/interactiveGuard.ts";

const ORIGINS = (Deno.env.get("PNW2_ALLOWED_ORIGINS") ?? "https://drupalpnw.lovable.app").split(",");

function timingSafeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a), eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}

Deno.serve(async (req) => {
  const cors = allowedOrigin(req, ORIGINS);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

  const secret = Deno.env.get("PRESENTATION_PASSWORD");
  const auth = req.headers.get("Authorization");
  if (!secret || !auth?.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: claims } = await userClient.auth.getClaims(auth.slice(7));
  const userId = claims?.claims?.sub;
  if (!userId) return json({ error: "unauthorized" }, 401);

  let body: { password?: unknown };
  try { body = await req.json(); } catch { return json({ error: "malformed" }, 400); }
  if (typeof body.password !== "string" || body.password.length > 200 || !timingSafeEqual(body.password, secret)) {
    return json({ error: "unauthorized" }, 401);
  }

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 10; attempt++) {
    const bytes = crypto.getRandomValues(new Uint8Array(4));
    const code = [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
    const { data: s, error } = await admin.from("sessions")
      .insert({ code, current_slide: "P1", presenter_id: userId }).select().single();
    if (error) continue;
    await admin.from("presenter_sessions").insert({ session_id: s.id, presenter_user_id: userId });
    return json({ session: s });
  }
  return json({ error: "unavailable" }, 500);
});
