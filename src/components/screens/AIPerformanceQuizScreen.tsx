import { useState, useEffect, useCallback } from "react";
import { Heart, CheckCircle2, XCircle } from "lucide-react";

export const AIPerformanceQuizScreen = () => {
  const [stage, setStage] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
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

  const handleSelectAnswer = (answerId: string) => {
    if (stage === 1) {
      setSelectedAnswer(answerId);
      setTimeout(() => setStage(2), 400);
    }
  };

  const options = [
    { id: "humans", label: "Human doctors" },
    { id: "ai", label: "AI chatbot" },
    { id: "same", label: "About the same" },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center px-8 overflow-hidden">
      <div className="max-w-5xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              The Empathy Test
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground">
            Patients asked health questions online. Who gave more <span className="text-primary font-semibold">empathetic</span> responses?
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isRevealed = stage >= 2;
            const isCorrect = option.id === "ai";
            
            return (
              <button
                key={option.id}
                onClick={() => handleSelectAnswer(option.id)}
                disabled={stage >= 2}
                className={`p-5 rounded-xl text-center text-xl font-semibold transition-all duration-300 flex flex-col items-center gap-2 ${
                  isRevealed
                    ? isCorrect
                      ? "bg-green-500/20 border-3 border-green-500 text-foreground scale-102"
                      : "bg-muted/20 border border-muted text-muted-foreground opacity-60"
                    : isSelected
                      ? "bg-primary/20 border-2 border-primary text-foreground"
                      : "bg-background border border-muted hover:border-primary/50 hover:bg-primary/5 text-foreground cursor-pointer"
                }`}
              >
                {isRevealed && isCorrect && (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                )}
                {isRevealed && isSelected && !isCorrect && (
                  <XCircle className="h-8 w-8 text-destructive" />
                )}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Reveal */}
        {stage >= 2 && (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/40 rounded-xl p-5 text-center animate-fade-in">
            <p className="text-2xl md:text-3xl text-foreground leading-snug">
              AI rated <strong className="text-primary">4× more empathetic</strong> than doctors.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Nature Medicine, 2024
            </p>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                s === stage ? "bg-primary scale-125" : s < stage ? "bg-primary/50" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
