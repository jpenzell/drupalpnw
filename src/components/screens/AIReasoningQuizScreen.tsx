import { useState, useEffect, useCallback } from "react";
import { Brain, CheckCircle2, XCircle } from "lucide-react";

export const AIReasoningQuizScreen = () => {
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
    { id: "humans", label: "Humans" },
    { id: "ai", label: "AI (GPT-4, Claude)" },
    { id: "same", label: "About the same" },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center px-8 overflow-hidden">
      <div className="max-w-5xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              The Reasoning Test
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground">
            Simple logic puzzles with <span className="text-accent font-semibold">unfamiliar wording</span>. Who solved them?
          </p>
        </div>

        {/* The puzzle example */}
        <div className="bg-muted/20 border border-muted rounded-lg p-4 text-center mb-4">
          <p className="text-base text-foreground italic">
            "Alice has N brothers and she also has M sisters. How many sisters does Alice's brother have?"
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isRevealed = stage >= 2;
            const isCorrect = option.id === "humans";
            
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
                      ? "bg-accent/20 border-2 border-accent text-foreground"
                      : "bg-background border border-muted hover:border-accent/50 hover:bg-accent/5 text-foreground cursor-pointer"
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
          <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/40 rounded-xl p-5 text-center animate-fade-in">
            <p className="text-xl md:text-2xl text-foreground leading-snug">
              GPT-4 got it wrong <strong className="text-destructive">over 90%</strong> of the time.
            </p>
            <p className="text-base text-foreground mt-2">
              Grade-school logic. But the wording was <span className="text-destructive font-semibold">unfamiliar</span>.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              "Alice in Wonderland" Study, 2024 — Testing reasoning vs. pattern matching
            </p>
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                s === stage ? "bg-accent scale-125" : s < stage ? "bg-accent/50" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
