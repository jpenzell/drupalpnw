import { useState, useEffect, useCallback } from "react";

const steps = [
  {
    label: "Want",
    text: "Every character wants something.",
    sub: "Not what they say — what they need.",
    color: "text-secondary",
  },
  {
    label: "Obstacle",
    text: "Something stands in the way.",
    sub: "Without an obstacle, there's no scene.",
    color: "text-destructive",
  },
  {
    label: "Drama",
    text: "Want + Obstacle = Drama.",
    sub: "That tension is the engine of every scene.",
    color: "text-primary",
  },
  {
    label: "A Second Character",
    text: "Now add another person with their own want.",
    sub: "Two competing wants. Now you have a real scene.",
    color: "text-secondary",
  },
  {
    label: "Tactics",
    text: "How each character pursues their want.",
    sub: "Persuade. Deflect. Charm. Threaten. The verb is the tactic.",
    color: "text-accent-foreground",
  },
  {
    label: "Beats",
    text: "The moments where the tactic shifts.",
    sub: "When one tactic fails, the character tries another. That's a beat.",
    color: "text-foreground",
  },
];

export const WantsTacticsSlide = () => {
  const [visibleCount, setVisibleCount] = useState(1);

  const advance = useCallback(() => {
    setVisibleCount((c) => {
      if (c < steps.length) return c + 1;
      return c;
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (visibleCount >= steps.length) return;
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isTyping) return;

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        e.stopImmediatePropagation();
        advance();
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [visibleCount, advance]);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 cursor-pointer select-none"
      onClick={advance}
    >
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground text-center mb-12">
          The Anatomy of a Scene
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {steps.slice(0, visibleCount).map((step) => (
            <div
              key={step.label}
              className="animate-fade-in flex items-baseline gap-6"
            >
              <span
                className={`text-sm md:text-base uppercase tracking-widest ${step.color} font-bold shrink-0 w-44 text-right`}
              >
                {step.label}
              </span>
              <div className="border-l-2 border-secondary/40 pl-6 py-1">
                <p className="text-xl md:text-2xl text-foreground font-display font-semibold leading-snug">
                  {step.text}
                </p>
                <p className="text-base md:text-lg text-muted-foreground mt-1">
                  {step.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {visibleCount < steps.length && (
          <p className="text-sm text-muted-foreground/40 text-center mt-8 animate-pulse">
            →
          </p>
        )}
      </div>
    </div>
  );
};
