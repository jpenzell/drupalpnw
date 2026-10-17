import { useState, useEffect, useCallback } from "react";
import { Heart, Shield, Briefcase, GraduationCap, Sparkles } from "lucide-react";

const predictors = [
  {
    id: "trust",
    label: "Trust",
    icon: Shield,
  },
  {
    id: "experience",
    label: "Tenure",
    icon: Briefcase,
  },
  {
    id: "training",
    label: "Training",
    icon: GraduationCap,
  },
  {
    id: "sentiment",
    label: "Feelings",
    icon: Heart,
    isWinner: true,
  },
];

export const AdoptionPredictorQuizScreen = () => {
  // Stages:
  // 1 — question + four candidates visible
  // 2 — winner highlighted + research callout
  const [stage, setStage] = useState(1);
  const maxStage = 2;

  const handleAdvance = useCallback(
    (e: KeyboardEvent) => {
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
    },
    [stage, maxStage]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleAdvance, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleAdvance, { capture: true } as any);
  }, [handleAdvance]);

  return (
    <div className="flex-1 flex flex-col animate-slide-in">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="slide-title font-bold text-foreground">
            What predicts daily AI use?
          </h1>
        </div>
        <p className="slide-body-lg text-muted-foreground font-light">
          {stage === 1 && "Trust. Tenure. Training. Or… feelings?"}
          {stage === 2 && "How they feel > what they know."}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-7xl mx-auto w-full px-6">
          {/* The four predictors — visible from stage 1 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {predictors.map((p) => {
              const Icon = p.icon;
              const isWinner = p.isWinner && stage >= 2;
              const isDimmed = stage >= 2 && !p.isWinner;

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl p-6 border-2 shadow-lg transition-all duration-700 text-center ${
                    isWinner
                      ? "bg-primary/15 border-primary scale-105 shadow-2xl"
                      : isDimmed
                      ? "bg-muted/20 border-border/40 opacity-50"
                      : "bg-background/80 border-foreground/20"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
                      isWinner
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-10 w-10" />
                  </div>
                  <p
                    className={`slide-body-lg font-bold ${ isWinner ? "text-primary" : "text-foreground" }`}
                  >
                    {p.label}
                  </p>
                  {isWinner && (
                    <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-base font-bold uppercase tracking-wider animate-fade-in">
                      Strongest predictor
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Research callout — appears with the reveal */}
          {stage >= 2 && (
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30 rounded-2xl p-6 shadow-lg animate-fade-in max-w-5xl mx-auto text-center">
              <p className="slide-body-lg font-bold text-foreground leading-snug">
                How your people <em className="text-primary">feel</em> about AI predicts
                whether they'll use it —
              </p>
              <p className="slide-body-lg font-bold text-primary leading-snug mt-2">
                more than what they <em>know</em> about it.
              </p>
              <p className="slide-caption text-muted-foreground italic mt-4">
                Source: Imagination Applied — analysis of 203,812 Stack Overflow Developer Survey responses (2023–2025).
              </p>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxStage }).map((_, i) => {
              const s = i + 1;
              return (
                <div
                  key={s}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    s === stage
                      ? "bg-primary scale-125"
                      : s < stage
                      ? "bg-primary/50"
                      : "bg-muted-foreground/30"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
