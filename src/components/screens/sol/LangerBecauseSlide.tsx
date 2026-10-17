import { useReveal } from "@/hooks/useReveal";
import { Citation } from "@/components/blocks/Citation";
import { ScriptOverlay } from "@/components/blocks/ScriptOverlay";

const ROWS = [
  { ask: "May I use the Xerox machine?",                          pct: 60 },
  { ask: "May I use the machine, because I'm in a rush?",         pct: 94 },
  { ask: "May I use the machine, because I need to make copies?", pct: 93 },
];

export const LangerBecauseSlide = () => {
  const { shown, Dots } = useReveal(3);
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6">
      <div className="max-w-5xl w-full space-y-8">
        <h1 className="slide-body-lg text-center font-display font-light text-foreground">
          Three asks at the photocopier.
        </h1>

        <div className={`space-y-5 transition-opacity duration-500 ${shown(1) ? "opacity-100" : "opacity-0"}`}>
          {ROWS.map((r, i) => (
            <div key={i} className="flex items-center justify-between gap-6 p-5 rounded-xl border-2 border-border bg-card">
              <p className="slide-body font-display italic text-foreground">"{r.ask}"</p>
              <p className="slide-body-lg font-display font-bold text-primary">{r.pct}%</p>
            </div>
          ))}
        </div>

        {shown(2) && (
          <div className="text-center animate-fade-in space-y-3">
            <p className="slide-body-lg font-display italic text-secondary">
              Naming a <span className="not-italic font-semibold">need</span> did almost all the work.
            </p>
            <Citation sources={["Langer, Blank & Chanowitz (1978). J. Personality and Social Psychology, 36(6)."]} />
          </div>
        )}

        <Dots />
      </div>
      <ScriptOverlay />
    </div>
  );
};
