import { useState, useEffect, useCallback } from "react";

const questions = [
  { label: "The Play", question: "What's the initiative as written — the official plan?" },
  { label: "The Show", question: "What's actually happening — the pattern people are living?" },
  { label: "Characters", question: "Who are the key players in this scene?" },
  { label: "Wants", question: "What does each character really want — underneath what they say?" },
  { label: "Obstacles", question: "What's blocking each character from getting what they want?" },
  { label: "Tactics", question: "What is each character doing to pursue their want?" },
  { label: "Beats", question: "Where does the tactic shift? What moment changes the scene?" },
  { label: "The Move", question: "What's one directing move you'd make right now?" },
];

export const SceneSprintQuestionsSlide = () => {
  const [visibleCount, setVisibleCount] = useState(1);

  const advance = useCallback(() => {
    setVisibleCount((c) => {
      if (c < questions.length) return c + 1;
      return c;
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (visibleCount >= questions.length) return;
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
      className="flex-1 flex flex-col items-center justify-center animate-fade-in px-4 cursor-pointer select-none"
      onClick={advance}
    >
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center">
          The Scene Sprint
        </h2>

        <div className="space-y-3">
          {questions.slice(0, visibleCount).map((q, i) => (
            <div
              key={q.label}
              className="flex items-start gap-4 animate-fade-in border-l-2 border-secondary/40 pl-4 py-1"
            >
              <span className="text-xs uppercase tracking-widest text-secondary font-semibold shrink-0 whitespace-nowrap text-right pt-0.5">
                {q.label}
              </span>
              <p className="text-lg text-foreground">{q.question}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
