import { QuizCard } from "../blocks/QuizCard";

export const DeveloperQuizScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center animate-slide-in">
      <div className="max-w-5xl mx-auto w-full">
        <QuizCard
          question="Students using ChatGPT for writing assignments show what pattern?"
          options={[
            { id: "better-grades", label: "Consistently higher grades across all assignments", isCorrect: false },
            { id: "surface-level", label: "Polished surface but weaker critical thinking", isCorrect: true },
            { id: "no-difference", label: "No measurable difference in learning outcomes", isCorrect: false },
            { id: "plagiarism", label: "Mostly plagiarism concerns with no learning benefit", isCorrect: false },
          ]}
          correctFeedback="Exactly! AI can mask shallow understanding with confident-sounding text."
          explanation={
            <div>
              <p className="text-lg mb-4">
                <strong className="text-destructive">Research finding:</strong> Students using ChatGPT produce more polished writing with better grammar and structure—but systematic reviews show weaker argumentation, less original thinking, and reduced ability to defend their ideas when questioned.
              </p>
              <p className="text-primary font-semibold text-lg mb-4">
                → AI can accelerate output while masking learning gaps. Teaching students to use AI as a thought partner (not a ghostwriter) is critical.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Source: Systematic review in Computers & Education, 2024
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};
