import { useState, useEffect, useCallback } from "react";
import { Users } from "lucide-react";

export const HRLeadsTheRevolutionSlide = () => {
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
      } else if (e.key === "ArrowLeft" && stage > 1) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setStage((s) => s - 1);
      }
    },
    [stage]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleAdvance, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleAdvance, { capture: true } as any);
  }, [handleAdvance]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 animate-fade-in">
      <div className="max-w-6xl w-full space-y-12 text-center">
        {/* Premises — three stacked "if" lines, each highlighting "human" */}
        <div className="space-y-6">
          <p className="slide-subtitle font-display text-foreground leading-tight">
            If AI acts like a <span className="text-primary font-bold italic">human</span>…
          </p>
          <p className="slide-subtitle font-display text-foreground leading-tight">
            If AI is trained on <span className="text-primary font-bold italic">human</span> knowledge…
          </p>
          <p className="slide-subtitle font-display text-foreground leading-tight">
            If you are <span className="text-primary font-bold italic">Human</span> Resource professionals…
          </p>
        </div>

        {/* The reveal box */}
        {stage >= 2 && (
          <div className="bg-primary/10 border-2 border-primary rounded-3xl p-12 shadow-2xl animate-fade-in">
            <Users className="w-16 h-16 text-primary mx-auto mb-6" />
            <p className="slide-title font-display font-bold text-foreground leading-tight">
              <span className="text-primary">YOU</span> are the
              <br />
              AI experts.
            </p>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 opacity-30">
          {Array.from({ length: maxStage }).map((_, i) => {
            const s = i + 1;
            return (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  s === stage ? "bg-primary scale-125" : s < stage ? "bg-primary/50" : "bg-muted-foreground/30"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
