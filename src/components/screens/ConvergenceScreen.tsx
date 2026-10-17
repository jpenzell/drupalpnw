import { useState, useEffect, useCallback } from "react";
import { Layers, Rocket, TrendingUp, Clock } from "lucide-react";

const points = [
  {
    icon: Layers,
    headline: "Features are converging",
    body: "Every major platform is racing to the same feature set. Today's differentiator is tomorrow's table stakes.",
    color: "primary",
  },
  {
    icon: Clock,
    headline: "Over-engineering is the real risk",
    body: "If your build takes 6 months, a third party will ship it in 6 weeks. The window for custom solutions is shrinking fast.",
    color: "accent",
  },
  {
    icon: TrendingUp,
    headline: "This is the worst AI you'll ever use",
    body: "Every model you touch today will be dramatically better in a year. The skills you build now compound — the specific tools won't matter.",
    color: "secondary",
  },
];

export const ConvergenceScreen = () => {
  const [revealed, setRevealed] = useState(0);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowRight") {
        if (revealed < points.length) {
          e.preventDefault();
          e.stopImmediatePropagation();
          setRevealed((prev) => prev + 1);
        }
      } else if (e.key === "ArrowLeft") {
        if (revealed > 0) {
          e.preventDefault();
          e.stopImmediatePropagation();
          setRevealed((prev) => prev - 1);
        }
      }
    },
    [revealed]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKey, {
        capture: true,
      } as any);
  }, [handleKey]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-hidden">
      <div className="max-w-5xl w-full space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary/10 border border-primary/30 rounded-full">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-primary font-semibold text-sm tracking-widest">
              The Acceleration Reality
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Don't Build for <span className="text-primary">Today's</span> AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The landscape is moving faster than any single implementation.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {points.map((p, i) => {
            const isVisible = i < revealed;
            const Icon = p.icon;
            return (
              <div
                key={i}
                className={`transition-all duration-500 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6 pointer-events-none"
                }`}
              >
                <div
                  className={`bg-card border-2 border-${p.color}/30 rounded-2xl p-8 h-full flex flex-col items-center text-center`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-${p.color}/20 flex items-center justify-center mb-5`}
                  >
                    <Icon className={`h-7 w-7 text-${p.color}`} />
                  </div>
                  <p className={`text-xl font-bold text-${p.color} mb-3`}>
                    {p.headline}
                  </p>
                  <p className="text-base text-foreground/80 leading-relaxed">
                    {p.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Takeaway */}
        {revealed >= points.length && (
          <div className="text-center animate-fade-in">
            <div className="inline-block bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30 rounded-2xl px-10 py-6">
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                Learn the <span className="text-primary">thinking</span>, not
                the tool.
              </p>
              <p className="text-lg text-muted-foreground mt-2">
                The tools will change. The mindset won't.
              </p>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 opacity-30">
          {points.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i < revealed
                  ? "bg-muted-foreground"
                  : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
