import { useState, useEffect } from "react";
import { Loader2, Play, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Persona = { id: string; flag: string; shortLabel: string; label: string };

const PERSONAS: Persona[] = [
  { id: "us", flag: "🇺🇸", shortLabel: "American", label: "native American English speaker from the United States" },
  { id: "cn", flag: "🇨🇳", shortLabel: "Chinese", label: "native Mandarin Chinese speaker from mainland China" },
  { id: "mx", flag: "🇲🇽", shortLabel: "Mexican", label: "native Spanish speaker from Mexico" },
  { id: "de", flag: "🇩🇪", shortLabel: "German", label: "native German speaker from Germany" },
  { id: "jp", flag: "🇯🇵", shortLabel: "Japanese", label: "native Japanese speaker from Japan" },
];

const PHRASES: { text: string; highlight?: boolean }[] = [
  { text: "Slam dunk" },
  { text: "Always" },
  { text: "Never" },
  { text: "Serious possibility", highlight: true },
  { text: "Rarely", highlight: true },
];

type Results = Record<string, Record<string, string>>; // phrase -> personaId -> "75%"

type ModelChoice =
  | "gemini-3-flash"
  | "gemini-2.5-pro"
  | "gpt-5"
  | "gpt-5-mini"
  | "claude-sonnet-4-5";

const MODEL_OPTIONS: { id: ModelChoice; label: string; sub: string }[] = [
  { id: "gemini-3-flash", label: "Gemini", sub: "gemini-3-flash-preview" },
  { id: "gemini-2.5-pro", label: "Gemini Pro", sub: "gemini-2.5-pro" },
  { id: "gpt-5", label: "ChatGPT", sub: "gpt-5" },
  { id: "gpt-5-mini", label: "ChatGPT mini", sub: "gpt-5-mini" },
  { id: "claude-sonnet-4-5", label: "Claude", sub: "claude-sonnet-4-5" },
];

export const ProbabilityWordsPersonaScreen = () => {
  const [results, setResults] = useState<Results>({});
  const [loading, setLoading] = useState(false);
  const [ranAt, setRanAt] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<ModelChoice>("gemini-3-flash");

  const modelMeta = MODEL_OPTIONS.find((m) => m.id === model)!;

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("probability-words-persona", {
        body: {
          phrases: PHRASES.map((p) => p.text),
          personas: PERSONAS.map((p) => ({ id: p.id, label: p.label })),
          model,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Unknown error");
      setResults(data.results as Results);
      setRanAt(data.ranAt as string);
      setIsLive(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const hasRun = isLive;


  return (
    <div className="flex-1 flex flex-col animate-slide-in min-h-0 overflow-hidden px-6 py-4">
      <div className="text-center mb-3 flex-shrink-0">
        <h1 className="font-display font-bold text-foreground text-[clamp(1.75rem,3cqw,3.25rem)] leading-tight">
          Same words, <span className="text-primary italic">different speaker.</span>
        </h1>
        <p className="slide-caption text-muted-foreground/70 mt-1 text-[clamp(0.85rem,1.1cqw,1.15rem)]">
          One model (<span className="text-secondary font-semibold">{modelMeta.label}</span>). Same English phrase. We only change
          who we tell it that it <em>is</em>.
        </p>

      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="max-w-6xl mx-auto w-full flex flex-col min-h-0 min-w-0 px-2">
          <div className="bg-background/80 border-2 border-foreground/20 rounded-2xl shadow-large min-w-0 overflow-hidden">
            <div className="grid grid-cols-[minmax(11rem,1.35fr)_repeat(5,minmax(0,1fr))] bg-primary/20">
              <div className="flex items-end px-5 py-4 text-left text-foreground font-bold text-[clamp(1.55rem,2.6cqw,2.7rem)] leading-none">
                Phrase
              </div>
              {PERSONAS.map((p) => (
                <div
                  key={p.id}
                  className="flex min-w-0 flex-col items-center justify-end gap-1 px-2 py-3 text-center text-secondary font-bold leading-none"
                >
                  <span className="text-[clamp(1.35rem,1.8cqw,2rem)] leading-none">{p.flag}</span>
                  <span className="w-full truncate text-[clamp(0.95rem,1.35cqw,1.6rem)] leading-none">
                    {p.shortLabel}
                  </span>
                </div>
              ))}
            </div>
            {PHRASES.map((row) => {
              const r = results[row.text];
              // Simple rule: highlight the row if not every persona gave
              // the exact same answer. Need at least 2 answers to compare.
              const values = PERSONAS.map((p) => r?.[p.id]).filter(
                (v): v is string => !!v && v !== "—",
              );
              const hasDisagreement = values.length >= 2 && new Set(values).size > 1;
              return (
                <div
                  key={row.text}
                  className={`grid grid-cols-[minmax(11rem,1.35fr)_repeat(5,minmax(0,1fr))] border-t border-foreground/10 ${
                    hasDisagreement ? "bg-accent/20" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center px-5 py-3 text-foreground font-semibold text-[clamp(1.45rem,2.45cqw,2.6rem)] leading-tight">
                    <span className="break-words">{row.text}</span>
                  </div>
                  {PERSONAS.map((p) => {
                    const value = r?.[p.id] ?? "—";
                    return (
                      <div
                        key={p.id}
                        className="flex min-w-0 items-center justify-center px-2 py-3 text-center text-secondary font-medium text-[clamp(1.45rem,2.35cqw,2.65rem)] leading-none"
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin opacity-60" />
                        ) : (
                          <span className="tabular-nums whitespace-nowrap">{value}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-3 mt-6">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="slide-caption text-muted-foreground/70 mr-1">Model:</span>
              {MODEL_OPTIONS.map((opt) => {
                const active = opt.id === model;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setModel(opt.id)}
                    disabled={loading}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background/60 text-foreground/80 border-foreground/20 hover:border-primary/60"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="ml-1.5 opacity-60 text-xs font-normal">{opt.sub}</span>
                  </button>
                );
              })}
            </div>

            <Button
              size="lg"
              onClick={run}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground slide-body font-bold px-10 py-7 rounded-full shadow-large"
            >
              {loading ? (
                <>
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  Asking {modelMeta.label} as each persona…
                </>
              ) : hasRun ? (
                <>
                  <RefreshCw className="h-6 w-6 mr-3" />
                  Run again
                </>
              ) : (
                <>
                  <Play className="h-6 w-6 mr-3" />
                  Ask {modelMeta.label} — one model, five personas
                </>
              )}
            </Button>

            {error && <p className="slide-caption text-destructive">Error: {error}</p>}
            {!error && isLive && (
              <p className="slide-caption text-muted-foreground/60">
                Live · {new Date(ranAt!).toLocaleTimeString()} · {modelMeta.label} ({modelMeta.sub}) · identical English prompt, only the persona changes
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
