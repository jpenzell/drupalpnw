// STAGED — Stage 4 replacement for supabase/functions/send-connect-notification/index.ts.
// MainSite is the canonical lead capture; PNW2 sends no automatic email once the gate is active.
// Always answers 410 and never touches email, the database or any provider.
const cors = {
  "Access-Control-Allow-Origin": (Deno.env.get("PNW2_ALLOWED_ORIGINS") ?? "https://drupalpnw.lovable.app").split(",")[0].trim(),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  return new Response(JSON.stringify({ error: "retired", capture: "https://www.joshpenzell.com/p/ai-for-all-minds-pnw-drupal-summit-2026-10-17" }), {
    status: 410,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
