import { QuizCard } from "../blocks/QuizCard";

export const DoctorAIQuizScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center animate-slide-in">
      <div className="max-w-5xl mx-auto w-full">
        <QuizCard
          question="Which group performed BEST at diagnosing complex medical cases?"
          options={[
            { id: "experts-conventional", label: "Doctors using conventional resources (textbooks, databases)", isCorrect: false },
            { id: "experts-ai", label: "Doctors given access to AI diagnostic tools", isCorrect: false },
            { id: "ai-alone", label: "The AI alone (without doctors)", isCorrect: true },
          ]}
          correctFeedback="Yes! The AI alone outperformed both groups of doctors."
          explanation={
            <div>
              <p className="slide-caption mb-4">
                <strong className="text-destructive">The shocking finding:</strong> Doctors given AI diagnostic access did NOT improve diagnostic accuracy vs. conventional resources—even though the AI alone outperformed both groups of doctors on the same cases.
              </p>
              <p className="slide-caption text-primary font-semibold mb-4">
                → Access to AI ≠ Better outcomes. You need training on how to use it as a thought partner, not an oracle.
              </p>
              <p className="slide-caption mb-4">
                <strong>What changed when doctors learned to use AI differently:</strong> When trained to treat AI as a "second opinion" to challenge their thinking rather than a definitive answer, diagnostic accuracy improved significantly.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Source: Multiple studies including JAMA Network Open, 2024
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};
