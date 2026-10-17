import { useState, useEffect, useCallback } from "react";
import { TrendingDown, Shuffle, ArrowRight, Sparkles } from "lucide-react";

export const AIParadigmShiftScreen = () => {
  const [stage, setStage] = useState(1);
  const maxStage = 2;

  const handleAdvance = useCallback((e: KeyboardEvent) => {
    if (e.key === " " || e.key === "ArrowRight") {
      if (stage < maxStage) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setStage((s) => s + 1);
      }
    } else if (e.key === "ArrowLeft") {
      if (stage > 1) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setStage((s) => s - 1);
      }
    }
  }, [stage, maxStage]);

  useEffect(() => {
    window.addEventListener("keydown", handleAdvance, { capture: true });
    return () => window.removeEventListener("keydown", handleAdvance, { capture: true } as any);
  }, [handleAdvance]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 overflow-hidden">
      <div className="max-w-6xl w-full">
        
        {/* Stage 1: Why efficiency is the wrong goal */}
        {stage === 1 && (
          <div className="text-center space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Why <span className="text-destructive">"efficiency"</span> is the wrong goal
            </h1>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Old Automation */}
              <div className="bg-muted/20 border-2 border-muted rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingDown className="h-8 w-8 text-muted-foreground" />
                  <h3 className="text-xl font-bold text-muted-foreground">Old Automation</h3>
                </div>
                
                {/* Swimlane visualization */}
                <div className="bg-background/60 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <div className="w-12 h-8 bg-muted/40 rounded flex items-center justify-center text-xs text-muted-foreground">Step</div>
                    <ArrowRight className="h-4 w-4 text-destructive" />
                    <div className="w-12 h-8 bg-muted/40 rounded flex items-center justify-center text-xs line-through text-muted-foreground/50">Cut</div>
                    <ArrowRight className="h-4 w-4 text-destructive" />
                    <div className="w-12 h-8 bg-muted/40 rounded flex items-center justify-center text-xs text-muted-foreground">Step</div>
                    <ArrowRight className="h-4 w-4 text-destructive" />
                    <div className="w-12 h-8 bg-muted/40 rounded flex items-center justify-center text-xs line-through text-muted-foreground/50">Cut</div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="w-12 h-8 bg-muted/40 rounded flex items-center justify-center text-xs text-muted-foreground">Done</div>
                  </div>
                </div>
                
                <div className="space-y-1 text-left">
                  <p className="text-base text-foreground">✂️ Reduce touchpoints</p>
                  <p className="text-base text-foreground">📉 Minimize churn</p>
                  <p className="text-base text-foreground">⏱️ Speed to completion</p>
                </div>
              </div>

              {/* GenAI */}
              <div className="bg-primary/10 border-3 border-primary/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shuffle className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold text-primary">Generative AI</h3>
                </div>
                
                {/* Value expansion visualization */}
                <div className="bg-background/60 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between gap-1 text-sm">
                    <div className="w-10 h-8 bg-primary/20 rounded flex items-center justify-center text-xs text-primary">Ask</div>
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <div className="w-10 h-8 bg-primary/30 rounded flex items-center justify-center text-xs text-primary font-semibold">+</div>
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <div className="w-10 h-8 bg-primary/30 rounded flex items-center justify-center text-xs text-primary font-semibold">+</div>
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <div className="w-10 h-8 bg-primary/30 rounded flex items-center justify-center text-xs text-primary font-semibold">+</div>
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <div className="w-12 h-8 bg-accent/30 rounded flex items-center justify-center text-xs text-accent font-bold">Value</div>
                  </div>
                </div>
                
                <div className="space-y-1 text-left">
                  <p className="text-base text-foreground">🔄 <strong className="text-primary">Add</strong> touchpoints</p>
                  <p className="text-base text-foreground">💡 Explore possibilities</p>
                  <p className="text-base text-foreground">🎯 Depth of insight</p>
                </div>
              </div>
            </div>
            
            <p className="text-xl text-foreground max-w-3xl mx-auto">
              Old tech optimized for <span className="text-destructive font-semibold">less</span>. 
              AI creates value through <span className="text-primary font-semibold">more</span>.
            </p>
          </div>
        )}

        {/* Stage 2: A different way to think */}
        {stage === 2 && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="flex flex-col items-center gap-3 mb-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/30 rounded-full">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span className="text-accent font-semibold tracking-wide text-xs uppercase">
                  Artistic Intelligence
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                A different way to think
              </h1>
            </div>
            
            <div className="bg-accent/10 border-4 border-accent rounded-2xl p-8 max-w-4xl mx-auto">
              <p className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
                Don't use AI to do work <span className="text-destructive">faster</span>.
              </p>
              <p className="text-2xl md:text-3xl font-bold text-accent mt-3 leading-relaxed">
                Use AI to think <span className="underline">differently</span>.
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-lg text-muted-foreground">
              <span>Not outsourcing</span>
              <ArrowRight className="h-6 w-6" />
              <span className="text-primary font-semibold">Partnering</span>
            </div>

            {/* Rehearsal concept */}
            <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-2xl px-6 py-4 max-w-3xl mx-auto">
              <p className="text-lg text-foreground/90">
                Every AI interaction is a <span className="text-accent font-semibold">rehearsal</span>—exploring possibilities before the performance.
              </p>
            </div>
            
            <p className="text-xl text-foreground max-w-3xl mx-auto">
              Now let's talk about <span className="text-primary font-bold">how</span>.
            </p>
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex justify-center gap-3 mt-10">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                s === stage ? "bg-primary scale-125" : s < stage ? "bg-primary/50" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
