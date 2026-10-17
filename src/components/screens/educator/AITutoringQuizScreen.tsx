import { useState } from "react";
import { GraduationCap, Check, X, HelpCircle, Brain, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

const quizData = {
  setup: "Harvard researchers compared learning outcomes when physics students used an AI tutor vs. attending an active learning classroom with human instructors.",
  question: "Students using the AI tutor showed learning gains that were...",
  source: "Nature Scientific Reports, 2025",
  options: [
    { id: "a", text: "About the same as the classroom", isCorrect: false },
    { id: "b", text: "20% higher than the classroom", isCorrect: false },
    { id: "c", text: "More than double the classroom", isCorrect: true },
    { id: "d", text: "Lower than the classroom", isCorrect: false },
  ] as QuizOption[],
  reveal: {
    stat: "2×+",
    label: "higher learning gains",
    insight: "AI tutoring achieved 0.73-1.3 standard deviations improvement—approaching Bloom's '2 Sigma' ideal. Students also completed lessons 20% faster AND reported feeling more engaged.",
    twist: "But here's the key: the AI tutor was specifically designed with pedagogical best practices—it wasn't just ChatGPT answering questions.",
    takeaway: "The tool matters less than the design. A well-designed AI tutor can outperform even 'active learning' classrooms—but only when built with learning science in mind.",
  },
};

export const AITutoringQuizScreen = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (optionId: string) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
  };

  const handleReveal = () => {
    setShowResult(true);
  };

  const selectedOption = quizData.options.find((o) => o.id === selectedAnswer);
  const correctOption = quizData.options.find((o) => o.isCorrect);

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-3">
          <GraduationCap className="w-4 h-4" />
          <span className="text-sm font-medium">Harvard RCT Study</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          The AI Tutoring Experiment
        </h1>
        <p className="text-muted-foreground">{quizData.source}</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Question */}
        <div className="flex flex-col">
          <Card className="flex-1">
            <CardContent className="p-6 flex flex-col h-full">
              <p className="text-lg text-muted-foreground mb-6">{quizData.setup}</p>
              
              <h2 className="text-xl font-semibold text-foreground mb-6">
                {quizData.question}
              </h2>

              <div className="space-y-3 flex-1">
                {quizData.options.map((option) => {
                  const isSelected = selectedAnswer === option.id;
                  const showCorrect = showResult && option.isCorrect;
                  const showIncorrect = showResult && isSelected && !option.isCorrect;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option.id)}
                      disabled={showResult}
                      className={cn(
                        "w-full p-4 text-left rounded-lg border-2 transition-all",
                        "hover:border-primary/50",
                        isSelected && !showResult && "border-primary bg-primary/5",
                        showCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                        showIncorrect && "border-red-500 bg-red-50 dark:bg-red-950",
                        !isSelected && !showCorrect && !showIncorrect && "border-border"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {option.id.toUpperCase()}
                        </span>
                        <span className="flex-1">{option.text}</span>
                        {showCorrect && <Check className="w-5 h-5 text-green-600" />}
                        {showIncorrect && <X className="w-5 h-5 text-red-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedAnswer && !showResult && (
                <Button onClick={handleReveal} className="mt-6" size="lg">
                  Reveal Answer
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Result/Insight */}
        <div className="flex flex-col">
          {showResult ? (
            <Card className="flex-1 border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-green-600">Correct Answer</Badge>
                  <span className="text-sm text-muted-foreground">{correctOption?.text}</span>
                </div>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-5xl font-bold text-primary">{quizData.reveal.stat}</span>
                  <span className="text-lg text-muted-foreground">{quizData.reveal.label}</span>
                </div>

                <p className="text-foreground mb-4">{quizData.reveal.insight}</p>

                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 mb-4">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-900 dark:text-amber-100">
                      <span className="font-semibold">The twist: </span>
                      {quizData.reveal.twist}
                    </p>
                  </div>
                </div>

                <div className="mt-auto p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-2">
                    <Brain className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">Key insight: </span>
                      {quizData.reveal.takeaway}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex-1 border-dashed border-2">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                <HelpCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Select an answer and click "Reveal" to see the research findings
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
