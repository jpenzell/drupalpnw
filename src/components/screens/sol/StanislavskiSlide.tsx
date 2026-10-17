import { useReveal } from "@/hooks/useReveal";
import { Citation } from "@/components/blocks/Citation";
import { ScriptOverlay } from "@/components/blocks/ScriptOverlay";

const ROWS = [
  { word: "NEED",     color: "text-secondary", def: "What this character wants — right now." },
  { word: "OBSTACLE", color: "text-accent",    def: "What stands in the way." },
  { word: "ACTION",   color: "text-primary",   def: "The verb you play to get past it." },
];

export const StanislavskiSlide = () => {
  const { shown, Dots } = useReveal(ROWS.length + 2);
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-6">
      <div className="max-w-6xl w-full space-y-7">
        {shown(1) && (
          <div className="text-center animate-fade-in">
            <p className="text-[11px] uppercase tracking-[0.3em] font-mono text-muted-foreground mb-1">
              Super-objective
            </p>
            <p className="slide-body font-display italic text-foreground/80">
              e.g. Get the promotion.
            </p>
          </div>
        )}

        <div className="h-px bg-border/60" />

        <div className="space-y-5">
          {ROWS.map((r, i) => (
            <div
              key={r.word}
              className={`grid grid-cols-[max-content_1fr] gap-10 items-baseline transition-all duration-700 ${
                shown(i + 2) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <p className={`slide-title font-display font-light tracking-[0.05em] text-right whitespace-nowrap ${r.color} ${i === 2 && shown(i + 2) ? "spotlight-glow" : ""}`}>
                {r.word}
              </p>
              <div className="border-l border-border/60 pl-6">
                <p className="slide-body font-display text-foreground leading-snug">{r.def}</p>
              </div>
            </div>
          ))}
        </div>

        {shown(5) && (
          <div className="animate-fade-in text-center pt-2">
            <p className="slide-body font-display italic text-muted-foreground">
              "Every objective must carry in itself the germ of an action."
            </p>
            <Citation sources={["Stanislavski (1936). An Actor Prepares."]} />
          </div>
        )}

        <Dots />
      </div>
      <ScriptOverlay />
    </div>
  );
};
