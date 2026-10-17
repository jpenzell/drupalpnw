import { useState, useEffect, useCallback } from "react";
import { BookOpen, Check, Mail, Crown, MessageSquare, Brain, Users } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { usePoll } from "@/contexts/PollContext";
import { PollControls } from "@/components/PollControls";

const examples = [
  { icon: Mail, label: "Spam Filter", year: "1990s", id: "spam" },
  { icon: Crown, label: "Chess Computer", year: "1997", id: "chess" },
  { icon: MessageSquare, label: "Siri", year: "2011", id: "siri" },
  { icon: Brain, label: "ChatGPT", year: "2022", id: "chatgpt" },
];

export const WhichAreAIScreen = () => {
  const [revealed, setRevealed] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { session, isPresenter, isParticipant } = useSession();
  const { currentPoll, responses, myResponse, createPoll, submitResponse, getPollForSlide } = usePoll();

  // Initialize poll for this slide
  useEffect(() => {
    if (session) {
      getPollForSlide("P9");
    }
  }, [session, getPollForSlide]);

  // Auto-create poll for presenter if none exists
  useEffect(() => {
    if (session && isPresenter && !currentPoll) {
      createPoll("P9", "multiple_choice", { multi_select: true });
    }
  }, [session, isPresenter, currentPoll, createPoll]);

  // Restore participant's previous selection
  useEffect(() => {
    if (myResponse && myResponse.value) {
      const value = myResponse.value as { choices?: string[] };
      if (value.choices) {
        setSelectedItems(value.choices);
      }
    }
  }, [myResponse]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.key === " " || e.key === "ArrowRight") && !revealed && isPresenter) {
      e.preventDefault();
      e.stopImmediatePropagation();
      setRevealed(true);
    }
  }, [revealed, isPresenter]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
  }, [handleKeyDown]);

  const toggleItem = async (itemId: string) => {
    if (!currentPoll?.is_open || revealed) return;
    
    const newSelection = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId];
    
    setSelectedItems(newSelection);
    
    if (session) {
      await submitResponse({ choices: newSelection });
    }
  };

  // Calculate vote counts per item
  const getVoteCounts = () => {
    const counts: Record<string, number> = {};
    examples.forEach(ex => counts[ex.id] = 0);
    
    responses.forEach(response => {
      const value = response.value as { choices?: string[] };
      if (value.choices) {
        value.choices.forEach(choice => {
          if (counts[choice] !== undefined) {
            counts[choice]++;
          }
        });
      }
    });
    
    return counts;
  };

  const voteCounts = getVoteCounts();
  const totalResponses = responses.length;

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-in p-8">
      <div className="max-w-5xl mx-auto text-center space-y-6">
        {/* Story framing */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-primary font-semibold">The Story of AI</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Chapter 2: The Characters
          </h1>
          <p className="text-xl text-muted-foreground">
            {isParticipant && currentPoll?.is_open 
              ? "Tap the ones you think are AI"
              : "Which of these are part of the story?"}
          </p>
        </div>

        {/* Presenter poll controls */}
        {isPresenter && session && (
          <PollControls slideId="P9" pollType="multiple_choice" config={{ multi_select: true }} />
        )}

        {/* Options grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {examples.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = selectedItems.includes(item.id);
            const votePercent = totalResponses > 0 ? Math.round((voteCounts[item.id] / totalResponses) * 100) : 0;
            
            return (
              <div
                key={idx}
                onClick={() => (isParticipant || !session) && toggleItem(item.id)}
                className={`relative p-5 rounded-2xl border-2 transition-all duration-500 ${
                  revealed
                    ? "bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500"
                    : isSelected
                    ? "bg-primary/10 border-primary cursor-pointer"
                    : (isParticipant || !session) && currentPoll?.is_open
                    ? "bg-card border-border hover:border-primary/50 cursor-pointer"
                    : "bg-card border-border"
                }`}
              >
                {revealed && (
                  <div className="absolute -top-3 -right-3 bg-green-500 rounded-full p-1 animate-scale-in">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
                {isSelected && !revealed && (
                  <div className="absolute -top-3 -right-3 bg-primary rounded-full p-1 animate-scale-in">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <Icon className={`h-10 w-10 mx-auto mb-3 ${
                  revealed ? "text-green-600" : isSelected ? "text-primary" : "text-muted-foreground"
                }`} />
                <p className="text-base font-bold text-foreground">{item.label}</p>
                {revealed && (
                  <p className="text-sm text-muted-foreground mt-1 animate-fade-in">{item.year}</p>
                )}
                {/* Show vote counts for presenter before reveal */}
                {isPresenter && !revealed && totalResponses > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {voteCounts[item.id]} votes ({votePercent}%)
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Response counter for presenter */}
        {isPresenter && session && !revealed && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{totalResponses} response{totalResponses !== 1 ? "s" : ""}</span>
          </div>
        )}

        {/* Participant waiting state */}
        {isParticipant && !currentPoll?.is_open && !revealed && (
          <div className="text-muted-foreground animate-pulse">
            Waiting for presenter...
          </div>
        )}

        {/* Reveal button / Answer */}
        {!revealed ? (
          (isPresenter || !session) && (
            <button
              onClick={() => setRevealed(true)}
              className="mt-6 px-12 py-5 bg-gradient-to-r from-primary to-accent text-white rounded-2xl text-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Reveal
            </button>
          )
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-gradient-to-br from-accent/20 to-primary/20 border-2 border-accent/40 rounded-2xl p-6">
              <p className="text-3xl md:text-4xl font-black text-foreground mb-2">
                All of them!
              </p>
              <p className="text-lg text-muted-foreground">
                Same story, <strong className="text-primary">different chapters</strong>
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 text-base">
              <span className="px-4 py-2 bg-muted rounded-lg">
                <strong className="text-destructive">Rules</strong> → "If this, then that"
              </span>
              <span className="px-4 py-2 bg-muted rounded-lg">
                <strong className="text-primary">Learning</strong> → "Find the pattern"
              </span>
              <span className="px-4 py-2 bg-muted rounded-lg">
                <strong className="text-accent">Language</strong> → "Predict the next word"
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
