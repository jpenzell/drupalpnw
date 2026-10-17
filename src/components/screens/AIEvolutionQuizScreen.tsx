import { useState, useEffect, useCallback } from "react";
import { Trophy, ArrowRight, CheckCircle, XCircle, Sparkles, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";
import { usePoll } from "@/contexts/PollContext";
import { supabase } from "@/integrations/supabase/client";

// Import era images as fallbacks
import eraRules from "@/assets/ai-era-rules.jpg";
import eraLearning from "@/assets/ai-era-learning.jpg";
import eraThinking from "@/assets/ai-era-thinking.jpg";
import eraLanguage from "@/assets/ai-era-language.jpg";
import eraConversation from "@/assets/ai-era-conversation.jpg";

interface AIEvolutionQuizScreenProps {
  onComplete?: () => void;
}

type EraQuestion = {
  id: string;
  eraKey: string; // Key for storage lookup
  era: string;
  years: string;
  fallbackImage: string;
  correctTerm: string;
  options: string[];
  description: string;
  example: string;
};

const eraQuestions: EraQuestion[] = [
  {
    id: "era-rules",
    eraKey: "rules",
    era: "1950s–1980s",
    years: "The Symbolic Era",
    fallbackImage: eraRules,
    correctTerm: "Expert Systems",
    options: ["Expert Systems", "Machine Learning", "Neural Networks", "Deep Learning"],
    description: "Hand-coded IF-THEN rules. Humans wrote every decision path.",
    example: "MYCIN (1976) diagnosed infections using 600 hand-written rules",
  },
  {
    id: "era-learning",
    eraKey: "learning",
    era: "1980s–2000s",
    years: "The Statistical Era",
    fallbackImage: eraLearning,
    correctTerm: "Machine Learning",
    options: ["Expert Systems", "Machine Learning", "Transformers", "Agentic AI"],
    description: "Algorithms that learn patterns from data. No explicit programming.",
    example: "Spam filters learning from millions of emails",
  },
  {
    id: "era-thinking",
    eraKey: "thinking",
    era: "2010s",
    years: "The Deep Learning Era",
    fallbackImage: eraThinking,
    correctTerm: "Neural Networks",
    options: ["Expert Systems", "Machine Learning", "Neural Networks", "Large Language Models"],
    description: "Layered networks inspired by the brain. Learns hierarchical features.",
    example: "ImageNet 2012 - AI beats humans at image recognition",
  },
  {
    id: "era-language",
    eraKey: "language",
    era: "2017–2022",
    years: "The Language Era",
    fallbackImage: eraLanguage,
    correctTerm: "Transformers / LLMs",
    options: ["Neural Networks", "Transformers / LLMs", "Agentic AI", "Symbolic AI"],
    description: "Attention mechanisms that understand context. Trained on internet-scale text.",
    example: "GPT-3, BERT, ChatGPT - predicting the next word",
  },
  {
    id: "era-conversation",
    eraKey: "conversation",
    era: "2023+",
    years: "The Agentic Era",
    fallbackImage: eraConversation,
    correctTerm: "Agentic AI",
    options: ["Machine Learning", "Deep Learning", "Transformers / LLMs", "Agentic AI"],
    description: "AI that takes actions, uses tools, and works autonomously.",
    example: "AI assistants that browse, code, and complete multi-step tasks",
  },
];

export const AIEvolutionQuizScreen = ({ onComplete }: AIEvolutionQuizScreenProps) => {
  const { isPresenter } = useSession();
  const { currentPoll, responses, createPoll, submitResponse, myResponse } = usePoll();
  
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [audienceAnswers, setAudienceAnswers] = useState<Record<string, number>>({});
  const [storageImages, setStorageImages] = useState<Record<string, string>>({});

  const question = eraQuestions[currentQ];
  const correctIndex = question.options.indexOf(question.correctTerm);

  // Get image URL - check storage first, fallback to local asset
  const getImageUrl = (q: EraQuestion) => {
    return storageImages[q.eraKey] || q.fallbackImage;
  };

  // Check for regenerated images in storage
  useEffect(() => {
    const checkStorageImages = async () => {
      const imageMap: Record<string, string> = {};
      for (const q of eraQuestions) {
        const { data } = supabase.storage
          .from("era-images")
          .getPublicUrl(`ai-era-${q.eraKey}.png`);
        
        // Check if the image exists by attempting to fetch it
        try {
          const response = await fetch(data.publicUrl, { method: "HEAD" });
          if (response.ok) {
            imageMap[q.eraKey] = `${data.publicUrl}?t=${Date.now()}`;
          }
        } catch {
          // Image doesn't exist in storage, will use fallback
        }
      }
      setStorageImages(imageMap);
    };
    checkStorageImages();
  }, []);

  // Initialize poll for current question
  useEffect(() => {
    if (isPresenter) {
      createPoll(`evolution-${question.id}`, "multiple_choice", {
        options: question.options,
      });
    }
  }, [currentQ, isPresenter, createPoll, question.id, question.options]);

  // Track audience responses
  useEffect(() => {
    if (responses.length > 0) {
      const counts: Record<string, number> = {};
      question.options.forEach((opt) => (counts[opt] = 0));
      responses.forEach((r) => {
        const val = (r.value as { answer?: string })?.answer;
        if (val && counts[val] !== undefined) {
          counts[val]++;
        }
      });
      setAudienceAnswers(counts);
    }
  }, [responses, question.options]);

  const handleSelect = (index: number) => {
    if (!revealed) {
      setSelected(index);
      // Submit to poll if participant
      if (!isPresenter && currentPoll?.is_open) {
        submitResponse({ answer: question.options[index] });
      }
    }
  };

  const handleReveal = useCallback(() => {
    if (selected !== null && !revealed) {
      setRevealed(true);
      if (selected === correctIndex) {
        setScore((s) => s + 1);
      }
    }
  }, [selected, revealed, correctIndex]);

  const handleNext = useCallback(() => {
    if (currentQ < eraQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setRevealed(false);
      setAudienceAnswers({});
    } else {
      onComplete?.();
    }
  }, [currentQ, onComplete]);

  const advance = useCallback(() => {
    if (!revealed && selected !== null) {
      handleReveal();
    } else if (revealed) {
      handleNext();
    }
  }, [revealed, selected, handleReveal, handleNext]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= eraQuestions.length) {
      onComplete?.();
    } else if (index >= 0) {
      setCurrentQ(index);
      setSelected(null);
      setRevealed(false);
      setAudienceAnswers({});
    }
  }, [onComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        goToQuestion(currentQ + 1);
      } else if (e.key === "ArrowLeft") {
        if (currentQ > 0) {
          e.preventDefault();
          e.stopPropagation();
          goToQuestion(currentQ - 1);
        }
      } else if (e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        advance();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [advance, currentQ, goToQuestion]);

  const totalResponses = Object.values(audienceAnswers).reduce((a, b) => a + b, 0);

  // Participant view - simpler
  if (!isPresenter) {
    const hasAnswered = myResponse !== null;
    
    return (
      <div className="h-full flex flex-col p-4 animate-slide-in">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-primary font-semibold">Era {currentQ + 1} of {eraQuestions.length}</span>
          </div>
        </div>

        {/* Era Image */}
        <div className="relative rounded-xl overflow-hidden mb-4 aspect-video">
          <img src={getImageUrl(question)} alt={question.era} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-white text-2xl font-bold">{question.era}</p>
            <p className="text-white/70 text-sm">{question.years}</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-foreground mb-4">
          What type of AI is this?
        </h2>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3 flex-1">
          {question.options.map((option, idx) => {
            const isSelected = selected === idx || (myResponse?.value as { answer?: string })?.answer === option;
            
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={hasAnswered}
                className={`p-4 text-left rounded-xl border-2 transition-all ${
                  isSelected
                    ? "bg-primary/20 border-primary"
                    : "bg-card border-border hover:border-primary/50"
                } ${hasAnswered ? "opacity-60" : ""}`}
              >
                <span className="font-semibold text-foreground">{option}</span>
              </button>
            );
          })}
        </div>

        {hasAnswered && (
          <div className="mt-4 text-center text-muted-foreground">
            <CheckCircle className="h-5 w-5 inline mr-2 text-green-500" />
            Answer submitted! Waiting for reveal...
          </div>
        )}
      </div>
    );
  }

  // Presenter view
  return (
    <div className="h-full flex flex-col animate-slide-in p-6">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-full">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span className="text-purple-600 font-bold">Match the Era</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/30 rounded-full">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="text-yellow-600 font-bold">Score: {score}/{eraQuestions.length}</span>
          </div>
          {totalResponses > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 border-2 border-secondary/30 rounded-full">
              <Users className="h-5 w-5 text-secondary" />
              <span className="text-secondary font-bold">{totalResponses} responses</span>
            </div>
          )}
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {eraQuestions.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-all ${
                idx < currentQ ? "bg-green-500" :
                idx === currentQ ? "bg-primary w-8" :
                "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main content - Image + Options side by side */}
      <div className="flex-1 flex gap-6 max-w-6xl mx-auto w-full">
        {/* Era Image */}
        <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src={getImageUrl(question)} 
            alt={question.era} 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
            <p className="text-white text-4xl font-bold">{question.era}</p>
            <p className="text-white/70 text-lg">{question.years}</p>
          </div>
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full">
            <span className="text-white text-sm font-semibold">Era {currentQ + 1} of {eraQuestions.length}</span>
          </div>
        </div>

        {/* Options Panel */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
            What type of AI defined this era?
          </h2>

          <div className="grid grid-cols-1 gap-3 flex-1">
            {question.options.map((option, idx) => {
              const isSelected = selected === idx;
              const isCorrect = idx === correctIndex;
              const audienceCount = audienceAnswers[option] || 0;
              const audiencePercent = totalResponses > 0 ? Math.round((audienceCount / totalResponses) * 100) : 0;
              
              let classes = "p-4 text-left transition-all border-2 rounded-xl cursor-pointer hover:shadow-lg relative overflow-hidden ";
              
              if (revealed && isCorrect) {
                classes += "bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500 ring-2 ring-green-500/30";
              } else if (revealed && isSelected && !isCorrect) {
                classes += "bg-gradient-to-br from-red-500/20 to-red-500/5 border-red-500 ring-2 ring-red-500/30";
              } else if (isSelected) {
                classes += "bg-gradient-to-br from-primary/20 to-primary/5 border-primary ring-2 ring-primary/30";
              } else {
                classes += "bg-card border-border hover:border-primary/50";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={classes}
                  disabled={revealed}
                >
                  {/* Audience response bar */}
                  {totalResponses > 0 && (
                    <div 
                      className={`absolute inset-y-0 left-0 ${
                        revealed && isCorrect ? "bg-green-500/20" : "bg-secondary/10"
                      } transition-all`}
                      style={{ width: `${audiencePercent}%` }}
                    />
                  )}
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      revealed && isCorrect ? "bg-green-500 text-white" :
                      revealed && isSelected && !isCorrect ? "bg-red-500 text-white" :
                      isSelected ? "bg-primary text-white" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-lg font-semibold text-foreground flex-1">{option}</span>
                    
                    {totalResponses > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {audiencePercent}%
                      </span>
                    )}
                    
                    {revealed && isCorrect && <CheckCircle className="h-6 w-6 text-green-500" />}
                    {revealed && isSelected && !isCorrect && <XCircle className="h-6 w-6 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Reveal info */}
          {revealed && (
            <div className="mt-4 bg-gradient-to-br from-accent/10 to-yellow-500/10 border-2 border-accent/30 rounded-xl p-4 animate-fade-in">
              <p className="font-bold text-foreground text-lg mb-1">{question.correctTerm}</p>
              <p className="text-muted-foreground mb-2">{question.description}</p>
              <p className="text-sm text-accent">📌 {question.example}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-4 mt-4">
            {!revealed ? (
              <Button 
                onClick={handleReveal} 
                size="lg" 
                className="px-8"
                disabled={selected === null}
              >
                Reveal Answer
              </Button>
            ) : (
              <Button onClick={handleNext} size="lg" className="px-8 gap-2">
                {currentQ < eraQuestions.length - 1 ? "Next Era" : "Complete"}
                <ArrowRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
