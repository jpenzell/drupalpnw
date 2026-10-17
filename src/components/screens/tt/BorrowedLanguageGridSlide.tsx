import { useState, useEffect } from "react";

const cards = [
  { emoji: "🎭", theater: "Roles", business: "Job descriptions" },
  { emoji: "⭐", theater: "Performance", business: "Reviews" },
  { emoji: "📜", theater: "Script", business: "Talk tracks & SOPs" },
  { emoji: "💡", theater: "Spotlight", business: "Highlight / showcase" },
  { emoji: "🎬", theater: "Setting the Scene", business: "Context & framing" },
  { emoji: "🏟️", theater: "Stakeholders", business: "The audience" },
];

export const BorrowedLanguageGridSlide = () => {
  const [revealed, setRevealed] = useState<number[]>([]);

  useEffect(() => {
    cards.forEach((_, i) => {
      setTimeout(() => setRevealed((prev) => [...prev, i]), 300 + i * 250);
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-4">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center">
          Borrowed Language
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <div
              key={card.theater}
              className={`rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 text-center transition-all duration-500 ${
                revealed.includes(i)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <span className="text-3xl mb-2 block">{card.emoji}</span>
              <p className="text-lg font-display font-bold text-secondary">
                {card.theater}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {card.business}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-lg text-muted-foreground italic pt-2">
          Business doesn't borrow metaphors of performance.{" "}
          <span className="text-foreground font-semibold">It is one.</span>
        </p>
      </div>
    </div>
  );
};
