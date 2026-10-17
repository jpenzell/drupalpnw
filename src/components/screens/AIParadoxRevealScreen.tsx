import { useState, useEffect, useCallback } from "react";
import { Stethoscope, Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import { signalEnterAtMax } from "@/hooks/useReveal";

export const AIParadoxRevealScreen = () => {
  const [stage, setStage] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const maxStage = 3;

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
      } else {
        signalEnterAtMax();
      }
    }
  }, [stage, maxStage]);

  useEffect(() => {
    window.addEventListener("keydown", handleAdvance, { capture: true });
    return () => window.removeEventListener("keydown", handleAdvance, { capture: true } as any);
  }, [handleAdvance]);

  const handleSelectAnswer = (answerId: string) => {
    if (stage === 1) {
      setSelectedAnswer(answerId);
      setTimeout(() => setStage(2), 400);
    }
  };

  const options = [
    { id: "doctors", label: "Doctors with textbooks" },
    { id: "doctors-ai", label: "Doctors with AI tools" },
    { id: "ai-alone", label: "AI alone" },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 overflow-hidden">
      <div className="max-w-6xl w-full">

        {stage <= 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-4 mb-4">
                <Stethoscope className="h-12 w-12 text-primary" />
                <h1 className="slide-title-lg text-foreground">
                  The Doctor Diagnosis Study
                </h1>
              </div>
              <p className="slide-body-lg text-muted-foreground">
                Which group diagnosed complex cases <span className="text-primary font-semibold">best</span>?
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {options.map((option) => {
                const isSelected = selectedAnswer === option.id;
                const isRevealed = stage >= 2;
                const isCorrect = option.id === "ai-alone";

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectAnswer(option.id)}
                    disabled={stage >= 2}
                    className={`slide-body p-8 rounded-2xl text-center font-semibold transition-all duration-300 flex flex-col items-center gap-4 ${ isRevealed ? isCorrect ? "bg-secondary/20 border-4 border-secondary text-foreground scale-105" : "bg-muted/20 border-2 border-muted text-muted-foreground opacity-60" : isSelected ? "bg-primary/20 border-[3px] border-primary text-foreground" : "bg-background border-2 border-muted hover:border-primary/50 hover:bg-primary/5 text-foreground cursor-pointer" }`}
                  >
                    {isRevealed && isCorrect && <CheckCircle2 className="h-12 w-12 text-secondary" />}
                    {isRevealed && isSelected && !isCorrect && <XCircle className="h-12 w-12 text-primary" />}
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>

            {stage >= 2 && (
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-[3px] border-primary/40 rounded-2xl p-8 text-center animate-fade-in">
                <p className="slide-body-lg text-foreground">
                  <strong className="text-primary">AI alone</strong> won — but doctors + AI did <strong className="text-primary">no better</strong> than doctors + textbooks.
                </p>
                <p className="slide-body text-muted-foreground mt-3">Why didn't AI help the doctors?</p>
              </div>
            )}
          </div>
        )}

        {stage >= 3 && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-4 border-secondary rounded-2xl p-10">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Lightbulb className="h-14 w-14 text-secondary" />
                <h2 className="slide-title-lg text-foreground">What if…</h2>
              </div>

              <p className="slide-body-lg text-center text-foreground mb-8">
                …you told the doctors it was a <span className="text-secondary font-bold">first-year medical student</span>?
              </p>

              <div className="bg-background/50 border-2 border-secondary/30 rounded-xl p-6 space-y-3">
                <p className="slide-body text-foreground text-center">Would they have asked <strong className="text-primary">"Why?"</strong></p>
                <p className="slide-body text-foreground text-center">Would they have <strong className="text-primary">challenged</strong> the reasoning?</p>
                <p className="slide-body text-foreground text-center">Would they have <strong className="text-primary">taught</strong> instead of trusted?</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3 mt-10">
          {[1, 2, 3].map((s) => (
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
