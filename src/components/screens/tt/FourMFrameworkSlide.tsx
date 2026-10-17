import { useState, useEffect } from "react";

const lenses = [
  {
    name: "Metaphor",
    symbol: "✦",
    description: "What story reframes the problem?",
  },
  {
    name: "Mechanism",
    symbol: "✦",
    description: "A tool borrowed from a discipline",
  },
  {
    name: "Motion",
    symbol: "",
    description: "The doing — rehearsal, pulling the thread",
  },
  {
    name: "Meaning",
    symbol: "",
    description: "The spark that loops back",
  },
];

export const FourMFrameworkSlide = () => {
  const [revealed, setRevealed] = useState<number[]>([]);

  useEffect(() => {
    lenses.forEach((_, i) => {
      setTimeout(() => setRevealed((prev) => [...prev, i]), 400 + i * 300);
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-4">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center">
          The 4-M Framework
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {lenses.map((lens, i) => (
            <div
              key={lens.name}
              className={`rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6 transition-all duration-500 ${
                revealed.includes(i)
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90"
              }`}
            >
              <p className="text-xl font-display font-bold text-secondary">
                {lens.name}{" "}
                {lens.symbol && (
                  <span className="text-secondary/60">{lens.symbol}</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {lens.description}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-lg text-muted-foreground">
          We've done Metaphor. Now:{" "}
          <span className="text-foreground font-semibold">the Mechanism.</span>
        </p>
      </div>
    </div>
  );
};
