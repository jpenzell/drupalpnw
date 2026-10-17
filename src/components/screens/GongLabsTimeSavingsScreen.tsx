import { useState, useEffect, useCallback } from "react";
import { Clock, Mail, MessageSquare, Search, ListChecks } from "lucide-react";

const useCases = [
  {
    id: "automate",
    label: "AI Writes the Emails",
    subtitle: "Follow-ups, outreach, templates",
    stat: "~6 hrs/week freed up per rep",
    statDetail: "464% increase in AI-composed emails since Feb 2023",
    icon: Mail,
    barPct: 100,
    color: "secondary",
  },
  {
    id: "inform",
    label: "AI Informs the Deal",
    subtitle: '"Ask Anything" on deals & accounts',
    stat: "Hours of research replaced instantly",
    statDetail: "Reps and managers skip manual call/email review",
    icon: MessageSquare,
    barPct: 60,
    color: "accent",
  },
  {
    id: "guide",
    label: "AI Guides the Strategy",
    subtitle: "Smart Trackers surface key moments",
    stat: "Auto-detects objections & opportunities",
    statDetail: "Identifies competitive mentions, pricing pushback, cross-sell signals",
    icon: Search,
    barPct: 35,
    color: "primary",
  },
  {
    id: "optimize",
    label: "AI Optimizes Next Actions",
    subtitle: "Prioritizes to-dos & follow-ups",
    stat: "Prevents missed action items",
    statDetail: "45% of reps lose critical to-dos each week without AI",
    icon: ListChecks,
    barPct: 25,
    color: "primary",
  },
];

export const GongLabsTimeSavingsScreen = () => {
  const [revealed, setRevealed] = useState(0);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === " " || e.key === "ArrowRight") {
      if (revealed < useCases.length) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setRevealed(prev => prev + 1);
      }
      // At max, let event fall through to advance slide
    } else if (e.key === "ArrowLeft") {
      if (revealed > 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setRevealed(prev => prev - 1);
      }
    }
  }, [revealed]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey, { capture: true });
    return () => window.removeEventListener("keydown", handleKey, { capture: true } as any);
  }, [handleKey]);

  return (
    <div className="flex-1 flex flex-col justify-center px-8 overflow-hidden">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-base text-muted-foreground uppercase tracking-widest mb-1">
            Gong Labs • 1M+ Opportunities • 1,418 Organizations
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            4 Ways Sales Teams Used <span className="text-primary">AI</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-2 flex items-center justify-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Ranked by time & efficiency savings
          </p>
        </div>

        {/* Use cases */}
        <div className="space-y-4">
          {useCases.map((uc, i) => {
            const isVisible = i < revealed;
            const Icon = uc.icon;
            return (
              <div
                key={uc.id}
                className={`transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                <div className={`bg-card border-2 border-${uc.color}/30 rounded-2xl p-5 flex items-center gap-5`}>
                  <div className={`w-12 h-12 rounded-xl bg-${uc.color}/20 flex items-center justify-center shrink-0`}>
                    <Icon className={`h-6 w-6 text-${uc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-lg font-bold text-foreground">{uc.label}</p>
                        <p className="text-sm text-muted-foreground">{uc.subtitle}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className={`text-base font-bold text-${uc.color}`}>{uc.stat}</p>
                        <p className="text-xs text-muted-foreground">{uc.statDetail}</p>
                      </div>
                    </div>
                    {/* Efficiency bar */}
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full bg-${uc.color} rounded-full transition-all duration-700`}
                        style={{ width: isVisible ? `${uc.barPct}%` : "0%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* After all revealed, next space advances slide */}

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-5 opacity-30">
          {useCases.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i < revealed ? "bg-muted-foreground" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
