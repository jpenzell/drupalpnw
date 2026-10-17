import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RotateCcw, Bot, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const QUESTION = "How many ELEPHANTS could fit inside U.S. Bank Stadium?";

type LiveProvider = { label: string; model: string };

const LIVE_PROVIDERS: LiveProvider[] = [
  { label: "Gemini 2.5 Flash", model: "google/gemini-2.5-flash" },
  { label: "Gemini 2.5 Pro", model: "google/gemini-2.5-pro" },
  { label: "GPT-5 Mini", model: "openai/gpt-5-mini" },
  { label: "GPT-5 Nano", model: "openai/gpt-5-nano" },
];

interface AnswerEntry {
  id: string;
  source: string;
  number: number;
  isAudience: boolean;
}

/**
 * Extract the conclusion number from a free-form AI estimate. AI walks through
 * dimensions ("1.2M cubic feet / 350 per elephant ≈ 3,400 elephants"); we want
 * the final count, not the cubic-feet figure.
 */
function extractNumber(text: string): number | null {
  if (!text) return null;
  const numRe = /(\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?\s*(million|thousand|billion|m\b|k\b)?\s*([a-z\s-]{0,25})?/gi;
  const dimensionUnits = /(sq\.?\s*(ft|feet|m|meter|metre|yard)|square|cubic|acres?|feet|ft\b|meter|metre|yards?|miles?|seats?|capacity|attendees?|people|years?|mph|km|kilometer)/i;
  const elephantHint = /\b(elephants?)\b/i;

  type Cand = { value: number; index: number; score: number };
  const candidates: Cand[] = [];
  let m: RegExpExecArray | null;
  while ((m = numRe.exec(text)) !== null) {
    let value = parseFloat(m[1].replace(/,/g, ""));
    if (!isFinite(value)) continue;
    const mult = (m[2] || "").toLowerCase();
    if (mult.startsWith("k")) value *= 1_000;
    else if (mult.startsWith("thousand")) value *= 1_000;
    else if (mult.startsWith("million")) value *= 1_000_000;
    else if (mult.startsWith("billion")) value *= 1_000_000_000;
    if (value < 10) continue;
    const tail = (m[3] || "").toLowerCase();
    if (dimensionUnits.test(tail)) continue;
    let score = 0;
    if (elephantHint.test(tail)) score += 100;
    score += (m.index / Math.max(text.length, 1)) * 20;
    if (value > 500_000) score -= 50;
    if (value > 5_000_000) score -= 200;
    candidates.push({ value, index: m.index, score });
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score || b.index - a.index);
  return candidates[0].value;
}

export const ElephantEstimateScreen = () => {
  const [entries, setEntries] = useState<AnswerEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [streamingLabel, setStreamingLabel] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const aiStartedRef = useRef(false);

  // Fan out to multiple models in parallel; append each as it returns.
  useEffect(() => {
    if (aiStartedRef.current) return;
    aiStartedRef.current = true;
    setIsLoadingAI(true);
    setStreamingLabel("Asking real AIs…");
    let pending = LIVE_PROVIDERS.length;
    let cancelled = false;

    LIVE_PROVIDERS.forEach(({ label, model }) => {
      supabase.functions
        .invoke("test-prompt", {
          body: {
            prompt: QUESTION,
            context:
              "You are an estimation expert estimating how many elephants could fit inside U.S. Bank Stadium in Minneapolis, Minnesota. State assumptions in 1-2 sentences, then give a specific number of elephants. End your answer with the number followed by the word 'elephants'. Keep it under 60 words.",
            model,
          },
        })
        .then(({ data, error }) => {
          if (cancelled || error || !data?.response) {
            if (error) console.warn(`[${label}]`, error);
            return;
          }
          const n = extractNumber(data.response);
          if (n) {
            setEntries((prev) => [
              ...prev,
              { id: `ai-${label}`, source: label, number: n, isAudience: false },
            ]);
          }
        })
        .catch((e) => console.warn(`[${label}] threw`, e))
        .finally(() => {
          pending -= 1;
          if (pending <= 0) {
            setIsLoadingAI(false);
            setStreamingLabel(null);
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const submit = () => {
    const num = parseInt(draft.replace(/[,\s]/g, ""), 10);
    if (!isFinite(num) || num <= 0) return;
    setEntries((prev) => [
      ...prev,
      { id: `aud-${Date.now()}`, source: "Audience", number: num, isAudience: true },
    ]);
    setDraft("");
    inputRef.current?.focus();
  };

  const reset = () => {
    setEntries([]);
    setDraft("");
    aiStartedRef.current = false;
    inputRef.current?.focus();
  };

  const sorted = useMemo(() => [...entries].sort((a, b) => a.number - b.number), [entries]);
  const minNum = sorted[0]?.number ?? 0;
  const maxNum = sorted[sorted.length - 1]?.number ?? 1;
  const range = Math.max(maxNum - minNum, 1);

  return (
    <div className="flex-1 flex flex-col h-full px-8 py-6 gap-6 animate-fade-in">
      {/* Header */}
      <header className="text-center">
        <p className="uppercase tracking-[0.3em] text-xs font-semibold text-accent mb-2">
          Live Estimate
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
          How many <span className="text-primary italic">elephants</span> fit in U.S. Bank Stadium?
        </h1>
      </header>

      {/* Presenter input */}
      <div className="flex items-center gap-3 max-w-3xl mx-auto w-full">
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^\d,]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === " " || e.key === "Enter") e.stopPropagation();
            // Forward arrow keys to the global slide-nav handler — the
            // input is auto-focused, which would otherwise swallow them.
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              inputRef.current?.blur();
              window.dispatchEvent(new KeyboardEvent("keydown", { key: e.key, bubbles: true }));
            }
          }}
          placeholder="Type a guess from the chat…"
          inputMode="numeric"
          aria-label="Audience guess"
          autoFocus
          className="flex-1 text-center font-bold h-16"
          style={{ fontSize: "1.75rem" }}
        />
        <Button onClick={submit} disabled={!draft.trim()} className="h-16 px-8 text-xl font-bold gap-2">
          <Users className="h-5 w-5" aria-hidden="true" />
          Add
        </Button>
        <Button
          onClick={reset}
          variant="outline"
          className="h-16 px-4"
          aria-label="Clear all answers"
          title="Clear"
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      {/* Number line */}
      {sorted.length > 0 && (
        <div className="w-full max-w-[1400px] mx-auto px-12 pt-2">
          <div className="relative h-16">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-border rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-border rounded-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-border rounded-full" />
            {sorted.map((item) => {
              const pct = ((item.number - minNum) / range) * 100;
              return (
                <div
                  key={`tick-${item.id}`}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 animate-fade-in"
                  style={{ left: `${pct}%` }}
                  title={`${item.source}: ${item.number.toLocaleString()}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 shadow-lg ${
                      item.isAudience
                        ? "bg-secondary border-secondary"
                        : "bg-primary border-primary"
                    }`}
                    aria-hidden="true"
                  />
                </div>
              );
            })}
            <div className="absolute -bottom-1 left-0 text-base font-bold text-muted-foreground">
              {minNum.toLocaleString()}
            </div>
            <div className="absolute -bottom-1 right-0 text-base font-bold text-muted-foreground">
              {maxNum.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Big numbers wall */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 gap-8" aria-live="polite">
        {sorted.length === 0 ? (
          <p className="text-3xl text-muted-foreground italic">
            {isLoadingAI ? "AI is thinking…" : "Waiting for the first number…"}
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 max-w-[1500px]">
            {sorted.map((item) => (
              <figure key={item.id} className="text-center">
                <span
                  className={`block font-display font-bold leading-none animate-fade-in ${
                    item.isAudience ? "text-secondary" : "text-primary"
                  }`}
                  style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}
                >
                  {item.number.toLocaleString()}
                </span>
                <figcaption className="text-sm uppercase tracking-wider text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  {item.isAudience ? (
                    <Users className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Bot className="h-3 w-3" aria-hidden="true" />
                  )}
                  {item.source}
                </figcaption>
              </figure>
            ))}
            {isLoadingAI && (
              <span className="text-xl text-muted-foreground italic flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
                {streamingLabel || "AI thinking…"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm text-muted-foreground" aria-hidden="true">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-secondary" /> Audience
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary" /> AI
        </span>
      </div>
    </div>
  );
};
