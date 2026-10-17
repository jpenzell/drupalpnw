import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM = `You are an actor on stage. Respond directly to the prompt with concrete, specific output. No preamble, no caveats, no headers. Maximum 4 sentences.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = Deno.env.get("ANTHROPIC_API_KEY");
    if (key) {
      try {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 400,
            system: SYSTEM,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        if (r.ok) {
          const j = await r.json();
          const text = j.content?.[0]?.text ?? "";
          return new Response(JSON.stringify({ provider: "anthropic", answer: text }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        console.error("Anthropic error", r.status, await r.text());
      } catch (e) {
        console.error("Anthropic call failed", e);
      }
    }

    // Fallback to Lovable AI Gateway (Gemini) if Anthropic unavailable
    const lovKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovKey) throw new Error("No AI key configured");
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!r.ok) {
      if (r.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (r.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error ${r.status}`);
    }
    const j = await r.json();
    const text = j.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ provider: "gemini", answer: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("live-ai-demo error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
