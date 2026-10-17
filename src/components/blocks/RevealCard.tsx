import { ReactNode, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface RevealCardProps {
  question: string;
  answer: ReactNode;
  variant?: "default" | "stat";
}

export const RevealCard = ({ question, answer, variant = "default" }: RevealCardProps) => {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = useCallback(() => {
    if (!revealed) {
      setRevealed(true);
    }
  }, [revealed]);

  // Keyboard navigation - spacebar or right arrow reveals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in an input
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || 
                       target.tagName === 'TEXTAREA' || 
                       target.isContentEditable;
      
      if (isTyping) return;

      if ((e.key === " " || e.key === "ArrowRight") && !revealed) {
        e.preventDefault();
        e.stopPropagation();
        handleReveal();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [revealed, handleReveal]);

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20 rounded-2xl p-8 shadow-lg">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground">{question}</h3>
        {!revealed && (
          <Button
            onClick={handleReveal}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 shrink-0"
          >
            <Eye className="h-4 w-4" />
            Reveal
          </Button>
        )}
      </div>
      
      {revealed ? (
        <div className="animate-fade-in bg-background/80 p-6 rounded-xl border-2 border-accent shadow-inner">
          {variant === "stat" ? (
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-4">{answer}</div>
            </div>
          ) : (
            <div className="text-foreground text-lg leading-relaxed">{answer}</div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground italic">
          Press <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono mx-1">Space</kbd> or click to reveal...
        </p>
      )}
    </div>
  );
};
