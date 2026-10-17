import { useState, useEffect, useCallback, DragEvent } from "react";
import { CheckCircle2, XCircle, Sparkles, GripVertical } from "lucide-react";

interface Match {
  stat: string;
  label: string;
}

interface LabelItem {
  id: string;
  text: string;
  subtitle: string;
  correctStat: string;
}

const stats = [
  { id: "50", value: "+50%", color: "primary" },
  { id: "35", value: "+35%", color: "secondary" },
  { id: "26", value: "+26%", color: "accent" },
  { id: "0", value: "0%", color: "destructive" },
];

const labels = [
  { id: "optimize", text: "AI optimized next actions", subtitle: "(prioritized to-dos & follow-ups)", correctStat: "50" },
  { id: "insights", text: "AI guided deal strategy", subtitle: "(surfaced key moments from conversations)", correctStat: "35" },
  { id: "questions", text: "AI informed the deal", subtitle: "(\"Ask Anything\" on deals & accounts)", correctStat: "26" },
  { id: "emails", text: "AI wrote the emails", subtitle: "(saved ~6 hrs/week per rep)", correctStat: "0" },
];

export const GongLabsStudyScreen = () => {
  const [stage, setStage] = useState(1);
  const [matches, setMatches] = useState<Match[]>([]);
  const [shuffledLabels, setShuffledLabels] = useState<LabelItem[]>(labels);
  const [draggedStat, setDraggedStat] = useState<string | null>(null);
  const [dragOverLabel, setDragOverLabel] = useState<string | null>(null);
  const maxStage = 2;

  useEffect(() => {
    setShuffledLabels([...labels].sort(() => Math.random() - 0.5));
  }, []);

  const handleAdvance = useCallback((e: KeyboardEvent) => {
    if (e.key === " " || e.key === "ArrowRight") {
      // Auto-fill all correct matches if none placed yet
      if (matches.length === 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const autoMatches = labels.map(l => ({ stat: l.correctStat, label: l.id }));
        setMatches(autoMatches);
      } else if (stage < maxStage && matches.length === 4) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setStage((s) => s + 1);
      }
    } else if (e.key === "ArrowLeft") {
      if (stage > 1) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setStage((s) => s - 1);
      }
    }
  }, [stage, maxStage, matches.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleAdvance, { capture: true });
    return () => window.removeEventListener("keydown", handleAdvance, { capture: true } as any);
  }, [handleAdvance]);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, statId: string) => {
    if (stage >= 2 || matches.find(m => m.stat === statId)) return;
    setDraggedStat(statId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", statId);
  };

  const handleDragEnd = () => {
    setDraggedStat(null);
    setDragOverLabel(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, labelId: string) => {
    e.preventDefault();
    if (stage >= 2 || matches.find(m => m.label === labelId)) return;
    setDragOverLabel(labelId);
  };

  const handleDragLeave = () => {
    setDragOverLabel(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, labelId: string) => {
    e.preventDefault();
    if (stage >= 2 || matches.find(m => m.label === labelId)) return;
    
    const statId = e.dataTransfer.getData("text/plain");
    if (!statId || matches.find(m => m.stat === statId)) return;
    
    setMatches([...matches, { stat: statId, label: labelId }]);
    setDraggedStat(null);
    setDragOverLabel(null);
  };

  const getMatchForStat = (statId: string) => matches.find(m => m.stat === statId);
  const getMatchForLabel = (labelId: string) => matches.find(m => m.label === labelId);
  
  const isCorrectMatch = (statId: string, labelId: string) => {
    const label = labels.find(l => l.id === labelId);
    return label?.correctStat === statId;
  };

  const correctCount = matches.filter(m => isCorrectMatch(m.stat, m.label)).length;

  const getLabelForStat = (statId: string) => {
    const match = getMatchForStat(statId);
    if (!match) return null;
    return shuffledLabels.find(l => l.id === match.label);
  };

  const getStatForLabel = (labelId: string) => {
    const match = getMatchForLabel(labelId);
    if (!match) return null;
    return stats.find(s => s.id === match.stat);
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-base text-muted-foreground uppercase tracking-widest mb-1">
            Gong Labs • 1 Million Opportunities
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Match the <span className="text-accent">Impact</span>
          </h1>
          {stage === 1 && (
            <p className="text-lg text-muted-foreground mt-2 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Drag each stat to its matching AI use case
            </p>
          )}
        </div>

        {/* Game Area */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Left: Draggable Stats */}
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-widest text-muted-foreground text-center mb-2">Win Rate Impact</p>
            {stats.map((stat) => {
              const match = getMatchForStat(stat.id);
              const matchedLabel = getLabelForStat(stat.id);
              const isRevealed = stage >= 2;
              const isCorrect = match && isCorrectMatch(match.stat, match.label);
              const isDragging = draggedStat === stat.id;
              const canDrag = !match && stage < 2;
              
              return (
                <div
                  key={stat.id}
                  draggable={canDrag}
                  onDragStart={(e) => handleDragStart(e, stat.id)}
                  onDragEnd={handleDragEnd}
                  className={`p-6 rounded-2xl text-center transition-all duration-300 ${
                    canDrag ? "cursor-grab active:cursor-grabbing" : ""
                  } ${
                    isRevealed && match
                      ? isCorrect
                        ? "bg-secondary/20 border-3 border-secondary"
                        : "bg-destructive/20 border-3 border-destructive"
                      : match
                        ? "bg-muted/30 border-3 border-muted"
                        : isDragging
                          ? "bg-accent/30 border-3 border-accent scale-105 shadow-xl opacity-70"
                          : "bg-card border-2 border-border hover:border-accent/50 hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    {canDrag && (
                      <GripVertical className="h-6 w-6 text-muted-foreground/50" />
                    )}
                    <div className={`text-5xl md:text-6xl font-black ${
                      stat.color === "secondary" ? "text-secondary" :
                      stat.color === "accent" ? "text-accent" : "text-destructive"
                    }`}>
                      {stat.value}
                    </div>
                  </div>
                  {matchedLabel && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                      {isRevealed && (
                        isCorrect 
                          ? <CheckCircle2 className="h-5 w-5 text-secondary" />
                          : <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <span className={`text-lg font-semibold ${
                        isRevealed ? (isCorrect ? "text-secondary" : "text-destructive") : "text-foreground"
                      }`}>
                        → {matchedLabel.text}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Drop Zones */}
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-widest text-muted-foreground text-center mb-2">AI Use Case</p>
            {shuffledLabels.map((label) => {
              const match = getMatchForLabel(label.id);
              const matchedStat = getStatForLabel(label.id);
              const isRevealed = stage >= 2;
              const isCorrect = match && isCorrectMatch(match.stat, match.label);
              const correctStat = stats.find(s => s.id === label.correctStat);
              const isDragOver = dragOverLabel === label.id && !match;
              const canDrop = !match && stage < 2 && draggedStat;
              
              return (
                <div
                  key={label.id}
                  onDragOver={(e) => handleDragOver(e, label.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, label.id)}
                  className={`p-6 rounded-2xl transition-all duration-300 ${
                    isRevealed && match
                      ? isCorrect
                        ? "bg-secondary/20 border-3 border-secondary"
                        : "bg-destructive/20 border-3 border-destructive"
                      : match
                        ? "bg-muted/30 border-3 border-muted"
                        : isDragOver
                          ? "bg-secondary/20 border-3 border-secondary border-dashed scale-105 shadow-lg"
                          : canDrop
                            ? "bg-card border-2 border-dashed border-secondary/50"
                            : "bg-card border-2 border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xl font-semibold ${
                        isRevealed && match
                          ? isCorrect ? "text-secondary" : "text-destructive"
                          : "text-foreground"
                      }`}>
                        {label.text}
                      </p>
                      <p className="text-sm text-muted-foreground">{label.subtitle}</p>
                    </div>
                    {matchedStat && (
                      <span className={`text-3xl font-black ${
                        matchedStat.color === "secondary" ? "text-secondary" :
                        matchedStat.color === "accent" ? "text-accent" : "text-destructive"
                      }`}>
                        {matchedStat.value}
                      </span>
                    )}
                  </div>
                  {isRevealed && !isCorrect && match && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Correct: <span className="text-primary font-bold">{correctStat?.value}</span>
                    </p>
                  )}
                  {!match && isDragOver && (
                    <p className="text-sm text-accent mt-2 animate-pulse">Drop here!</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Score & Reveal */}
        {matches.length === 4 && stage === 1 && (
          <div className="mt-6 text-center animate-fade-in">
            <p className="text-xl text-muted-foreground">
              All matched! Press <span className="text-accent font-bold">Space</span> to reveal answers
            </p>
          </div>
        )}

        {stage >= 2 && (
          <div className="mt-6 space-y-4 animate-fade-in">
            {/* Score */}
            <div className="text-center">
              <div className={`inline-block px-8 py-4 rounded-2xl ${
                correctCount === 4 
                  ? "bg-secondary/20 border-2 border-secondary" 
                  : correctCount >= 3
                    ? "bg-accent/20 border-2 border-accent"
                    : "bg-destructive/20 border-2 border-destructive"
              }`}>
                <p className="text-3xl font-black">
                  {correctCount}/4 Correct
                </p>
              </div>
            </div>

            {/* Takeaway */}
            <div className="text-center">
              <div className="inline-block bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary/40 rounded-2xl px-10 py-5">
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  AI wins when it <span className="text-primary">informs</span> your judgment—
                </p>
                <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">
                  not when it <span className="text-destructive">replaces</span> your work.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress - subtle */}
        <div className="flex justify-center gap-1.5 mt-6 opacity-30">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                s <= stage ? "bg-muted-foreground" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
