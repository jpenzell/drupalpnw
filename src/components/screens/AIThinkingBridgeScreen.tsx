import { MessageSquare, HelpCircle, User } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

export const AIThinkingBridgeScreen = () => {
  const [stage, setStage] = useState(1);
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
      }
    }
  }, [stage, maxStage]);

  useEffect(() => {
    window.addEventListener("keydown", handleAdvance, { capture: true });
    return () => window.removeEventListener("keydown", handleAdvance, { capture: true } as any);
  }, [handleAdvance]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8">
      <div className="max-w-5xl w-full space-y-10">
        
        {/* Stage 1: It "thinks" in language */}
        <div className={`transition-all duration-500 ${stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl">
              <MessageSquare className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-foreground">
                It "thinks" in <span className="text-primary">language</span>
              </h2>
              <p className="text-xl text-muted-foreground mt-2">
                And language, as we've seen, is <strong className="text-foreground">subjective</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Stage 2: We don't know how or why */}
        <div className={`transition-all duration-500 ${stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-xl">
              <HelpCircle className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-foreground">
                We don't know <span className="text-secondary">how</span> or <span className="text-secondary">why</span>
              </h2>
              <p className="text-xl text-muted-foreground mt-2">
                Just like the human brain—even its creators can't fully explain it.
              </p>
            </div>
          </div>
        </div>

        {/* Stage 3: It sounds human */}
        <div className={`transition-all duration-500 ${stage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-xl">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-foreground">
                It sounds <span className="text-accent">human</span>
              </h2>
              <p className="text-xl text-muted-foreground mt-2">
                Because it learned from everything we've ever written.
              </p>
            </div>
          </div>
          
          {/* The punchline - the real question */}
          <div className="mt-10 bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/30 rounded-2xl p-8">
            <p className="text-3xl text-foreground font-bold text-center">
              So if it's so much like us...
            </p>
            <p className="text-2xl text-destructive font-semibold text-center mt-3">
              Why is it so hard to work with?
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 pt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                s === stage ? "bg-primary scale-125" : s < stage ? "bg-primary/50" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
