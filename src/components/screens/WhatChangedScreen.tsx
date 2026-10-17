import { useState, useEffect, useCallback } from "react";
import { Cpu, Brain, Network, MessageCircle, Lightbulb, BookOpen, CheckCircle2, GripVertical, Sparkles, X, Grape, FlaskConical, Wine, GraduationCap, Bot } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";

// Import era images
import eraRules from "@/assets/ai-era-rules.jpg";
import eraLearning from "@/assets/ai-era-learning.jpg";
import eraLanguage from "@/assets/ai-era-language.jpg";
import eraConversation from "@/assets/ai-era-conversation.jpg";
import eraThinking from "@/assets/ai-era-thinking.jpg";

// Import wine stage images
import wineGrapes from "@/assets/wine-stage-grapes.png";
import wineFermenting from "@/assets/wine-stage-fermenting.png";
import wineBarrel from "@/assets/wine-stage-barrel.png";
import wineAdult from "@/assets/wine-stage-adult.png";
import wineGraduate from "@/assets/wine-stage-graduate.png";

// ─── Wine Timeline (Solo Mode) ──────────────────────────────────────────────

interface WineStage {
  wineTitle: string;
  wineMetaphor: string;
  wineImage: string;
  wineIcon: typeof Grape;
  aiTitle: string;
  aiYear: string;
  aiExample: string;
  aiDescription: string;
  color: string;
}

const wineStages: WineStage[] = [
  {
    wineTitle: "Picking the Grapes",
    wineMetaphor: "Human does all the work — hand-selecting each one",
    wineImage: wineGrapes,
    wineIcon: Grape,
    aiTitle: "Expert Systems",
    aiYear: "1970s–80s",
    aiExample: "Spam filters, tax software",
    aiDescription: "Humans write IF-THEN rules. The computer just follows orders.",
    color: "text-muted-foreground",
  },
  {
    wineTitle: "The Crush",
    wineMetaphor: "Patterns emerge from raw material",
    wineImage: wineFermenting,
    wineIcon: FlaskConical,
    aiTitle: "Machine Learning",
    aiYear: "1990s–2010s",
    aiExample: "Netflix recommendations, credit scoring",
    aiDescription: "Feed it data, it finds patterns. No rules needed — just examples.",
    color: "text-primary",
  },
  {
    wineTitle: "Fermentation",
    wineMetaphor: "Layers of complexity develop on their own",
    wineImage: wineBarrel,
    wineIcon: Wine,
    aiTitle: "Deep Learning",
    aiYear: "2012–2020",
    aiExample: "Face ID, self-driving cars, voice assistants",
    aiDescription: "Neural networks with many layers. AI could finally 'see' and 'hear.'",
    color: "text-accent",
  },
  {
    wineTitle: "Barrel Aging",
    wineMetaphor: "Language gives it depth and character",
    wineImage: wineAdult,
    wineIcon: MessageCircle,
    aiTitle: "Large Language Models",
    aiYear: "2022–now",
    aiExample: "ChatGPT, Copilot, Claude",
    aiDescription: "Trained on trillions of words. Fluent — but fluent ≠ true.",
    color: "text-secondary",
  },
  {
    wineTitle: "The Finished Bottle?",
    wineMetaphor: "It looks complete… but who's really the winemaker?",
    wineImage: wineGraduate,
    wineIcon: Bot,
    aiTitle: "Agentic AI?",
    aiYear: "2024–?",
    aiExample: "AI coding assistants, autonomous research",
    aiDescription: "Plans steps, uses tools, checks its own work. Could it make decisions on its own?",
    color: "text-accent",
  },
];

const WineTimelineSolo = () => {
  const [revealedCount, setRevealedCount] = useState(0);
  const [showBigQuestion] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        if (revealedCount < wineStages.length) {
          e.preventDefault();
          e.stopImmediatePropagation();
          setRevealedCount((prev) => prev + 1);
        }
      }
    },
    [revealedCount]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
  }, [handleKeyDown]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-in p-4">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-primary font-semibold">The Story of AI</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            From Vine to Wine
          </h1>
          <p className="text-base text-muted-foreground">
            The evolution of AI, told through the art of winemaking
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-border/50 -translate-y-1/2 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {wineStages.map((stage, idx) => {
              const isRevealed = idx < revealedCount;
              const isLatest = idx === revealedCount - 1;
              const Icon = stage.wineIcon;

              return (
                <div
                  key={stage.aiTitle}
                  className={`relative transition-all duration-700 ${
                    isRevealed
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8 pointer-events-none"
                  }`}
                >
                  {/* Wine stage card */}
                  <div
                    className={`rounded-xl border-2 overflow-hidden transition-all duration-500 ${
                      isLatest
                        ? "border-primary/60 shadow-lg shadow-primary/10 scale-[1.02]"
                        : "border-border/50"
                    }`}
                  >
                    {/* Wine image */}
                    <div className="aspect-[4/3] relative bg-muted">
                      <img
                        src={stage.wineImage}
                        alt={stage.wineTitle}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4 text-white/90" />
                          <span className="text-white font-bold text-sm">{stage.wineTitle}</span>
                        </div>
                        <p className="text-white/70 text-xs italic">{stage.wineMetaphor}</p>
                      </div>
                    </div>

                    {/* AI era info */}
                    <div className="p-3 bg-card/90 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-sm ${stage.color}`}>{stage.aiTitle}</span>
                        <span className="text-xs text-muted-foreground font-mono">{stage.aiYear}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{stage.aiDescription}</p>
                      <p className="text-[10px] text-muted-foreground/70 italic">{stage.aiExample}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Placeholder dots for unrevealed */}
          {revealedCount === 0 && (
            <div className="flex justify-center py-16" />
          )}
        </div>


        {/* Summary after all revealed */}
        {revealedCount === wineStages.length && (
          <div className="text-center">
            <div className="bg-card/80 rounded-xl p-4 border border-border inline-block">
              <p className="text-lg font-bold text-foreground">
                From hand-picked rules to autonomous agents — in one lifetime.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Drag-and-Drop Game (Session Mode) ──────────────────────────────────────

interface AIEra {
  id: string;
  title: string;
  example: string;
  description: string;
  icon: typeof Cpu;
  color: string;
  bgColor: string;
}

interface AIExample {
  id: string;
  label: string;
  image: string;
  correctEra: string;
  funFact: string;
}

const eras: AIEra[] = [
  {
    id: "rules",
    title: "Expert Systems",
    example: "e.g., IF email contains 'FREE MONEY' THEN mark as spam",
    description: "Humans write IF-THEN rules. The computer just follows orders—no learning, just obedience to the programmer.",
    icon: Cpu,
    color: "text-muted-foreground",
    bgColor: "bg-muted/30 border-muted-foreground/40",
  },
  {
    id: "learning",
    title: "Machine Learning",
    example: "e.g., Netflix learns your taste from what you watch",
    description: "Feed it data, it finds patterns. Still narrow—each model does one task. No rules needed, just examples.",
    icon: Brain,
    color: "text-primary",
    bgColor: "bg-primary/20 border-primary/40",
  },
  {
    id: "deep",
    title: "Deep Learning",
    example: "e.g., Face ID recognizes you from 30,000 dots",
    description: "Neural networks with many layers. First time AI could 'see' images and 'hear' speech like humans do.",
    icon: Network,
    color: "text-accent",
    bgColor: "bg-accent/20 border-accent/40",
  },
  {
    id: "language",
    title: "Large Language Models",
    example: "e.g., ChatGPT reads your whole message before responding",
    description: "Transformers use 'attention' to understand context across entire documents. The breakthrough that made AI conversational.",
    icon: MessageCircle,
    color: "text-secondary",
    bgColor: "bg-secondary/20 border-secondary/40",
  },
  {
    id: "reasoning",
    title: "Agentic AI",
    example: "e.g., AI plans steps, uses tools, checks its own work",
    description: "Multi-step planning and chain-of-thought reasoning. But is it actually thinking, or simulating what thinking looks like?",
    icon: Lightbulb,
    color: "text-accent",
    bgColor: "bg-accent/20 border-accent/40",
  },
];

const examples: AIExample[] = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    image: eraConversation,
    correctEra: "language",
    funFact: "GPT-4 was trained on ~13 trillion tokens. That's roughly all of Wikipedia... 300 times over.",
  },
  {
    id: "faceid",
    label: "iPhone Face ID",
    image: eraLanguage,
    correctEra: "deep",
    funFact: "Face ID projects 30,000 invisible dots to map your face in 3D. Works in the dark!",
  },
  {
    id: "agents",
    label: "AI Coding Assistants",
    image: eraThinking,
    correctEra: "reasoning",
    funFact: "Tools like Cursor and Devin plan multi-step solutions, write code, test it, and fix errors—all autonomously.",
  },
  {
    id: "spam",
    label: "Email Spam Filter",
    image: eraRules,
    correctEra: "rules",
    funFact: "Early spam filters used simple keyword lists—'FREE MONEY' = spam. Spammers adapted with 'FR33 M0N3Y'.",
  },
  {
    id: "netflix",
    label: "Netflix Recommendations",
    image: eraLearning,
    correctEra: "learning",
    funFact: "Netflix's algorithm learns from 100+ million users. It knows you'll watch that show before you do.",
  },
];

const DragDropGame = () => {
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [draggedEra, setDraggedEra] = useState<string | null>(null);
  const [showBigQuestion, setShowBigQuestion] = useState(false);
  const [selectedEra, setSelectedEra] = useState<AIEra | null>(null);
  const { isPresenter, isSoloMode } = useSession();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresenter && !isSoloMode) return;
      if (e.key === "ArrowRight" || e.key === " ") {
        const placedCount = Object.keys(placements).length;
        if (placedCount === 0) {
          e.preventDefault();
          e.stopImmediatePropagation();
          const correctPlacements: Record<string, string> = {};
          examples.forEach(ex => {
            correctPlacements[ex.id] = ex.correctEra;
          });
          setPlacements(correctPlacements);
        } else if (placedCount === examples.length && !showBigQuestion) {
          e.preventDefault();
          e.stopImmediatePropagation();
          setShowBigQuestion(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
  }, [isPresenter, isSoloMode, placements, showBigQuestion]);

  const handleDragStart = (eraId: string) => {
    setDraggedEra(eraId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, exampleId: string) => {
    e.preventDefault();
    if (draggedEra) {
      const newPlacements = { ...placements };
      Object.keys(newPlacements).forEach(key => {
        if (newPlacements[key] === draggedEra) {
          delete newPlacements[key];
        }
      });
      newPlacements[exampleId] = draggedEra;
      setPlacements(newPlacements);
      setDraggedEra(null);
    }
  };

  const getPlacedEra = (exampleId: string) => {
    const eraId = placements[exampleId];
    return eraId ? eras.find(e => e.id === eraId) : null;
  };

  const isCorrect = (exampleId: string) => {
    const example = examples.find(e => e.id === exampleId);
    return example && placements[exampleId] === example.correctEra;
  };

  const unplacedEras = eras.filter(era => !Object.values(placements).includes(era.id));
  const allPlaced = Object.keys(placements).length === examples.length;
  const correctCount = examples.filter(ex => isCorrect(ex.id)).length;

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-in p-4">
      <div className="max-w-7xl mx-auto text-center space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-primary font-semibold">The Story of AI</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Match the Technology to the Era
          </h1>
          <p className="text-base text-muted-foreground">
            Drag each era label to its matching AI example
          </p>
        </div>

        {/* Draggable Era Labels */}
        {unplacedEras.length > 0 && (
          <div className="bg-card rounded-xl p-4 border border-secondary/30">
            <p className="text-sm text-secondary font-medium mb-3">Drag these eras:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {unplacedEras.map((era) => {
                const Icon = era.icon;
                return (
                  <div
                    key={era.id}
                    draggable
                    onDragStart={() => handleDragStart(era.id)}
                    onClick={() => setSelectedEra(era)}
                    className={`px-4 py-3 bg-secondary/20 border-2 border-secondary/50 rounded-lg cursor-grab active:cursor-grabbing flex items-center gap-2 hover:scale-105 hover:bg-secondary/30 transition-all shadow-md ${
                      draggedEra === era.id ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                    <GripVertical className="h-4 w-4 text-secondary/70" />
                    <Icon className="h-5 w-5 text-secondary" />
                    <span className="font-bold text-sm text-foreground">{era.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Era Info Popup */}
        {selectedEra && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEra(null)}>
            <div
              className="bg-card border-2 border-secondary/50 rounded-2xl p-6 max-w-md shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <selectedEra.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{selectedEra.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedEra(null)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </div>
              <p className="text-foreground/90 leading-relaxed mb-4">{selectedEra.description}</p>
              <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-3">
                <p className="text-sm text-secondary font-medium">{selectedEra.example}</p>
              </div>
            </div>
          </div>
        )}

        {/* Example Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {examples.map((example) => {
            const placedEra = getPlacedEra(example.id);
            const correct = isCorrect(example.id);
            const Icon = placedEra?.icon;

            return (
              <div
                key={example.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, example.id)}
                className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                  draggedEra ? 'ring-2 ring-accent/50 ring-offset-2 ring-offset-background' : ''
                } ${
                  placedEra
                    ? correct
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-orange-500/50 bg-orange-500/5'
                    : 'border-border bg-card/50'
                }`}
              >
                <div className="aspect-[4/3] relative">
                  <img
                    src={example.image}
                    alt={example.label}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-bold text-sm drop-shadow-lg">{example.label}</h3>
                  </div>
                </div>

                <div className={`p-3 min-h-[80px] ${placedEra ? placedEra.bgColor : 'bg-muted/20'}`}>
                  {placedEra ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className={`h-4 w-4 ${placedEra.color}`} />}
                        <span className={`font-bold text-sm ${placedEra.color}`}>{placedEra.title}</span>
                        {correct && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">{placedEra.example}</p>
                      {correct && (
                        <p className="text-xs text-foreground/80 mt-2 leading-relaxed">{example.funFact}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-xs text-muted-foreground italic">Drop era here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Results & Big Question */}
        {allPlaced && !showBigQuestion && (
          <div className="space-y-4">
            <div className="bg-card/80 rounded-xl p-4 border border-border inline-block">
              <p className="text-xl font-bold text-foreground">
                {correctCount} / {examples.length} correct!
              </p>
            </div>
            <button
              onClick={() => setShowBigQuestion(true)}
              className="px-8 py-3 bg-gradient-to-r from-accent to-primary text-white rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-pulse"
            >
              The Big Question
            </button>
          </div>
        )}

        {showBigQuestion && (
          <div className="animate-scale-in">
            <div className="bg-gradient-to-br from-accent/20 to-primary/20 border-2 border-accent/50 rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Sparkles className="h-8 w-8 text-accent animate-pulse" />
                <h3 className="text-2xl md:text-4xl font-bold text-foreground">The Big Question</h3>
                <Sparkles className="h-8 w-8 text-accent animate-pulse" />
              </div>
              <p className="text-xl md:text-2xl text-foreground leading-relaxed text-center">
                <strong className="text-accent text-2xl md:text-4xl">Does it actually think?</strong>
                <br />
                <span className="text-muted-foreground text-lg md:text-xl">
                  Or does it just predict what thinking <em>looks like</em>?
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Reset button for presenter */}
        {(isPresenter || isSoloMode) && Object.keys(placements).length > 0 && (
          <button
            onClick={() => {
              setPlacements({});
              setShowBigQuestion(false);
            }}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset Game
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────

export const WhatChangedScreen = () => {
  const { isSoloMode } = useSession();

  // Solo mode (no session) → wine timeline build
  // Session mode → drag-and-drop game
  if (isSoloMode) {
    return <WineTimelineSolo />;
  }

  return <DragDropGame />;
};
