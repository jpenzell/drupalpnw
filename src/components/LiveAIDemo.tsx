import { useEffect, useState } from "react";
import { Loader2, Play, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface BasePanel {
  label: string;
  prompt: string;
  cached: string;
}

interface LiveAIDemoProps {
  variant: "split" | "single";
  panelA: BasePanel;
  panelB?: BasePanel;
  /** When true (default), run cached responses immediately and skip live calls. */
  defaultCached?: boolean;
}

interface PanelState {
  loading: boolean;
  text: string;
  isCached: boolean;
  error?: string;
}

const initial = (): PanelState => ({ loading: false, text: "", isCached: false });

export const LiveAIDemo = ({ variant, panelA, panelB, defaultCached = true }: LiveAIDemoProps) => {
  const [a, setA] = useState<PanelState>(initial);
  const [b, setB] = useState<PanelState>(initial);
  const [useCached, setUseCached] = useState(defaultCached);

  // 'C' key toggles cached vs live across the deck
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "c" || e.key === "C") setUseCached((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const runOne = async (
    panel: BasePanel,
    setter: (s: PanelState) => void
  ) => {
    if (useCached) {
      setter({ loading: false, text: panel.cached, isCached: true });
      return;
    }
    setter({ loading: true, text: "", isCached: false });
    try {
      const { data, error } = await supabase.functions.invoke("live-ai-demo", {
        body: { prompt: panel.prompt },
      });
      if (error || !data?.answer) {
        setter({ loading: false, text: panel.cached, isCached: true, error: "Falling back" });
        return;
      }
      setter({ loading: false, text: data.answer, isCached: false });
    } catch {
      setter({ loading: false, text: panel.cached, isCached: true, error: "Falling back" });
    }
  };

  const runAll = () => {
    runOne(panelA, setA);
    if (panelB) runOne(panelB, setB);
  };

  const reset = () => {
    setA(initial());
    setB(initial());
  };

  const Panel = ({ data, panel }: { data: PanelState; panel: BasePanel }) => (
    <div className="flex-1 flex flex-col gap-4 p-6 rounded-2xl bg-card border-2 border-border min-h-[280px]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm uppercase tracking-[0.2em] text-secondary font-bold">
          {panel.label}
        </span>
        {data.isCached && data.text && (
          <span className="text-xs font-mono text-muted-foreground">[cached]</span>
        )}
      </div>
      <div className="text-sm font-mono text-muted-foreground italic border-l-2 border-secondary/40 pl-3">
        {panel.prompt}
      </div>
      <div className="flex-1 flex items-center justify-center">
        {data.loading ? (
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        ) : data.text ? (
          <p className="text-xl md:text-2xl font-display text-foreground leading-snug">
            "{data.text}"
          </p>
        ) : (
          <p className="text-base text-muted-foreground/60 italic">awaiting direction…</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div
        className={`flex gap-6 ${
          variant === "split" ? "flex-col md:flex-row" : "flex-col"
        }`}
      >
        <Panel data={a} panel={panelA} />
        {variant === "split" && panelB && <Panel data={b} panel={panelB} />}
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button onClick={runAll} size="lg" className="gap-2">
          <Play className="h-4 w-4" />
          {useCached ? "Show response" : "Run live"}
        </Button>
        <Button onClick={reset} variant="outline" size="lg" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        <span className="text-xs font-mono text-muted-foreground ml-2">
          [C] toggle · current: {useCached ? "cached" : "live"}
        </span>
      </div>
    </div>
  );
};
