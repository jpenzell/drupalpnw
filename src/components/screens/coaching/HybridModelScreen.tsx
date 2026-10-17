import { useState, useCallback, useEffect } from "react";
import { Bot, Users, Layers, BookOpen } from "lucide-react";

const findings = [
  {
    icon: Users,
    label: "Human Coaches",
    headline: "Higher on every factor",
    detail: "Clients rated human coaches higher on insight, working alliance, and trust. Why? Because human coaches bring structured frameworks like Birkman that AI can't replicate alone.",
    color: "secondary",
    borderColor: "border-secondary/30",
    bgColor: "bg-secondary/15",
  },
  {
    icon: Bot,
    label: "AI Coaching Agents",
    headline: "Lower shame, more disclosure",
    detail: "Clients reported less shame with AI and disclosed more freely — suggesting AI unlocks honesty that humans sometimes can't.",
    color: "muted-foreground",
    borderColor: "border-muted-foreground/30",
    bgColor: "bg-muted-foreground/15",
  },
  {
    icon: Layers,
    label: "The Hybrid Opportunity",
    headline: "Combine strengths",
    detail: "A 2025 systematic review of 35 studies found all three modalities work — but hybrid approaches harness AI's scalability with human coaching's depth.",
    color: "primary",
    borderColor: "border-primary/30",
    bgColor: "bg-primary/15",
  },
];

export const HybridModelScreen = () => {
  const [revealed, setRevealed] = useState(0);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowRight") {
        if (revealed < findings.length + 1) {
          e.preventDefault();
          e.stopImmediatePropagation();
          setRevealed((prev) => prev + 1);
        }
      } else if (e.key === "ArrowLeft" && revealed > 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setRevealed((prev) => prev - 1);
      }
    },
    [revealed]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey, { capture: true });
    return () => window.removeEventListener("keydown", handleKey, { capture: true } as any);
  }, [handleKey]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary/10 border border-primary/30 rounded-full">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-primary font-semibold text-sm tracking-widest uppercase">
              Passmore et al. 2025 · Loughnane et al. 2025
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            The <span className="text-primary">Hybrid</span> Advantage
          </h1>
          <p className="text-lg text-muted-foreground">
            What does the research actually say?
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {findings.map((item, i) => {
            const isVisible = i < revealed;
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={`transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
                }`}
              >
                <div className={`bg-card border-2 ${item.borderColor} rounded-2xl p-6 h-full`}>
                  <div className={`w-14 h-14 rounded-2xl ${item.bgColor} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`h-7 w-7 text-${item.color}`} />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2 text-center">{item.label}</p>
                  <p className={`text-xl font-bold text-${item.color} mb-3 text-center`}>{item.headline}</p>
                  <p className="text-sm text-foreground/70 leading-relaxed text-center">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {revealed > findings.length && (
          <div className="text-center animate-fade-in">
            <div className="inline-block bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30 rounded-2xl px-10 py-5">
              <p className="text-xl md:text-2xl font-bold text-foreground">
                The hybrid works because <span className="text-primary">you bring the data depth</span>. AI operationalizes it between sessions.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <p className="text-xs text-muted-foreground/40 max-w-2xl text-center">
            Passmore, J. et al. (2025). <em>Journal of Work–Applied Management</em>, n=63. · Loughnane, C. et al. (2025). <em>Frontiers in Digital Health</em>, systematic review of 35 studies.
          </p>
        </div>
      </div>
    </div>
  );
};
