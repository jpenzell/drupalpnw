import { useState, useEffect } from "react";

const rows = [
  { theater: "Actors", business: "Your employees" },
  { theater: "Audience", business: "Your clients" },
  { theater: "Script", business: "SOPs, talk tracks, processes" },
  { theater: "Producer", business: "The company" },
  {
    theater: "That thing that makes you believe an actor",
    business: 'What we call "engagement"',
  },
];

export const TheaterBusinessMappingSlide = () => {
  const [revealed, setRevealed] = useState<number[]>([]);

  useEffect(() => {
    rows.forEach((_, i) => {
      setTimeout(() => setRevealed((prev) => [...prev, i]), 400 + i * 350);
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-4">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center">
          Theater → Business
        </h2>

        <div className="space-y-3">
          {rows.map((row, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm p-4 transition-all duration-600 ${
                revealed.includes(i)
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
            >
              <span className="text-base font-display font-semibold text-secondary w-2/5 text-right">
                {row.theater}
              </span>
              <span className="text-secondary text-xl">→</span>
              <span className="text-base text-foreground w-2/5">
                {row.business}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
