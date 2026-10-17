import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Citation } from "@/components/blocks/Citation";

interface Step {
  context: string;
  predictions: { word: string; p: number }[];
  chosen: string;
}

const STEPS: Step[] = [
  {
    context: "The director gave the actor a",
    predictions: [
      { word: "note", p: 34 },
      { word: "cue", p: 22 },
      { word: "script", p: 18 },
      { word: "look", p: 11 },
    ],
    chosen: "note",
  },
  {
    context: "The director gave the actor a note",
    predictions: [
      { word: "before", p: 29 },
      { word: "after", p: 24 },
      { word: "during", p: 16 },
      { word: "between", p: 12 },
    ],
    chosen: "before",
  },
  {
    context: "The director gave the actor a note before",
    predictions: [
      { word: "the", p: 58 },
      { word: "every", p: 14 },
      { word: "opening", p: 11 },
      { word: "rehearsal", p: 9 },
    ],
    chosen: "the",
  },
  {
    context: "The director gave the actor a note before the",
    predictions: [
      { word: "scene", p: 36 },
      { word: "show", p: 28 },
      { word: "performance", p: 19 },
      { word: "curtain", p: 10 },
    ],
    chosen: "scene",
  },
];

const TICK_MS = 2200;

export const NextTokenDemoSlide = () => {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const built = STEPS.slice(0, i + 1).map((s) => s.chosen).join(" ");

  useEffect(() => {
    const t = setTimeout(() => setI((v) => (v + 1) % STEPS.length), TICK_MS);
    return () => clearTimeout(t);
  }, [i]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6 py-8 overflow-y-auto">
      <div className="w-full max-w-6xl space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-6xl font-display font-light text-foreground leading-tight">
            Generative AI is <span className="italic text-primary">a language machine.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-mono">
            One token at a time — pick the most likely next word, and repeat.
          </p>
        </div>

        <div className="bg-card border-2 border-border rounded-3xl p-8 shadow-lg space-y-8">
          {/* Context */}
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-secondary font-bold mb-2">
              Prompt so far
            </div>
            <div className="text-2xl md:text-3xl font-display text-foreground bg-muted/40 rounded-xl p-4 flex items-center min-h-[64px]">
              <span>{step.context}</span>
              <span className="ml-2 inline-block w-3 h-7 bg-primary animate-pulse rounded" />
            </div>
          </div>

          {/* Predictions */}
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-secondary font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Probability of the next word
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {step.predictions.map((pred) => {
                const isChosen = pred.word === step.chosen;
                return (
                  <div
                    key={pred.word}
                    className={`relative rounded-xl p-4 border-2 transition-all duration-300 ${
                      isChosen
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xl font-display ${isChosen ? "text-primary font-semibold" : "text-foreground"}`}>
                        "{pred.word}"
                      </span>
                      <span className={`text-lg font-mono ${isChosen ? "text-primary" : "text-muted-foreground"}`}>
                        {pred.p}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${isChosen ? "bg-primary" : "bg-muted-foreground/40"}`}
                        style={{ width: `${pred.p}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Generated */}
          <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-secondary font-bold mb-1">
              Generated
            </div>
            <div className="text-xl md:text-2xl font-display text-foreground italic">
              "{built}…"
            </div>
          </div>
        </div>

        <Citation sources={[
          "Shannon (1951). Prediction and entropy of printed English.",
          "Vaswani et al. (2017). Attention is all you need.",
        ]} />
      </div>
    </div>
  );
};
