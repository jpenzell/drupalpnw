const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { text } = await req.json();
    if (typeof text !== "string" || !text.trim() || text.length > 600) return json({ translation: "" });
    const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Lovable-API-Key": Deno.env.get("LOVABLE_API_KEY") ?? "",
        "X-Lovable-AIG-SDK": "fetch",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions:
          "Translate live keynote captions from English into natural Québécois French (français québécois). Output only the translation, no quotes or notes. Keep it short and spoken.",
        input: text,
      }),
    });
    if (!r.ok || !r.body) return json({ error: `gateway ${r.status}` }, r.status === 429 || r.status === 402 ? r.status : 500);

    // Consume the SSE stream and collect the output text.
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = "", out = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const d = line.slice(5).trim();
        if (!d || d === "[DONE]") continue;
        try {
          const ev = JSON.parse(d);
          if (ev.type === "response.output_text.delta") out += ev.delta ?? "";
        } catch { /* partial */ }
      }
    }
    return json({ translation: out.trim() });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
