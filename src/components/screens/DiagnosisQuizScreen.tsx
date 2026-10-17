import { QuizCard } from "../blocks/QuizCard";

export const DiagnosisQuizScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center animate-slide-in">
      <div className="max-w-5xl mx-auto w-full">
        <QuizCard
          question="Teachers using AI for lesson planning report saving 6 weeks/year. What's the hidden challenge?"
          options={[
            { id: "no-challenge", label: "No hidden challenge — pure productivity gain", isCorrect: false },
            { id: "student-confusion", label: "Students notice and feel disconnected from AI-generated content", isCorrect: false },
            { id: "review-adapt", label: "Teachers must review and adapt outputs to fit their students", isCorrect: true },
            { id: "admin-policies", label: "School policies restrict what AI can be used for", isCorrect: false },
          ]}
          correctFeedback="Exactly! AI accelerates creation but shifts effort to curation."
          explanation={
            <div>
              <p className="text-lg mb-4">
                <strong className="text-destructive">The Gallup finding:</strong> While 30% of teachers use AI weekly and report saving significant time, they note the outputs still require substantial human review, adaptation, and alignment to student needs and learning objectives.
              </p>
              <p className="text-primary font-semibold text-lg mb-4">
                → AI doesn't eliminate work—it transforms it. You're trading creation time for curation and customization time.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Source: Gallup Education Survey, 2025
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};
