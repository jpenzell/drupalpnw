import { useState, useEffect, useRef, useCallback } from "react";
import { Bot, Loader2, Sparkles, Send, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ModelResult {
  model: string;
  displayName: string;
  number: number | null;
  rawResponse: string;
  error?: string;
}

interface RunResult {
  results: ModelResult[];
  stats: {
    average: number | null;
    range: number | null;
    count: number;
  };
}

// Persist across navigation
let persistedRuns: RunResult[] = [];
let prefetchedResult: RunResult | null = null;
let isPrefetching = false;
let backgroundLoopRunning = false;
let backgroundLoopStopped = false;

export const getAIRandomNumbers = () => {
  return persistedRuns.flatMap(r => 
    r.results.filter(m => m.number !== null).map(m => m.number as number)
  );
};

// Background loop that keeps generating AI numbers even after leaving P13c
const runBackgroundLoop = async () => {
  if (backgroundLoopRunning) return;
  backgroundLoopRunning = true;
  
  while (!backgroundLoopStopped) {
    try {
      const { data, error } = await supabase.functions.invoke("random-number-demo");
      if (!error && data) {
        persistedRuns = [...persistedRuns, data as RunResult];
      }
    } catch (err) {
      console.error("Background AI loop error:", err);
    }
    await new Promise(r => setTimeout(r, 4000));
  }
};

export const startAIBackgroundLoop = () => {
  backgroundLoopStopped = false;
  runBackgroundLoop();
};

export const stopAIBackgroundLoop = () => {
  backgroundLoopStopped = true;
  backgroundLoopRunning = false;
};

export const prefetchAIRandomNumbers = async () => {
  if (isPrefetching || prefetchedResult) return;
  isPrefetching = true;
  
  try {
    const { data, error } = await supabase.functions.invoke("random-number-demo");
    if (!error && data) {
      prefetchedResult = data as RunResult;
    }
  } catch (err) {
    console.error("Prefetch error:", err);
  } finally {
    isPrefetching = false;
  }
};

// Auto-prefetch on module load
prefetchAIRandomNumbers();

export const resetAIRandomNumbers = () => {
  persistedRuns = [];
  prefetchedResult = null;
};

// Model card colors
const modelColors: Record<string, { bg: string; border: string; text: string }> = {
  "GPT-5": { bg: "bg-emerald-500/10", border: "border-emerald-500/40", text: "text-emerald-400" },
  "Gemini Pro": { bg: "bg-blue-500/10", border: "border-blue-500/40", text: "text-blue-400" },
  "Claude": { bg: "bg-orange-500/10", border: "border-orange-500/40", text: "text-orange-400" },
  "Perplexity": { bg: "bg-purple-500/10", border: "border-purple-500/40", text: "text-purple-400" },
};

export const AIRandomNumbersScreen = () => {
  const { isPresenter, isSoloMode } = useSession();
  const canControl = isPresenter || isSoloMode;
  
  const [runs, setRuns] = useState<RunResult[]>(persistedRuns);
  const [currentRun, setCurrentRun] = useState<RunResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(persistedRuns.length > 0 || !!prefetchedResult);
  const [runCount, setRunCount] = useState(persistedRuns.length);
  const [audienceNumbers, setAudienceNumbers] = useState<number[]>([]);
  const [audienceInput, setAudienceInput] = useState("");
  const audienceInputRef = useRef<HTMLInputElement>(null);
  const isRunningRef = useRef(false);
  const mountedRef = useRef(true);

  // Sync to persisted
  useEffect(() => {
    persistedRuns = runs;
  }, [runs]);

  const runDemo = useCallback(async () => {
    if (isRunningRef.current || !mountedRef.current) return;
    
    isRunningRef.current = true;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("random-number-demo");
      if (!error && mountedRef.current) {
        const result = data as RunResult;
        setCurrentRun(result);
        setRuns((prev) => [...prev, result]);
        setRunCount(prev => prev + 1);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      isRunningRef.current = false;
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  // Auto-start with prefetched result OR keep running indefinitely
  useEffect(() => {
    mountedRef.current = true;
    
    // If we have a prefetched result, use it immediately
    if (prefetchedResult && runs.length === 0) {
      setCurrentRun(prefetchedResult);
      setRuns([prefetchedResult]);
      persistedRuns = [prefetchedResult];
      setRunCount(1);
      prefetchedResult = null;
      if (!hasStarted) setHasStarted(true);
    }
    
    // Start the background loop AND a local sync loop
    if (hasStarted) {
      startAIBackgroundLoop();
      
      // Sync from persisted data to component state
      const syncInterval = setInterval(() => {
        if (!mountedRef.current) return;
        const latest = persistedRuns;
        if (latest.length > 0) {
          setCurrentRun(latest[latest.length - 1]);
          setRuns([...latest]);
          setRunCount(latest.length);
          setIsLoading(false);
        }
      }, 1500);
      
      return () => {
        mountedRef.current = false;
        clearInterval(syncInterval);
        // Don't stop the background loop — it keeps running!
      };
    }
    
    return () => { mountedRef.current = false; };
  }, [hasStarted, runs.length]);

  // Calculate aggregate stats from all runs
  const allNumbers = [
    ...runs.flatMap(r => 
      r.results.filter(m => m.number !== null).map(m => m.number as number)
    ),
    ...audienceNumbers,
  ];
  
  const freqMap: Record<number, number> = {};
  allNumbers.forEach(n => freqMap[n] = (freqMap[n] || 0) + 1);
  
  const sortedByFreq = Object.entries(freqMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const handleStart = () => setHasStarted(true);

  const addAudienceNumber = () => {
    const num = parseInt(audienceInput);
    if (isNaN(num) || num < 1 || num > 100) return;
    setAudienceNumbers(prev => [...prev, num]);
    setAudienceInput("");
    setTimeout(() => audienceInputRef.current?.focus(), 0);
  };

  // Keyboard handler for presenter
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!canControl) return;
      if ((e.key === " " || e.key === "ArrowRight") && !hasStarted) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setHasStarted(true);
      }
    };
    window.addEventListener("keydown", handleKey, { capture: true });
    return () => window.removeEventListener("keydown", handleKey, { capture: true } as any);
  }, [canControl, hasStarted]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-in px-4">
      <div className="max-w-5xl w-full space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              AI Models Pick "Random" Numbers
            </h1>
          </div>
          <p className="text-muted-foreground">
            Watching 4 leading AI models try to be random
          </p>
        </div>

        {/* Pre-start state */}
        {!hasStarted && canControl && (
          <div className="text-center space-y-4">
            <div className="bg-primary/10 border-2 border-primary/30 rounded-2xl p-8">
              <Bot className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-xl text-foreground mb-4">
                Ask 4 AI models to pick random numbers
              </p>
              <Button onClick={handleStart} size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Start Demo
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Space</kbd> to begin
            </p>
          </div>
        )}

        {!hasStarted && !canControl && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Waiting for presenter to start...</p>
          </div>
        )}

        {/* Models Grid - Current Run */}
        {hasStarted && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Run #{runCount}
              </span>
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Querying models...
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentRun?.results.map((result) => {
                const colors = modelColors[result.displayName] || { 
                  bg: "bg-muted/30", 
                  border: "border-border", 
                  text: "text-foreground" 
                };
                
                return (
                  <div
                    key={result.model}
                    className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4 text-center transition-all duration-300`}
                  >
                    <p className={`text-sm font-semibold ${colors.text} mb-2`}>
                      {result.displayName}
                    </p>
                    <p className={`text-5xl md:text-6xl font-black ${colors.text}`}>
                      {result.number ?? "—"}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Audience Copilot Numbers */}
            {canControl && (
              <div className="bg-secondary/10 border-2 border-secondary/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-secondary shrink-0" />
                  <span className="text-sm font-semibold text-secondary shrink-0">Audience (Copilot)</span>
                  <Input
                    ref={audienceInputRef}
                    value={audienceInput}
                    onChange={(e) => setAudienceInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addAudienceNumber()}
                    placeholder="1-100"
                    className="w-24 text-center text-sm h-8"
                    type="number"
                    min={1}
                    max={100}
                  />
                  <Button onClick={addAudienceNumber} size="sm" variant="outline" className="h-8 px-2" disabled={!audienceInput}>
                    <Send className="h-3 w-3" />
                  </Button>
                  {audienceNumbers.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {audienceNumbers.map((n, i) => (
                        <span key={i} className="text-sm font-bold bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">{n}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Current Stats */}
            {currentRun && (
              <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
                <div className="flex justify-center gap-8 text-sm">
                  <div className="text-center">
                    <span className="text-muted-foreground">Avg</span>
                    <p className="text-2xl font-bold text-primary">{currentRun.stats.average ?? "—"}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-muted-foreground">Range</span>
                    <p className="text-2xl font-bold text-primary">{currentRun.stats.range ?? "—"}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-muted-foreground">Total Picks</span>
                    <p className="text-2xl font-bold text-primary">{allNumbers.length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Most Common Numbers */}
            {allNumbers.length >= 8 && (
              <div className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-4 animate-fade-in">
                <p className="text-sm text-muted-foreground text-center mb-2">
                  Most common picks across all runs:
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                  {sortedByFreq.map(([num, freq]) => (
                    <div key={num} className="text-center">
                      <span className="text-2xl font-black text-destructive">{num}</span>
                      <span className="text-xs text-muted-foreground ml-1">×{freq}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-center mt-3 text-foreground">
                  <strong className="text-destructive">AI can't be random</strong> — it predicts what "feels" random
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
