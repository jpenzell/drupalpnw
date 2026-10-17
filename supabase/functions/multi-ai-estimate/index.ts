import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Provider = "openai" | "anthropic" | "perplexity" | "gemini" | "gemini-pro";

const UPSTREAM_TIMEOUT_MS = 25_000;

async function fetchWithTimeout(url: string, init: RequestInit, ms = UPSTREAM_TIMEOUT_MS) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctl.signal });
  } catch (e) {
    if ((e as Error).name === "AbortError") {
      throw new Error(`upstream timeout after ${ms}ms`);
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

const SYSTEM_PROMPT =
  "You are answering an estimation question for a live audience. State 1-2 quick assumptions, then give ONE specific final number. Be confident. Maximum 3 sentences. End with a clear numeric answer in the form '~<number> <unit>' (e.g. '~1,500 elephants') so it's easy to extract.";

async function callOpenAI(prompt: string): Promise<string> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY missing");
  const r = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
    }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(prompt: string): Promise<string> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY missing");
  const r = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.content?.[0]?.text ?? "";
}

async function callPerplexity(prompt: string): Promise<string> {
  const key = Deno.env.get("PERPLEXITY_API_KEY");
  if (!key) throw new Error("PERPLEXITY_API_KEY missing");
  const r = await fetchWithTimeout("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });
  if (!r.ok) throw new Error(`Perplexity ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}

async function callLovable(prompt: string, model: string): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const r = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!r.ok) throw new Error(`Lovable ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, provider } = await req.json() as { prompt: string; provider: Provider };
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ success: false, error: "prompt required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let answer = "";
    switch (provider) {
      case "openai":
        answer = await callOpenAI(prompt);
        break;
      case "anthropic":
        answer = await callAnthropic(prompt);
        break;
      case "perplexity":
        answer = await callPerplexity(prompt);
        break;
      case "gemini-pro":
        answer = await callLovable(prompt, "google/gemini-2.5-pro");
        break;
      case "gemini":
      default:
        answer = await callLovable(prompt, "google/gemini-2.5-flash");
        break;
    }

    return new Response(JSON.stringify({ success: true, provider, answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("multi-ai-estimate error:", err);
    // Return 200 with fallback signal so the client doesn't crash;
    // upstream provider outages (e.g. Perplexity 502) shouldn't blank the UI.
    return new Response(
      JSON.stringify({ success: false, fallback: true, error: (err as Error).message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});