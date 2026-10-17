import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Users, Check } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { usePoll } from "@/contexts/PollContext";
import { PollControls } from "@/components/PollControls";
import { LiveSliderVisualization } from "@/components/LiveSliderVisualization";

const SLIDE_ID = "P17";
const probabilityWords = ["always", "likely", "serious possibility", "rarely"];

export const LanguageInteractiveScreen = () => {
  const [selectedWord, setSelectedWord] = useState("always");
  const [currentValue, setCurrentValue] = useState([50]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { session, isPresenter, isParticipant, isSoloMode } = useSession();
  const { currentPoll, submitResponse, getPollForSlide, myResponse } = usePoll();

  const canControl = isPresenter || isSoloMode;

  // Keyboard navigation: Space/ArrowRight advances through words
  useEffect(() => {
    if (!canControl) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowRight") {
        setSelectedWord(prev => {
          const currentIndex = probabilityWords.indexOf(prev);
          // If at the last word, let the event fall through to advance the slide
          if (currentIndex >= probabilityWords.length - 1) {
            return prev;
          }
          e.preventDefault();
          e.stopImmediatePropagation();
          return probabilityWords[currentIndex + 1];
        });
        setHasSubmitted(false);
      } else if (e.key === "ArrowLeft") {
        setSelectedWord(prev => {
          const currentIndex = probabilityWords.indexOf(prev);
          // If at the first word, let the event fall through to go to previous slide
          if (currentIndex <= 0) {
            return prev;
          }
          e.preventDefault();
          e.stopImmediatePropagation();
          return probabilityWords[currentIndex - 1];
        });
        setHasSubmitted(false);
      }
    };

    window.addEventListener("keydown", handleKey, { capture: true });
    return () => window.removeEventListener("keydown", handleKey, { capture: true } as any);
  }, [canControl]);

  // Load poll when screen mounts and session exists
  useEffect(() => {
    if (session) {
      getPollForSlide(SLIDE_ID);
    }
  }, [session, getPollForSlide]);

  // Check if already submitted
  useEffect(() => {
    if (myResponse) {
      const val = myResponse.value as Record<string, unknown>;
      if (typeof val?.slider === "number") {
        setCurrentValue([val.slider]);
        setHasSubmitted(true);
      }
    }
  }, [myResponse]);

  const handleSubmit = async () => {
    if (!currentPoll?.is_open) return;
    
    const success = await submitResponse({ 
      slider: currentValue[0],
      word: selectedWord 
    });
    
    if (success) {
      setHasSubmitted(true);
      // Haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const handleWordChange = (word: string) => {
    setSelectedWord(word);
    setHasSubmitted(false);
  };

  // Participant view - simplified for mobile
  if (isParticipant && session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 animate-slide-in">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              If something is a "<span className="text-primary">{selectedWord}</span>"...
            </h1>
            <p className="text-muted-foreground">
              What's the chance it actually happens?
            </p>
          </div>

          {currentPoll?.is_open ? (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-6xl font-bold text-primary mb-4">
                  {currentValue[0]}%
                </p>
              </div>
              
              <Slider
                value={currentValue}
                onValueChange={setCurrentValue}
                max={100}
                step={5}
                className="py-4"
              />
              
              <Button
                onClick={handleSubmit}
                size="lg"
                className="w-full h-14 text-lg gap-2"
                disabled={hasSubmitted}
              >
                {hasSubmitted ? (
                  <>
                    <Check className="h-5 w-5" />
                    Submitted!
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5" />
                    Submit Response
                  </>
                )}
              </Button>
              
              {hasSubmitted && (
                <p className="text-center text-sm text-muted-foreground">
                  Your answer has been recorded
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                Waiting for presenter to open the poll...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Presenter view
  return (
    <div className="flex-1 flex flex-col animate-slide-in">
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
          If something is a "<span className="text-primary">{selectedWord}</span>"...
        </h1>
        <p className="text-xl text-muted-foreground font-light">
          What's the chance it actually happens?
        </p>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col justify-center gap-6">
        {/* Word Selection */}
        <div className="flex flex-wrap justify-center gap-3">
          {probabilityWords.map((word) => (
            <Button
              key={word}
              onClick={() => handleWordChange(word)}
              variant={selectedWord === word ? "default" : "outline"}
              size="lg"
              className="text-lg px-6"
            >
              {word}
            </Button>
          ))}
        </div>

        {/* Poll Controls - only show when session is active */}
        {session && isPresenter && (
          <div className="flex justify-center">
            <PollControls 
              slideId={SLIDE_ID} 
              pollType="slider" 
              config={{ word: selectedWord }}
            />
          </div>
        )}

        {/* Live Responses Visualization */}
        {session && currentPoll && (
          <div className="bg-accent/10 border-2 border-accent/20 rounded-2xl p-6">
            <LiveSliderVisualization />
          </div>
        )}

        {/* Fallback for no session - original local-only UI */}
        {!session && (
          <div className="bg-accent/10 border-2 border-accent/20 rounded-2xl p-8">
            <div className="text-center mb-6">
              <p className="text-7xl md:text-8xl font-bold text-primary">
                {currentValue[0]}%
              </p>
            </div>
            <Slider
              value={currentValue}
              onValueChange={setCurrentValue}
              max={100}
              step={5}
              className="mb-6"
            />
          </div>
        )}
      </div>
    </div>
  );
};
