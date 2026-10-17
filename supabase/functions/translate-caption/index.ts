const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { text } = await req.json();
    if (typeof text !== "string" || !text.trim() || text.length > 600) {
      return new Response(JSON.stringify({ translation: "" }), { headers: { ...cors, "Content-Type": "application/json" } });
    }
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Translate live keynote captions from English into natural Québécois French (français québécois). Output only the translation, no quotes or notes. Keep it short and spoken." },
          { role: "user", content: text },
        ],
      }),
    });
    if (!r.ok) {
      return new Response(JSON.stringify({ error: `gateway ${r.status}` }), { status: r.status === 429 || r.status === 402 ? r.status : 500, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const j = await r.json();
    const translation = j.choices?.[0]?.message?.content?.trim() ?? "";
    return new Response(JSON.stringify({ translation }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
