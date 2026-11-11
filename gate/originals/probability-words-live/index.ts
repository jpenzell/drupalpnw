import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT =
  "You will be given a probability phrase used in everyday English (e.g. \"slam dunk\", \"serious possibility\"). " +
  "Respond with EXACTLY one integer percentage from 0 to 100 representing the chance that phrase implies. " +
  "No words, no % sign, no punctuation — just the integer. Example output: 75";

const UPSTREAM_TIMEOUT_MS = 20_000;

async function fetchWithTimeout(url: string, init: RequestInit, ms = UPSTREAM_TIMEOUT_MS) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctl.signal });
  } finally {
    clearTimeout(t);
  }
}

function extractPct(text: string): string {
  if (!text) return "—";
  const m = text.match(/\d{1,3}/);
  if (!m) return "—";
  const n = Math.max(0, Math.min(100, parseInt(m[0], 10)));
  return `${n}%`;
}

async function callOpenAI(prompt: string): Promise<string> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY missing");
  const r = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-5",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 2000,
    }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}`);
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
      model: "claude-sonnet-4-5",
      max_tokens: 20,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}`);
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
      max_tokens: 20,
    }),
  });
  if (!r.ok) throw new Error(`Perplexity ${r.status}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}

async function callGemini(prompt: string): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const r = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!r.ok) throw new Error(`Gemini ${r.status}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}

const PROVIDERS = {
  openai: callOpenAI,
  anthropic: callAnthropic,
  perplexity: callPerplexity,
  gemini: callGemini,
} as const;

type ProviderName = keyof typeof PROVIDERS;

async function estimateOne(provider: ProviderName, phrase: string): Promise<string> {
  try {
    const raw = await PROVIDERS[provider](phrase);
    return extractPct(raw);
  } catch (e) {
    console.error(`${provider} failed for "${phrase}":`, (e as Error).message);
    return "—";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { phrases } = (await req.json()) as { phrases: string[] };
    if (!Array.isArray(phrases) || phrases.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "phrases[] required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const providers: ProviderName[] = ["openai", "anthropic", "perplexity", "gemini"];

    // Run every (phrase, provider) combo in parallel
    const jobs = phrases.flatMap((phrase) =>
      providers.map(async (p) => ({ phrase, provider: p, value: await estimateOne(p, phrase) })),
    );
    const settled = await Promise.all(jobs);

    const results: Record<string, Record<ProviderName, string>> = {};
    for (const phrase of phrases) {
      results[phrase] = { openai: "—", anthropic: "—", perplexity: "—", gemini: "—" };
    }
    for (const r of settled) {
      results[r.phrase][r.provider] = r.value;
    }

    return new Response(
      JSON.stringify({ success: true, results, ranAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("probability-words-live error:", err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
