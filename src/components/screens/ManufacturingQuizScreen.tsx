import { QuizCard } from "../blocks/QuizCard";

export const ManufacturingQuizScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center animate-slide-in">
      <div className="max-w-5xl mx-auto w-full">
        <QuizCard
          question="When sales teams adopt new AI tools, what typically happens to productivity in the first 60 days?"
          options={[
            { id: "immediate", label: "Immediate improvement across all metrics", isCorrect: false },
            { id: "small-dip", label: "5-10% dip, quickly recovered", isCorrect: false },
            { id: "mixed", label: "No measurable change in first month", isCorrect: false },
            { id: "decline", label: "Initial decline before improvements emerge", isCorrect: true },
          ]}
          correctFeedback="Yes! Technology adoption in sales follows a J-curve pattern."
          explanation={
            <div>
              <p className="text-lg mb-4">
                When teams adopt new AI tools, research shows <strong className="text-destructive">initial productivity dips</strong> are common before benefits emerge. Reps need time to learn effective prompting, workflows must adapt, and muscle memory takes time to build.
              </p>
              <p className="text-lg mb-4">
                Recovery takes <strong>60-90 days, not weeks</strong>. Requires training, practice, and sharing what works across the team.
              </p>
              <p className="text-primary font-semibold text-lg mb-4">
                → Without complementary changes in workflow, technology creates disruption rather than enhancement. This is the J-curve in action.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Source: Technology adoption research across industries
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};
