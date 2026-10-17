import { useState, useEffect } from "react";
import { Dice1, Send, CheckCircle, Users } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { usePoll } from "@/contexts/PollContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Persist submitted numbers for comparison later
let persistedHumanNumbers: number[] = [];

export const getHumanRandomNumbers = () => persistedHumanNumbers;

export const resetHumanRandomNumbers = () => {
  persistedHumanNumbers = [];
};

export const AudienceRandomNumberScreen = () => {
  const { isPresenter, isSoloMode, participantId } = useSession();
  const { currentPoll, responses, myResponse, createPoll, openPoll, closePoll, getPollForSlide, submitResponse } = usePoll();

  const [myNumber, setMyNumber] = useState("");
  const [presenterNumber, setPresenterNumber] = useState("");

  // Initialize poll on mount
  useEffect(() => {
    getPollForSlide("audience-random-number");
  }, [getPollForSlide]);

  // Auto-create/open poll for presenter
  useEffect(() => {
    if ((isPresenter || isSoloMode) && !currentPoll) {
      createPoll("audience-random-number", "text", {});
    } else if ((isPresenter || isSoloMode) && currentPoll && !currentPoll.is_open) {
      openPoll(currentPoll.id);
    }
  }, [isPresenter, isSoloMode, currentPoll, createPoll, openPoll]);

  // Collect human numbers for later comparison
  const humanNumbers = responses
    .map(r => (r.value as any)?.number)
    .filter((n): n is number => typeof n === "number" && n >= 1 && n <= 100);

  // Persist for later slides
  useEffect(() => {
    persistedHumanNumbers = humanNumbers;
  }, [humanNumbers]);

  const isPollOpen = currentPoll?.is_open;
  const hasSubmitted = !!myResponse;

  // Participant submit
  const handleSubmit = async () => {
    const num = parseInt(myNumber);
    if (isNaN(num) || num < 1 || num > 100 || !currentPoll?.is_open) return;

    await submitResponse({ number: num });
  };

  // Presenter manual add
  const handlePresenterAdd = async () => {
    const num = parseInt(presenterNumber);
    if (isNaN(num) || num < 1 || num > 100 || !currentPoll) return;

    const manualId = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    await supabase.from("responses").insert({
      poll_id: currentPoll.id,
      participant_id: manualId,
      value: { number: num }
    });

    setPresenterNumber("");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-in px-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* Header */}
        <div className="space-y-4">
          <Dice1 className="h-16 w-16 text-primary mx-auto" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Choose a Number at Random
          </h1>
          <p className="text-xl text-muted-foreground">
            Pick any number between 1 and 100
          </p>
        </div>

        {/* Input Section - Everyone sees this */}
        {!hasSubmitted && isPollOpen && (
          <div className="bg-primary/10 border-2 border-primary/30 rounded-2xl p-8 space-y-4">
            <p className="text-lg text-foreground font-medium">
              What's your random number?
            </p>
            <div className="flex gap-3 justify-center items-center">
              <Input
                type="number"
                value={myNumber}
                onChange={(e) => setMyNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="1-100"
                className="w-32 text-center text-2xl font-bold h-14"
                min={1}
                max={100}
                autoFocus
              />
              <Button 
                onClick={handleSubmit} 
                disabled={!myNumber} 
                size="lg"
                className="h-14 px-6"
              >
                <Send className="h-5 w-5 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        )}

        {/* Submitted State */}
        {hasSubmitted && (
          <div className="bg-green-500/10 border-2 border-green-500/30 rounded-2xl p-8 space-y-2">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <p className="text-2xl font-bold text-green-500">
              {(myResponse?.value as any)?.number}
            </p>
            <p className="text-muted-foreground">Your number is recorded</p>
          </div>
        )}

        {/* Response Counter */}
        {humanNumbers.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span className="text-lg">{humanNumbers.length} responses collected</span>
          </div>
        )}

        {/* Presenter Controls */}
        {(isPresenter || isSoloMode) && (
          <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {isPollOpen ? (
                <>
                  <span className="text-sm text-muted-foreground">Poll is open</span>
                  <Button 
                    onClick={() => currentPoll && closePoll(currentPoll.id)} 
                    variant="secondary" 
                    size="sm"
                  >
                    Close Poll
                  </Button>
                </>
              ) : currentPoll && (
                <Button 
                  onClick={() => openPoll(currentPoll.id)} 
                  variant="secondary" 
                  size="sm"
                >
                  Reopen Poll
                </Button>
              )}
              
              {currentPoll && (
                <>
                  <div className="w-px h-6 bg-border" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Add manually:</span>
                    <Input
                      type="number"
                      value={presenterNumber}
                      onChange={(e) => setPresenterNumber(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePresenterAdd()}
                      placeholder="1-100"
                      className="w-20 text-center text-sm h-8"
                      min={1}
                      max={100}
                    />
                    <Button 
                      onClick={handlePresenterAdd} 
                      disabled={!presenterNumber} 
                      size="sm" 
                      variant="outline" 
                      className="h-8 px-2"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
