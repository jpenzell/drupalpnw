import { useState, useCallback, useEffect } from "react";
import { Target, Users, TrendingDown, Lightbulb, BarChart3 } from "lucide-react";

export const PassmoreStudyScreen = () => {
  const [stage, setStage] = useState(0);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowRight") {
        if (stage < 4) {
          e.preventDefault();
          e.stopImmediatePropagation();
          setStage((prev) => prev + 1);
        }
      } else if (e.key === "ArrowLeft" && stage > 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setStage((prev) => prev - 1);
      }
    },
    [stage]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey, { capture: true });
    return () => window.removeEventListener("keydown", handleKey, { capture: true } as any);
  }, [handleKey]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary/10 border border-primary/30 rounded-full">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-primary font-semibold text-sm tracking-widest uppercase">
              Passmore et al. · 2025 · JWAM
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Human Coaches vs. <span className="text-primary">AI Agents</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            First quasi-experimental study comparing AI coaching agents to human coaches in the workplace.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          {/* Finding 1 */}
          <div className={`transition-all duration-500 ${stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="bg-card border-2 border-green-500/30 rounded-2xl p-5 h-full text-center">
              <div className="w-12 h-12 rounded-2xl bg-green-500/15 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-2xl font-black text-green-500 mb-1">Higher</p>
              <p className="text-xs text-muted-foreground mb-2">Goal Attainment</p>
              <p className="text-foreground/80 text-sm">
                Human coaches produced significantly higher goal attainment scores.
              </p>
            </div>
          </div>

          {/* Finding 2 */}
          <div className={`transition-all duration-500 ${stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="bg-card border-2 border-secondary/30 rounded-2xl p-5 h-full text-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center mx-auto mb-3">
                <TrendingDown className="h-6 w-6 text-secondary" />
              </div>
              <p className="text-2xl font-black text-secondary mb-1">Gap</p>
              <p className="text-xs text-muted-foreground mb-2">Working Alliance</p>
              <p className="text-foreground/80 text-sm">
                Clients rated human coaches higher on bond and overall experience.
              </p>
            </div>
          </div>

          {/* Barger nuance */}
          <div className={`transition-all duration-500 ${stage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 h-full text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-black text-primary mb-1">But…</p>
              <p className="text-xs text-muted-foreground mb-2">Barger, 2025</p>
              <p className="text-foreground/80 text-sm">
                Wizard of Oz study: clients formed equivalent alliance with AI and human — "being human alone isn't enough."
              </p>
            </div>
          </div>

          {/* BetterUp preference */}
          <div className={`transition-all duration-500 ${stage >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 h-full text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-black text-primary mb-1">51%</p>
              <p className="text-xs text-muted-foreground mb-2">Want Both</p>
              <p className="text-foreground/80 text-sm">
                34% prefer human, 15% prefer AI, 51% want a combination.
              </p>
              <p className="text-xs text-muted-foreground mt-2">BetterUp Research, 2024</p>
            </div>
          </div>
        </div>

        {stage >= 4 && (
          <div className="text-center animate-fade-in">
            <div className="inline-block bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30 rounded-2xl px-8 py-5">
              <p className="text-xl font-bold text-foreground">
                The answer isn't AI <em>or</em> human coaching — it's AI <span className="text-primary">enhancing</span> human coaching.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-1.5 opacity-30">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`w-1.5 h-1.5 rounded-full transition-all ${s <= stage ? "bg-muted-foreground" : "bg-muted-foreground/30"}`} />
          ))}
        </div>
      </div>
    </div>
  );
};
