import { useEffect, useRef, useState } from "react";
import { Loader2, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


type Row = {
  word: string;
  humanAvg: string;
};

const ROWS: Row[] = [
  { word: "Slam dunk", humanAvg: "90%" },
  { word: "Always", humanAvg: "91%" },
  { word: "Never", humanAvg: "9%" },
  { word: "Serious possibility", humanAvg: "58%" },
  { word: "Rarely", humanAvg: "16%" },
];

type Provider = "openai" | "anthropic" | "perplexity" | "gemini";
type Results = Record<string, Record<Provider, string>>;

const EMPTY_RESULTS: Results = Object.fromEntries(
  ROWS.map((r) => [r.word, { openai: "", anthropic: "", perplexity: "", gemini: "" }]),
) as Results;

// History: phrase -> provider -> ordered list of every value returned across runs.
type History = Record<string, Record<Provider, string[]>>;

// ---------------------------------------------------------------------------
// Module-level cache so results survive slide unmount AND can be prefetched
// while the audience is still on the previous slide (A1-3c).
// ---------------------------------------------------------------------------
type CacheState = {
  results: Results;
  history: History;
  runCount: number;
  ranAt: string | null;
  isLive: boolean;
};

let cache: CacheState = {
  results: EMPTY_RESULTS,
  history: {},
  runCount: 0,
  ranAt: null,
  isLive: false,
};
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

async function runProbabilityWordsLive(): Promise<void> {
  if (inflight) return inflight;
  const { supabase } = await import("@/integrations/supabase/client");
  inflight = (async () => {
    const { data, error } = await supabase.functions.invoke("probability-words-live", {
      body: { phrases: ROWS.map((r) => r.word) },
    });
    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || "Unknown error");
    const fresh = data.results as Results;
    const nextHistory: History = { ...cache.history };
    for (const row of ROWS) {
      const existing = nextHistory[row.word] ?? {
        openai: [], anthropic: [], perplexity: [], gemini: [],
      };
      nextHistory[row.word] = {
        openai: [...existing.openai, fresh[row.word]?.openai ?? "—"],
        anthropic: [...existing.anthropic, fresh[row.word]?.anthropic ?? "—"],
        perplexity: [...existing.perplexity, fresh[row.word]?.perplexity ?? "—"],
        gemini: [...existing.gemini, fresh[row.word]?.gemini ?? "—"],
      };
    }
    cache = {
      results: fresh,
      history: nextHistory,
      runCount: cache.runCount + 1,
      ranAt: data.ranAt as string,
      isLive: true,
    };
    notify();
  })();
  try {
    await inflight;
  } finally {
    inflight = null;
  }
}

/** Fire-and-forget warmup callable from the prior slide. Safe to call repeatedly. */
export function prefetchProbabilityWordsLive() {
  if (cache.isLive || inflight) return;
  runProbabilityWordsLive().catch(() => {
    /* swallow — UI will surface the error when the user lands on the slide */
  });
}

export const ProbabilityWordsLiveScreen = () => {
  const [, force] = useState(0);
  const [loading, setLoading] = useState(!!inflight);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const rerender = () => force((n) => n + 1);
    listeners.add(rerender);
    return () => { listeners.delete(rerender); };
  }, []);

  const { results, history, runCount, ranAt, isLive } = cache;

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      await runProbabilityWordsLive();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const autoRanRef = useRef(false);
  useEffect(() => {
    if (autoRanRef.current) return;
    autoRanRef.current = true;
    if (!cache.isLive && !inflight) run();
    else if (inflight) {
      setLoading(true);
      inflight.then(() => setLoading(false)).catch((e) => {
        setError((e as Error).message);
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const hasRun = isLive;
  const tableHeadClass = "py-2 text-[clamp(1.2rem,1.85cqw,2.2rem)] leading-tight whitespace-nowrap";
  const tableCellClass = "py-3 px-2 text-[clamp(1.25rem,1.95cqw,2.35rem)] leading-tight whitespace-nowrap";

  // Build "90×1 · 95×4" distribution string from a history list, sorted by
  // count desc. Hidden when only one run has happened (nothing to compare).
  const distLabel = (vals: string[] | undefined): string | null => {
    if (!vals || vals.length < 2) return null;
    const counts = new Map<string, number>();
    vals.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
    if (counts.size < 2) return null; // model gave the same answer every time
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([v, c]) => `${v}×${c}`)
      .join(" · ");
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col animate-slide-in overflow-hidden px-6 py-4">
      <div className="text-center mb-4 shrink-0">
        <h1 className="font-display font-bold text-foreground text-[clamp(3.75rem,6.1cqw,7rem)] leading-none">
          Now ask them <span className="text-primary italic">live.</span>
        </h1>
        <p className="text-[clamp(1.2rem,1.9cqw,2.2rem)] leading-tight text-muted-foreground/70 mt-2">
          Same five phrases. Four models. Hit the button — run it again to watch the answers drift.
        </p>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="w-full max-w-[min(96rem,100%)] mx-auto flex flex-col min-h-0 min-w-0 px-2">
          <div className="bg-background/80 border-2 border-foreground/20 rounded-2xl overflow-hidden shadow-large shrink min-h-0 min-w-0">
            <Table className="table-fixed w-full">
              <TableHeader className="bg-primary/20">
                <TableRow>
                  <TableHead className={`text-foreground font-bold w-[22%] ${tableHeadClass}`}>Word</TableHead>
                  <TableHead className={`text-center text-primary font-bold w-[12%] ${tableHeadClass}`}>Human Avg</TableHead>
                  <TableHead className={`text-center text-secondary font-bold w-[16%] ${tableHeadClass}`}>
                    ChatGPT
                    <div className="text-[10px] font-normal text-muted-foreground/60 mt-0.5 truncate">gpt-5</div>
                  </TableHead>
                  <TableHead className={`text-center text-secondary font-bold w-[16%] ${tableHeadClass}`}>
                    Claude
                    <div className="text-[10px] font-normal text-muted-foreground/60 mt-0.5 truncate">claude-sonnet-4-5</div>
                  </TableHead>
                  <TableHead className={`text-center text-secondary font-bold w-[16%] ${tableHeadClass}`}>
                    Perplexity
                    <div className="text-[10px] font-normal text-muted-foreground/60 mt-0.5 truncate">sonar</div>
                  </TableHead>
                  <TableHead className={`text-center text-secondary font-bold w-[18%] ${tableHeadClass}`}>
                    Gemini
                    <div className="text-[10px] font-normal text-muted-foreground/60 mt-0.5 truncate">gemini-3-flash-preview</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROWS.map((row) => {
                  const r = results[row.word];
                  const h = history[row.word];
                  const cell = (v: string, provider: Provider) => {
                    const dist = distLabel(h?.[provider]);
                    return (
                      <TableCell className={`text-center text-secondary ${tableCellClass} align-middle`}>
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin inline opacity-60" />
                        ) : (
                          <div className="flex flex-col items-center leading-tight">
                            <span>{v}</span>
                            {dist && (
                              <span className="text-[11px] font-normal text-accent/80 mt-0.5">
                                {dist}
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                    );
                  };
                  return (
                    <TableRow key={row.word}>
                      <TableCell className={`font-semibold text-foreground ${tableCellClass}`}>{row.word}</TableCell>
                      <TableCell className={`text-center text-primary font-bold ${tableCellClass}`}>{row.humanAvg}</TableCell>
                      {cell(r.openai, "openai")}
                      {cell(r.anthropic, "anthropic")}
                      {cell(r.perplexity, "perplexity")}
                      {cell(r.gemini, "gemini")}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col items-center gap-2 mt-3 shrink-0">
            <Button
              size="lg"
              onClick={run}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-[clamp(1.25rem,2cqw,2.25rem)] leading-none font-bold px-8 py-5 rounded-full shadow-large"
            >
              {loading ? (
                <>
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  Asking four models…
                </>
              ) : hasRun ? (
                <>
                  <RefreshCw className="h-6 w-6 mr-3" />
                  Run it again
                </>
              ) : (
                <>
                  <Play className="h-6 w-6 mr-3" />
                  Ask the AIs live
                </>
              )}
            </Button>

            {error && (
              <p className="text-[clamp(1rem,1.5cqw,1.75rem)] text-destructive">Error: {error}</p>
            )}
            {!error && (isLive ? (
              <p className="text-[clamp(1rem,1.5cqw,1.75rem)] leading-tight text-muted-foreground/60">
                Live · {new Date(ranAt!).toLocaleTimeString()} · {runCount} run{runCount === 1 ? "" : "s"}
                {runCount > 1 ? " · small text shows every value each model has given" : " · run again to see how each model drifts"}
              </p>
            ) : (
              <p className="text-[clamp(1rem,1.5cqw,1.75rem)] leading-tight text-muted-foreground/50 italic">
                Cells are blank — hit the button to make a fresh live call to all four models
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
