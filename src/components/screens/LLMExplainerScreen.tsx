import { useState, useEffect, useCallback } from "react";
import { Brain, Sparkles, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface WordPrediction {
  word: string;
  probability: number;
  isChosen: boolean;
}

interface StepData {
  context: string;
  predictions: WordPrediction[];
  chosenWord: string;
}

const storySteps: StepData[] = [
  {
    context: "The",
    predictions: [
      { word: "sun", probability: 32, isChosen: true },
      { word: "old", probability: 18, isChosen: false },
      { word: "small", probability: 15, isChosen: false },
      { word: "dark", probability: 12, isChosen: false },
    ],
    chosenWord: "sun",
  },
  {
    context: "The sun",
    predictions: [
      { word: "set", probability: 28, isChosen: true },
      { word: "rose", probability: 24, isChosen: false },
      { word: "shone", probability: 19, isChosen: false },
      { word: "blazed", probability: 11, isChosen: false },
    ],
    chosenWord: "set",
  },
  {
    context: "The sun set",
    predictions: [
      { word: "over", probability: 41, isChosen: true },
      { word: "behind", probability: 22, isChosen: false },
      { word: "slowly", probability: 14, isChosen: false },
      { word: "on", probability: 9, isChosen: false },
    ],
    chosenWord: "over",
  },
  {
    context: "The sun set over",
    predictions: [
      { word: "the", probability: 52, isChosen: true },
      { word: "rolling", probability: 18, isChosen: false },
      { word: "distant", probability: 12, isChosen: false },
      { word: "golden", probability: 8, isChosen: false },
    ],
    chosenWord: "the",
  },
  {
    context: "The sun set over the",
    predictions: [
      { word: "vineyard", probability: 35, isChosen: true },
      { word: "hills", probability: 22, isChosen: false },
      { word: "horizon", probability: 18, isChosen: false },
      { word: "valley", probability: 14, isChosen: false },
    ],
    chosenWord: "vineyard",
  },
];

const AUTO_ADVANCE_DELAY = 2500; // 2.5 seconds per step
const PAUSE_AT_END_DELAY = 3500; // 3.5 seconds pause at end before looping

export const LLMExplainerScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const step = storySteps[currentStep];
  const builtSentence = storySteps
    .slice(0, currentStep + 1)
    .map((s) => s.chosenWord)
    .join(" ");

  // Auto-advance logic
  useEffect(() => {
    if (isPaused) return;

    const delay = currentStep === storySteps.length - 1 ? PAUSE_AT_END_DELAY : AUTO_ADVANCE_DELAY;
    
    const timer = setTimeout(() => {
      setIsAnimating(true);
      setTimeout(() => {
        if (currentStep >= storySteps.length - 1) {
          setCurrentStep(0); // Loop back to start
        } else {
          setCurrentStep((prev) => prev + 1);
        }
        setIsAnimating(false);
      }, 300);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentStep, isPaused]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Keyboard control for pause/play
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePause]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
      <div className="w-[1500px] max-w-full mx-auto px-8 space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">How AI Writes</span>
          </div>
          <h1 className="slide-subtitle font-bold text-foreground">
            This is Exactly How <span className="text-primary">"Generative AI"</span> Works
          </h1>
          <p className="slide-caption text-muted-foreground w-[1100px] max-w-full mx-auto">
            Large Language Models predict the <strong>next word</strong> based on probabilities — 
            one word at a time, just like you saw in the story exercise.
          </p>
        </div>

        {/* Main Visualization */}
        <div className="bg-card border-2 border-border rounded-3xl p-8 shadow-lg relative">
          {/* Auto-play indicator */}
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePause}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4" />
                  <span className="text-xs">Paused</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  <span className="text-xs">Auto-playing</span>
                </>
              )}
            </Button>
          </div>

          {/* Current Context */}
          <div className="mb-5">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Context so far:
            </div>
            <div className="slide-body-lg font-semibold text-foreground bg-muted/50 rounded-xl p-3 min-h-[52px] flex items-center">
              <span>{step.context}</span>
              <span className="ml-2 w-3 h-8 bg-primary animate-pulse rounded" />
            </div>
          </div>

          {/* Prediction Visualization */}
          <div className="mb-4">
            <div className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI calculates probability for each possible next word:
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {step.predictions.map((pred) => (
                <div
                  key={pred.word}
                  className={`relative rounded-xl p-4 border-2 transition-all duration-300 ${
                    pred.isChosen
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  } ${isAnimating && pred.isChosen ? "animate-scale-in" : ""}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="flex items-center gap-3 min-w-0">
                      <span
                        className={`slide-caption font-bold truncate ${ pred.isChosen ? "text-primary" : "text-foreground" }`}
                      >
                        "{pred.word}"
                      </span>
                      {pred.isChosen && (
                        <span className="shrink-0 whitespace-nowrap bg-primary text-primary-foreground text-xs font-bold tracking-wide px-3 py-1 rounded-full">
                          CHOSEN
                        </span>
                      )}
                    </span>
                    <span
                      className={`slide-caption font-semibold ${ pred.isChosen ? "text-primary" : "text-muted-foreground" }`}
                    >
                      {pred.probability}%
                    </span>
                  </div>
                  <Progress
                    value={pred.probability}
                    className={`h-3 ${pred.isChosen ? "[&>div]:bg-primary" : "[&>div]:bg-muted-foreground/40"}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Built Sentence */}
          <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4">
            <div className="text-sm font-medium text-secondary mb-2">
              Generated text:
            </div>
            <div className="slide-caption font-medium text-foreground">
              "The {builtSentence}..."
            </div>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-4 -mt-1">
          <div className="flex items-center gap-2 px-4">
            {storySteps.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? "bg-primary scale-125"
                    : idx < currentStep
                    ? "bg-primary/40"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
