import { useState, useEffect, useCallback } from "react";
import { TrendingDown, CheckCircle2, XCircle, Gamepad2, Sparkles, Users } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { usePoll } from "@/contexts/PollContext";
import { PollControls } from "@/components/PollControls";

interface CurveState {
  dipDepth: number;
  recoverySpeed: number;
}

interface CurvePreset {
  dipDepth: number;
  recoverySpeed: number;
  label: string;
}

const curvePresets: Record<string, CurvePreset> = {
  immediate: { dipDepth: 0, recoverySpeed: 80, label: "Steady improvement" },
  "thirty-days": { dipDepth: 30, recoverySpeed: 70, label: "Small dip, 30-day recovery" },
  "j-curve": { dipDepth: 80, recoverySpeed: 30, label: "Significant dip, then growth" },
  flat: { dipDepth: 0, recoverySpeed: 0, label: "No measurable change" },
};

const JCurveVisualization = ({ 
  curveState, 
  showGame = false, 
  large = false,
  previewLabel,
  isFlat = false
}: { 
  curveState: CurveState; 
  showGame?: boolean; 
  large?: boolean;
  previewLabel?: string;
  isFlat?: boolean;
}) => {
  const baselineY = 100;
  const dipY = baselineY + (curveState.dipDepth * 0.8);
  const recoveryX = 220 + (100 - curveState.recoverySpeed) * 0.6;
  const peakY = baselineY - 40 - (curveState.recoverySpeed * 0.3);
  
  // Different path for flat line vs curve
  const curvePath = isFlat
    ? `M 60 ${baselineY} L 400 ${baselineY}`
    : curveState.dipDepth === 0 && curveState.recoverySpeed > 0
      ? `M 60 ${baselineY} C 120 ${baselineY} 200 ${baselineY - 20} 280 ${baselineY - 40} C 340 ${baselineY - 55} 370 ${peakY + 10} 400 ${peakY}`
      : `M 60 ${baselineY} C 100 ${baselineY} 120 ${dipY} 160 ${dipY} C 200 ${dipY} ${recoveryX - 40} ${dipY - 20} ${recoveryX} ${peakY + 30} C ${recoveryX + 40} ${peakY} 360 ${peakY} 400 ${peakY}`;
  
  const curveColor = isFlat
    ? "hsl(var(--muted-foreground))"
    : curveState.dipDepth > 60 
      ? "hsl(var(--destructive))" 
      : curveState.dipDepth > 30 
        ? "hsl(var(--accent))" 
        : "hsl(var(--secondary))";
  
  const height = large ? "h-80" : "h-64";
  
  return (
    <div className={`relative w-full ${height}`}>
      {/* Preview Label */}
      {previewLabel && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-accent/20 border border-accent/40 rounded-full px-4 py-1.5 animate-fade-in">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-accent">Preview: {previewLabel}</span>
        </div>
      )}
      
      <svg viewBox="0 0 450 260" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`curveGradient-${curveState.dipDepth}-${isFlat}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={curveColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={curveColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        <line x1="60" y1="40" x2="60" y2="220" stroke="currentColor" className="text-muted-foreground/20" strokeWidth="2" />
        <line x1="60" y1="220" x2="420" y2="220" stroke="currentColor" className="text-muted-foreground/20" strokeWidth="2" />
        
        {/* Baseline (starting productivity) */}
        <line x1="60" y1={baselineY} x2="420" y2={baselineY} stroke="currentColor" className="text-muted-foreground/40" strokeWidth="3" strokeDasharray="10 6" />
        <text x="430" y={baselineY + 5} fill="currentColor" className="text-muted-foreground text-[14px] font-bold" textAnchor="start">
          Baseline
        </text>
        
        {/* Time markers - simplified */}
        <text x="60" y="245" fill="currentColor" className="text-foreground text-[14px] font-bold" textAnchor="middle">Start</text>
        <text x="230" y="245" fill="currentColor" className="text-muted-foreground text-[14px] font-bold" textAnchor="middle">Time →</text>
        <text x="400" y="245" fill="currentColor" className="text-primary text-[14px] font-bold" textAnchor="middle">Later</text>
        
        {/* Y-axis label */}
        <text x="20" y="130" fill="currentColor" className="text-muted-foreground text-[13px] font-semibold" textAnchor="middle" transform="rotate(-90, 20, 130)">
          Productivity
        </text>
        
        {/* Fill under curve */}
        {!isFlat && (
          <path 
            d={`${curvePath} L 400 220 L 60 220 Z`}
            fill={`url(#curveGradient-${curveState.dipDepth}-${isFlat})`}
            className="transition-all duration-500"
          />
        )}
        
        {/* Main curve */}
        <path 
          d={curvePath}
          fill="none" 
          stroke={curveColor}
          strokeWidth="6"
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        
        {/* Key points - only show for non-flat curves */}
        {!isFlat && (
          <>
            {/* Start point */}
            <circle cx="60" cy={baselineY} r="8" fill={curveColor} className="transition-all duration-500" />
            
            {/* Dip point - only if there's a dip */}
            {curveState.dipDepth > 0 && (
              <>
                <circle cx="160" cy={dipY} r="10" fill="hsl(var(--destructive))" className="transition-all duration-500" />
                <text x="160" y={dipY + 28} fill="currentColor" className="text-destructive text-[13px] font-bold" textAnchor="middle">
                  The Dip
                </text>
              </>
            )}
            
            {/* Recovery point */}
            <circle cx="400" cy={peakY} r="10" fill="hsl(var(--primary))" className="transition-all duration-500" />
            <text x="400" y={peakY - 15} fill="currentColor" className="text-primary text-[13px] font-bold" textAnchor="middle">
              Growth
            </text>
          </>
        )}
        
        {/* Flat line indicator */}
        {isFlat && (
          <text x="230" y={baselineY - 20} fill="currentColor" className="text-muted-foreground text-[16px] font-bold" textAnchor="middle">
            No Change
          </text>
        )}
        
        {/* Game stats */}
        {showGame && (
          <g>
            <rect x="280" y="15" width="140" height="45" rx="8" fill="hsl(var(--card))" stroke={curveColor} strokeWidth="2" />
            <text x="350" y="35" fill={curveColor} className="text-[16px] font-black" textAnchor="middle">
              Dip: {curveState.dipDepth}%
            </text>
            <text x="350" y="52" fill="currentColor" className="text-muted-foreground text-[11px]" textAnchor="middle">
              {curveState.dipDepth > 50 ? "Can you reduce it?" : "Looking better!"}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

type GameOption = {
  id: string;
  label: string;
  effect: 'good' | 'bad' | 'neutral';
  dipChange: number;
  recoveryChange: number;
  feedback: string;
};

const gameOptions: GameOption[] = [
  { id: 'digital', label: 'Prior digital investment', effect: 'good', dipChange: -15, recoveryChange: 15, feedback: '✓ Digital-ready teams adapt faster!' },
  { id: 'training', label: 'Training + workflow redesign', effect: 'good', dipChange: -20, recoveryChange: 20, feedback: '✓ Complementary investments pay off!' },
  { id: 'scale', label: 'Scale across more output', effect: 'good', dipChange: -10, recoveryChange: 25, feedback: '✓ Scale spreads the benefits!' },
  { id: 'management', label: 'Maintain structured management', effect: 'good', dipChange: -12, recoveryChange: 10, feedback: '✓ KPIs prevent 1/3 of losses!' },
  { id: 'data', label: 'Invest in data infrastructure', effect: 'good', dipChange: -12, recoveryChange: 15, feedback: '✓ Good data = better AI!' },
  { id: 'moretools', label: 'Adopt multiple AI tools at once', effect: 'bad', dipChange: 12, recoveryChange: -5, feedback: '✗ Tool sprawl increases complexity!' },
  { id: 'automate', label: 'Automate as much as possible', effect: 'bad', dipChange: 15, recoveryChange: -10, feedback: '✗ Over-automation creates blind spots!' },
  { id: 'fast', label: 'Move fast, figure it out later', effect: 'bad', dipChange: 18, recoveryChange: -15, feedback: '✗ Speed without prep backfires!' },
  { id: 'replace', label: 'Let AI replace manual tasks', effect: 'bad', dipChange: 10, recoveryChange: -8, feedback: '✗ Replacement without redesign fails!' },
];

export const SalesQuizScreen = () => {
  const [stage, setStage] = useState(1);
  const [selectedAnswer1, setSelectedAnswer1] = useState<string | null>(null);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [curveState, setCurveState] = useState<CurveState>({ dipDepth: 80, recoverySpeed: 30 });
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<GameOption[]>([]);
  const maxStage = 4;

  const { session, isPresenter } = useSession();
  const { currentPoll, responses, submitResponse, createPoll } = usePoll();

  // Start poll when presenter arrives
  useEffect(() => {
    if (isPresenter && session && !currentPoll) {
      createPoll('P25', 'multiple_choice');
    }
  }, [isPresenter, session, currentPoll, createPoll]);

  // Calculate vote distribution from responses
  const voteCounts = responses.reduce((acc, response) => {
    const value = response.value as { choice?: string };
    if (value.choice) {
      acc[value.choice] = (acc[value.choice] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0);

  useEffect(() => {
    setShuffledOptions([...gameOptions].sort(() => Math.random() - 0.5));
  }, []);

  // When entering stage 4, auto-select all correct options
  useEffect(() => {
    if (stage === 4) {
      const goodIds = gameOptions.filter(o => o.effect === 'good').map(o => o.id);
      const badIds = gameOptions.filter(o => o.effect === 'bad').map(o => o.id);
      // Remove any bad selections, add all good ones
      let newCurve = { dipDepth: 80, recoverySpeed: 30 }; // reset to base
      goodIds.forEach(id => {
        const opt = gameOptions.find(o => o.id === id)!;
        newCurve = {
          dipDepth: Math.max(0, Math.min(100, newCurve.dipDepth + opt.dipChange)),
          recoverySpeed: Math.max(0, Math.min(100, newCurve.recoverySpeed + opt.recoveryChange)),
        };
      });
      setSelectedOptions(goodIds);
      setCurveState(newCurve);
      setLastFeedback(null);
    }
  }, [stage]);

  const handleAdvance = useCallback((e: KeyboardEvent) => {
    if (e.key === " " || e.key === "ArrowRight") {
      if (stage < maxStage) {
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
  }, [stage, maxStage]);

  useEffect(() => {
    window.addEventListener("keydown", handleAdvance, { capture: true });
    return () => window.removeEventListener("keydown", handleAdvance, { capture: true } as any);
  }, [handleAdvance]);

  const handleSelectAnswer1 = (answerId: string) => {
    if (stage === 1) {
      setSelectedAnswer1(answerId);
      setHoveredOption(null);
      
      // Submit vote if participant
      if (!isPresenter && currentPoll?.is_open) {
        submitResponse({ choice: answerId });
      }
      
      // Only auto-advance for presenter
      if (isPresenter) {
        setTimeout(() => setStage(2), 400);
      }
    }
  };

  const handleGameOptionClick = (option: GameOption) => {
    if (selectedOptions.includes(option.id)) {
      // Uncheck: remove and reverse the effect
      setSelectedOptions(prev => prev.filter(id => id !== option.id));
      setCurveState(prev => ({
        dipDepth: Math.max(0, Math.min(100, prev.dipDepth - option.dipChange)),
        recoverySpeed: Math.max(0, Math.min(100, prev.recoverySpeed - option.recoveryChange)),
      }));
      setLastFeedback(null);
      return;
    }
    
    setSelectedOptions([...selectedOptions, option.id]);
    setCurveState(prev => ({
      dipDepth: Math.max(0, Math.min(100, prev.dipDepth + option.dipChange)),
      recoverySpeed: Math.max(0, Math.min(100, prev.recoverySpeed + option.recoveryChange)),
    }));
    setLastFeedback(option.feedback);
  };

  const q1Options = [
    { id: "immediate", label: "Steady improvement from day one" },
    { id: "thirty-days", label: "Small dip, 30-day recovery" },
    { id: "j-curve", label: "Significant dip, then growth" },
    { id: "flat", label: "No measurable change" },
  ];

  const goodChoices = selectedOptions.filter(id => gameOptions.find(o => o.id === id)?.effect === 'good').length;
  const badChoices = selectedOptions.filter(id => gameOptions.find(o => o.id === id)?.effect === 'bad').length;

  // Determine what curve to show in Stage 1
  const getDisplayCurve = (): { state: CurveState; isFlat: boolean; label?: string } => {
    if (stage >= 2) {
      return { state: curveState, isFlat: false };
    }
    
    if (hoveredOption) {
      const preset = curvePresets[hoveredOption];
      return { 
        state: { dipDepth: preset.dipDepth, recoverySpeed: preset.recoverySpeed },
        isFlat: hoveredOption === "flat",
        label: preset.label
      };
    }
    
    // Default: show a neutral "?" state
    return { 
      state: { dipDepth: 40, recoverySpeed: 50 },
      isFlat: false
    };
  };

  const displayCurve = getDisplayCurve();

  // Participant-only view when not presenter
  if (session && !isPresenter) {
    const hasVoted = selectedAnswer1 !== null;
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              AI Adoption J-Curve
            </h2>
            <p className="text-lg text-muted-foreground">
              What happens to <span className="text-accent font-semibold">productivity</span> when teams adopt AI?
            </p>
          </div>

          {!hasVoted && currentPoll?.is_open ? (
            <div className="space-y-3">
              {q1Options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer1(option.id)}
                  className="w-full p-4 rounded-xl text-left font-semibold transition-all bg-card border-2 border-border hover:border-accent hover:bg-accent/5 text-foreground"
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : hasVoted ? (
            <div className="bg-secondary/20 border-2 border-secondary/40 rounded-xl p-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-secondary mx-auto mb-3" />
              <p className="text-xl font-bold text-foreground">Vote submitted!</p>
              <p className="text-muted-foreground mt-2">
                You selected: <span className="text-accent font-semibold">
                  {q1Options.find(o => o.id === selectedAnswer1)?.label}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Watch the main screen for results...
              </p>
            </div>
          ) : (
            <div className="bg-muted/30 border-2 border-border rounded-xl p-6 text-center">
              <p className="text-lg text-muted-foreground">Waiting for presenter to open voting...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-hidden">
      <div className="max-w-7xl w-full">
        
        {/* Header with poll controls */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-4 mb-1">
            <p className="text-base text-muted-foreground uppercase tracking-widest">
              Brynjolfsson et al. • 2025
            </p>
            {isPresenter && session && (
              <div className="flex items-center gap-2">
                <PollControls slideId="P25" pollType="multiple_choice" />
                {totalVotes > 0 && (
                  <span className="flex items-center gap-1 text-sm text-accent font-semibold">
                    <Users className="h-4 w-4" />
                    {totalVotes}
                  </span>
                )}
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            The AI Adoption <span className="text-accent">J-Curve</span>
          </h1>
        </div>

        {/* Stage 1 & 2: Initial Quiz */}
        {stage <= 2 && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Question */}
            <div className="space-y-3">
              <p className="text-xl text-muted-foreground">
                What happens to <span className="text-accent font-bold">productivity</span>?
              </p>
              
              {stage === 1 && (
                <p className="text-sm text-muted-foreground/70 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Hover to preview each AI-generated scenario
                </p>
              )}
              
              <div className="space-y-2">
                {q1Options.map((option) => {
                  const isSelected = selectedAnswer1 === option.id;
                  const isRevealed = stage >= 2;
                  const isCorrect = option.id === "j-curve";
                  const isHovered = hoveredOption === option.id;
                  const voteCount = voteCounts[option.id] || 0;
                  const votePercent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectAnswer1(option.id)}
                      onMouseEnter={() => stage === 1 && setHoveredOption(option.id)}
                      onMouseLeave={() => stage === 1 && setHoveredOption(null)}
                      disabled={stage >= 2}
                      className={`w-full p-4 rounded-xl text-left text-lg font-semibold transition-all duration-300 flex items-center gap-3 relative overflow-hidden ${
                        isRevealed
                          ? isCorrect
                            ? "bg-secondary/20 border-3 border-secondary text-foreground"
                            : "bg-muted/20 border-2 border-muted text-muted-foreground opacity-50"
                          : isHovered
                            ? "bg-accent/20 border-2 border-accent text-foreground scale-[1.02] shadow-lg shadow-accent/20"
                            : isSelected
                              ? "bg-accent/20 border-3 border-accent text-foreground scale-102"
                              : "bg-card border-2 border-border hover:border-accent/50 text-foreground cursor-pointer"
                      }`}
                    >
                      {/* Vote bar background */}
                      {isPresenter && totalVotes > 0 && !isRevealed && (
                        <div 
                          className="absolute inset-y-0 left-0 bg-accent/10 transition-all duration-500"
                          style={{ width: `${votePercent}%` }}
                        />
                      )}
                      {isRevealed && isCorrect && <CheckCircle2 className="h-6 w-6 text-secondary flex-shrink-0" />}
                      {isRevealed && isSelected && !isCorrect && <XCircle className="h-6 w-6 text-destructive flex-shrink-0" />}
                      {!isRevealed && isHovered && <Sparkles className="h-5 w-5 text-accent flex-shrink-0 animate-pulse z-10" />}
                      <span className="z-10 flex-1">{option.label}</span>
                      {/* Vote count for presenter */}
                      {isPresenter && totalVotes > 0 && !isRevealed && (
                        <span className="text-sm text-accent font-bold z-10">
                          {votePercent}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {stage >= 2 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-accent/10 border-2 border-accent/30 rounded-xl p-4">
                    <p className="text-base text-muted-foreground flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-accent" />
                      All curves were <span className="text-accent font-bold">AI-generated</span> predictions.
                    </p>
                    <p className="text-lg text-foreground font-bold">
                      Only one matched <span className="text-primary">reality</span>.
                    </p>
                  </div>
                  
                  <div className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-4">
                    <p className="text-lg text-foreground font-bold">
                      The dip is <span className="text-destructive">unavoidable</span>—but what you do matters.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: J-Curve Visualization */}
            <div className="bg-card border-2 border-border rounded-2xl p-4">
              <JCurveVisualization 
                curveState={displayCurve.state} 
                large 
                previewLabel={stage === 1 ? displayCurve.label : undefined}
                isFlat={displayCurve.isFlat}
              />
            </div>
          </div>
        )}

        {/* Stage 3: The Game */}
        {stage >= 3 && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Gamepad2 className="h-8 w-8 text-accent" />
                <p className="text-2xl font-bold text-foreground">
                  Soften the Dip
                </p>
              </div>
              <div className="flex items-center gap-4 text-xl">
                <span className="text-secondary font-black">✓ {goodChoices}</span>
                <span className="text-destructive font-black">✗ {badChoices}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Left: Options */}
              <div className="space-y-2">
                {shuffledOptions.map((option) => {
                  const isSelected = selectedOptions.includes(option.id);
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleGameOptionClick(option)}
                      className={`w-full p-3 rounded-xl text-left text-base font-semibold transition-all duration-300 ${
                        stage === 4
                          ? isSelected
                            ? "bg-secondary/20 border-2 border-secondary/50 text-secondary"
                            : "bg-muted/10 border-2 border-muted/30 text-muted-foreground/40"
                          : isSelected
                            ? option.effect === 'good'
                            ? "bg-secondary/20 border-2 border-secondary/50 text-secondary cursor-pointer hover:opacity-80"
                            : option.effect === 'bad'
                              ? "bg-destructive/20 border-2 border-destructive/50 text-destructive cursor-pointer hover:opacity-80"
                              : "bg-muted/30 border-2 border-muted text-muted-foreground cursor-pointer hover:opacity-80"
                          : "bg-card border-2 border-border hover:border-accent hover:bg-accent/5 text-foreground cursor-pointer"
                      }`}
                    >
                      {isSelected && (
                        <span className="mr-2 text-lg">
                          {option.effect === 'good' ? '✓' : option.effect === 'bad' ? '✗' : '→'}
                        </span>
                      )}
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {/* Right: Live J-Curve */}
              <div className="bg-card border-2 border-border rounded-2xl p-4 flex flex-col">
                <JCurveVisualization curveState={curveState} showGame large />
                
                {/* Feedback appears here */}
                {lastFeedback ? (
                  <div className={`mt-3 p-4 rounded-xl text-xl font-bold animate-fade-in text-center ${
                    lastFeedback.startsWith('✓') 
                      ? 'bg-secondary/10 text-secondary border-2 border-secondary/30' 
                      : lastFeedback.startsWith('✗')
                        ? 'bg-destructive/10 text-destructive border-2 border-destructive/30'
                        : 'bg-muted/30 text-muted-foreground border-2 border-muted'
                  }`}>
                    {lastFeedback}
                  </div>
                ) : stage === 4 ? (
                  <div className="mt-3 bg-secondary/10 border-2 border-secondary/30 rounded-xl p-4 text-center animate-fade-in">
                    <p className="text-xl font-bold text-secondary">
                      ✓ These are the research-backed strategies
                    </p>
                    <p className="text-base text-muted-foreground mt-1">
                      Complementary investments that soften the dip
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 bg-primary/10 border-2 border-primary/30 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-primary">
                      The J-curve is the <span className="text-secondary">rehearsal period</span>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress - subtle */}
        <div className="flex justify-center gap-1.5 mt-4 opacity-30">
          {[1, 2, 3, 4].map((s) => (
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
