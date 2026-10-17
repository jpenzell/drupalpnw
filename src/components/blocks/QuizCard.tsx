import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface QuizOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

interface QuizCardProps {
  question: string;
  options: QuizOption[];
  explanation: ReactNode;
  correctFeedback?: string;
}

export const QuizCard = ({ question, options, explanation, correctFeedback }: QuizCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleOptionClick = (optionId: string, isCorrect: boolean) => {
    setSelectedOption(optionId);
    if (isCorrect) {
      setTimeout(() => setShowExplanation(true), 800);
    }
  };

  const selectedOptionData = options.find(opt => opt.id === selectedOption);

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20 rounded-2xl p-10 shadow-lg">
      <h3 className="slide-subtitle font-bold text-foreground mb-8 leading-tight">{question}</h3>
      
      {!selectedOption ? (
        <div className="grid gap-5">
          {options.map((option) => (
            <Button
              key={option.id}
              onClick={() => handleOptionClick(option.id, option.isCorrect)}
              variant="outline"
              size="lg"
              className="h-auto py-5 px-8 text-left slide-body font-semibold whitespace-normal hover:scale-102 transition-all hover:border-primary hover:bg-primary/5"
            >
              {option.label}
            </Button>
          ))}
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Show all options with correct/incorrect indicators */}
          <div className="grid gap-4">
            {options.map((option) => (
              <div
                key={option.id}
                className={`p-5 rounded-xl border-2 transition-all ${
                  option.id === selectedOption
                    ? option.isCorrect
                      ? "border-green-500 bg-green-500/10"
                      : "border-destructive bg-destructive/10"
                    : option.isCorrect
                    ? "border-green-500 bg-green-500/5"
                    : "border-border bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="slide-body font-semibold text-foreground">{option.label}</span>
                  {option.isCorrect ? (
                    <div className="flex items-center gap-2 text-green-600 shrink-0">
                      <Check className="h-7 w-7" />
                      <span className="font-bold slide-caption">Correct!</span>
                    </div>
                  ) : option.id === selectedOption ? (
                    <div className="flex items-center gap-2 text-destructive shrink-0">
                      <X className="h-7 w-7" />
                      <span className="font-bold slide-caption">Not quite</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* Show explanation after correct answer or immediately if incorrect */}
          {(showExplanation || !selectedOptionData?.isCorrect) && (
            <div className="bg-background/80 p-6 rounded-xl border-2 border-accent shadow-inner animate-fade-in">
              {selectedOptionData?.isCorrect && correctFeedback && (
                <p className="text-2xl font-bold text-green-600 mb-4">{correctFeedback}</p>
              )}
              <div className="text-foreground leading-relaxed text-lg">{explanation}</div>
            </div>
          )}

          {!showExplanation && selectedOptionData?.isCorrect && (
            <Button
              onClick={() => setShowExplanation(true)}
              variant="default"
              size="lg"
              className="w-full text-lg py-6"
            >
              Show Full Explanation
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
