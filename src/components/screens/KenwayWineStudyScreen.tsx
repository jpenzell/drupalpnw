import { useState, useEffect, useCallback } from "react";
import { PenTool, Bot, Users } from "lucide-react";

type GuessOption = 'human' | 'ai' | 'hybrid' | null;

export const KenwayWineStudyScreen = () => {
  const [stage, setStage] = useState(1);
  const [guess, setGuess] = useState<GuessOption>(null);
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

  const handleGuess = (option: GuessOption) => {
    if (stage === 1) {
      setGuess(option);
      setTimeout(() => setStage(2), 500);
    }
  };

  const isRevealed = stage >= 2;

  return (
    <div className="flex-1 flex flex-col justify-center px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-4">
          <p className="text-base text-muted-foreground uppercase tracking-widest mb-1">
            Kenway Wine Study • E-Commerce Descriptions
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Which <span className="text-primary">Product Descriptions</span> Sold Best?
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Researchers tested wine descriptions on a D2C site to see which drove more purchases
          </p>
        </div>

        {/* The 3 Options - Compact Cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-5">
          {/* Human */}
          <button
            onClick={() => handleGuess('human')}
            disabled={isRevealed}
            className={`rounded-2xl p-6 text-center transition-all duration-500 ${
              isRevealed 
                ? 'bg-muted/20 border-3 border-muted-foreground/50'
                : guess === 'human'
                  ? 'bg-accent/20 border-3 border-accent scale-105'
                  : 'bg-card border-2 border-border hover:border-muted-foreground/50 hover:scale-102 cursor-pointer'
            }`}
          >
            <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-foreground">Human-Written</h3>
            <p className="text-sm text-muted-foreground mt-1">Copywriter wrote from scratch</p>
            
            {isRevealed && (
              <p className="text-xl font-bold text-muted-foreground mt-3 animate-fade-in">Baseline</p>
            )}
          </button>

          {/* AI */}
          <button
            onClick={() => handleGuess('ai')}
            disabled={isRevealed}
            className={`rounded-2xl p-6 text-center transition-all duration-500 ${
              isRevealed 
                ? 'bg-secondary/20 border-3 border-secondary'
                : guess === 'ai'
                  ? 'bg-accent/20 border-3 border-accent scale-105'
                  : 'bg-card border-2 border-border hover:border-secondary/50 hover:scale-102 cursor-pointer'
            }`}
          >
            <Bot className="h-12 w-12 text-secondary mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-foreground">AI-Generated</h3>
            <p className="text-sm text-muted-foreground mt-1">AI wrote, published as-is</p>
            
            {isRevealed && (
              <p className="text-xl font-bold text-secondary mt-3 animate-fade-in">= Human!</p>
            )}
          </button>

          {/* Hybrid - The Trap */}
          <button
            onClick={() => handleGuess('hybrid')}
            disabled={isRevealed}
            className={`rounded-2xl p-6 text-center transition-all duration-500 ${
              isRevealed 
                ? 'bg-destructive/10 border-3 border-destructive'
                : guess === 'hybrid'
                  ? 'bg-accent/20 border-3 border-accent scale-105'
                  : 'bg-card border-2 border-border hover:border-accent/50 hover:scale-102 cursor-pointer'
            }`}
          >
            <Users className="h-12 w-12 text-accent mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-foreground">AI + Human Edit</h3>
            <p className="text-sm text-muted-foreground mt-1">AI wrote, human polished</p>
            
            {isRevealed && (
              <p className="text-xl font-bold text-destructive mt-3 animate-fade-in">Worst!</p>
            )}
          </button>
        </div>

        {/* Reveal + Insight Combined */}
        {isRevealed && (
          <div className="bg-gradient-to-r from-primary/10 to-destructive/10 border-2 border-primary/30 rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-center gap-6">
              <span className="text-5xl">{guess === 'hybrid' ? '🎯' : '😮'}</span>
              <div className="text-left">
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  Editing AI made it <span className="text-destructive">worse</span>.
                </p>
                <p className="text-xl text-primary font-semibold mt-1">
                  Direct it or do it yourself.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress - subtle */}
        <div className="flex justify-center gap-1.5 mt-5 opacity-30">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                s <= stage ? "bg-muted-foreground" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
