import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Star, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/** The role we're casting for — a real learning-design task, read cold. */
const ROLE_BRIEF =
  "Write the opening line of a scenario for a new warehouse associate who just watched a coworker skip a safety step. One sentence. No preamble.";

const ROLE_CONTEXT =
  "You are auditioning for a role on a learning design team. Deliver only the line itself — no explanation, no options, no quotation marks. Maximum 35 words.";

type Candidate = { label: string; model: string };

const CANDIDATES: Candidate[] = [
  { label: "Candidate A", model: "google/gemini-2.5-flash" },
  { label: "Candidate B", model: "openai/gpt-5-mini" },
  { label: "Candidate C", model: "google/gemini-2.5-pro" },
];

interface Reading {
  label: string;
  model: string;
  text: string | null;
  failed: boolean;
}

/**
 * The audition made real: the same role brief goes to three models at once,
 * the reveal is blind (Candidate A/B/C), and the presenter casts one.
 * This is the live counterpart to the Dynamic Role Assignment research slide.
 */
export const AuditionScreen = () => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(false);
  const [cast, setCast] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const startedRef = useRef(false);

  const run = useCallback(() => {
    setReadings([]);
    setCast(null);
    setRevealed(false);
    setLoading(true);
    let pending = CANDIDATES.length;

    CANDIDATES.forEach(({ label, model }) => {
      supabase.functions
        .invoke("test-prompt", {
          body: { prompt: ROLE_BRIEF, context: ROLE_CONTEXT, model },
        })
        .then(({ data, error }) => {
          setReadings((prev) => [
            ...prev,
            {
              label,
              model,
              text: error ? null : (data?.response ?? "").trim() || null,
              failed: Boolean(error) || !data?.response,
            },
          ]);
        })
        .catch(() => {
          setReadings((prev) => [...prev, { label, model, text: null, failed: true }]);
        })
        .finally(() => {
          pending -= 1;
          if (pending <= 0) setLoading(false);
        });
    });
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    run();
  }, [run]);

  const ordered = CANDIDATES.map((c) => readings.find((r) => r.label === c.label)).filter(
    Boolean,
  ) as Reading[];

  return (
    <div className="flex-1 flex flex-col h-full px-8 py-6 gap-5 animate-fade-in">
      <header className="text-center space-y-2">
        <p className="uppercase tracking-[0.3em] text-xs font-semibold text-secondary">
          The Audition
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
          Same role. Same brief. <span className="text-primary italic">Three readings.</span>
        </h1>
        <p className="slide-caption text-muted-foreground max-w-4xl mx-auto">“{ROLE_BRIEF}”</p>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0" aria-live="polite">
        {CANDIDATES.map((c) => {
          const r = ordered.find((x) => x.label === c.label);
          const isCast = cast === c.label;
          return (
            <div
              key={c.label}
              className={`rounded-2xl border-2 p-6 flex flex-col gap-4 transition-all ${
                isCast
                  ? "border-primary bg-primary/10 shadow-lg"
                  : cast
                    ? "border-border bg-card opacity-50"
                    : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display font-bold text-foreground flex items-center gap-2">
                  <Bot className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  {c.label}
                </span>
                {revealed && (
                  <span className="text-xs font-mono text-muted-foreground">{c.model}</span>
                )}
              </div>

              <div className="flex-1 flex items-center">
                {!r ? (
                  <span className="flex items-center gap-2 text-muted-foreground italic">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Reading…
                  </span>
                ) : r.failed ? (
                  <span className="text-muted-foreground italic">No reading — skip this one.</span>
                ) : (
                  <p className="slide-body text-foreground/90 leading-snug">{r.text}</p>
                )}
              </div>

              <Button
                variant={isCast ? "default" : "outline"}
                disabled={!r || r.failed}
                onClick={() => setCast(isCast ? null : c.label)}
                className="gap-2"
              >
                <Star className="h-4 w-4" aria-hidden="true" />
                {isCast ? "Cast" : "Cast this one"}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" onClick={run} disabled={loading} className="gap-2">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          New audition
        </Button>
        <Button variant="outline" onClick={() => setRevealed((v) => !v)}>
          {revealed ? "Hide the names" : "Reveal who was who"}
        </Button>
      </div>
    </div>
  );
};
