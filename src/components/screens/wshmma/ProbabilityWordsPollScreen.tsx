import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

/**
 * A1-3b — "What does that even mean?"
 * Auto-cycles through vague probability phrases. Presenter advances manually.
 */

const PHRASES = ["Slam dunk", "Serious possibility", "Rarely", "Real chance"];
const CYCLE_MS = 2600;

export const ProbabilityWordsPollScreen = () => {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const phrase = PHRASES[phraseIdx];

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % PHRASES.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex-1 flex flex-col px-12 py-10 animate-fade-in overflow-hidden">
      <div className="flex items-center justify-center gap-3 text-secondary">
        <Sparkles className="h-7 w-7" />
        <span className="uppercase tracking-[0.4em] slide-kicker font-semibold">
          What does that even mean?
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center min-h-0">
        <p className="slide-subtitle text-muted-foreground font-display mb-6">
          When you hear…
        </p>

        <h1
          key={phrase}
          className="font-display font-bold leading-[0.95] text-foreground animate-fade-in w-full"
          style={{ fontSize: "clamp(6rem, 14cqw, 20rem)", letterSpacing: "-0.05em" }}
        >
          <span className="text-primary italic">"{phrase}"</span>
        </h1>

        <p className="slide-subtitle text-foreground/85 font-display mt-6">
          …what % chance do they mean?
        </p>
      </div>

      <div className="flex justify-center gap-3 mt-4">
        {PHRASES.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === phraseIdx ? "w-12 bg-primary" : "w-2 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
