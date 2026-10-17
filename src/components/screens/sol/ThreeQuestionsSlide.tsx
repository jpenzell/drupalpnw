import { useReveal } from "@/hooks/useReveal";

const QUESTIONS = [
  "What action am I playing?",
  "What action is everyone else playing?",
  "What's my because?",
];

export const ThreeQuestionsSlide = () => {
  const { shown, Dots } = useReveal(QUESTIONS.length + 1);
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6">
      <div className="max-w-5xl w-full text-center space-y-10">
        <p className="text-2xl md:text-3xl font-display text-muted-foreground italic">
          Tomorrow morning, before the meeting starts —<br />ask three questions.
        </p>

        <div className="space-y-8">
          {QUESTIONS.map((q, i) => (
            <p
              key={i}
              className={`text-3xl md:text-5xl font-display leading-snug transition-all duration-700 ${
                shown(i + 2)
                  ? i === 2
                    ? "text-primary opacity-100 italic"
                    : "text-foreground opacity-100"
                  : "opacity-0 translate-y-4"
              }`}
            >
              {q}
            </p>
          ))}
        </div>

        <Dots />
      </div>
    </div>
  );
};
