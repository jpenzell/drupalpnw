import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UPSTREAM_TIMEOUT_MS = 25_000;

type ModelChoice =
  | "gemini-3-flash"
  | "gemini-2.5-pro"
  | "gpt-5"
  | "gpt-5-mini"
  | "claude-sonnet-4-5";

function systemPrompt(personaLabel: string) {
  return (
    `You are a ${personaLabel}. Answer from that cultural and linguistic perspective. ` +
    `You will be given an English probability phrase. ` +
    `Respond with EXACTLY one integer percentage from 0 to 100 representing the chance that phrase implies to you. ` +
    `No words, no % sign, no punctuation — just the integer. Example output: 75`
  );
}

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

async function callAnthropic(sys: string, prompt: string): Promise<string> {
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
      system: sys,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}`);
  const j = await r.json();
  return j.content?.[0]?.text ?? "";
}

async function callLovableAI(model: string, sys: string, prompt: string): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const r = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!r.ok) throw new Error(`Lovable AI ${r.status}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}

async function callOpenAI(model: string, sys: string, prompt: string): Promise<string> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY missing");
  const r = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 50,
    }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}

async function callModel(model: ModelChoice, sys: string, prompt: string): Promise<string> {
  switch (model) {
    case "gemini-3-flash":
      return callLovableAI("google/gemini-3-flash-preview", sys, prompt);
    case "gemini-2.5-pro":
      return callLovableAI("google/gemini-2.5-pro", sys, prompt);
    case "gpt-5":
      return callOpenAI("gpt-5", sys, prompt);
    case "gpt-5-mini":
      return callOpenAI("gpt-5-mini", sys, prompt);
    case "claude-sonnet-4-5":
      return callAnthropic(sys, prompt);
  }
}

async function estimateOne(model: ModelChoice, sys: string, phrase: string): Promise<string> {
  try {
    const raw = await callModel(model, sys, phrase);
    return extractPct(raw);
  } catch (e) {
    console.error(`${model} failed for "${phrase}":`, (e as Error).message);
    return "—";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as {
      phrases: string[];
      personas: { id: string; label: string }[];
      model?: ModelChoice;
    };
    const { phrases, personas } = body;
    const model: ModelChoice = body.model ?? "gemini-3-flash";
    if (!Array.isArray(phrases) || phrases.length === 0 || !Array.isArray(personas) || personas.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "phrases[] and personas[] required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const jobs = phrases.flatMap((phrase) =>
      personas.map(async (p) => ({
        phrase,
        personaId: p.id,
        value: await estimateOne(model, systemPrompt(p.label), phrase),
      })),
    );
    const settled = await Promise.all(jobs);

    const results: Record<string, Record<string, string>> = {};
    for (const phrase of phrases) {
      results[phrase] = {};
      for (const p of personas) results[phrase][p.id] = "—";
    }
    for (const r of settled) {
      results[r.phrase][r.personaId] = r.value;
    }

    return new Response(
      JSON.stringify({ success: true, results, model, ranAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("probability-words-persona error:", err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
