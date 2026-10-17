import { useReveal } from "@/hooks/useReveal";
import { Citation } from "@/components/blocks/Citation";
import { ScriptOverlay } from "@/components/blocks/ScriptOverlay";

export const CreativeHomogenizationSlide = () => {
  const { shown, Dots } = useReveal(2);

  const Cluster = ({ label, spread, color, visible }: {
    label: string; spread: "wide" | "narrow"; color: "muted" | "primary"; visible: boolean;
  }) => {
    const seed = spread === "wide" ? 1 : 2;
    const rng = (i: number) => { const x = Math.sin(seed * 99 + i * 17) * 10000; return x - Math.floor(x); };
    const radius = spread === "wide" ? 90 : 24;
    return (
      <div className={`flex flex-col items-center gap-3 transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
        <p className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">{label}</p>
        <div className="relative w-[220px] h-[220px] rounded-full border border-border/40">
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = rng(i) * Math.PI * 2;
            const r = rng(i + 50) * radius;
            return (
              <div
                key={i}
                className={`absolute w-2.5 h-2.5 rounded-full transition-all duration-1000 ${color === "primary" ? "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]" : "bg-muted-foreground/60"}`}
                style={{ left: `calc(50% + ${Math.cos(angle) * r}px - 5px)`, top: `calc(50% + ${Math.sin(angle) * r}px - 5px)`, transitionDelay: `${i * 30}ms` }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-6 overflow-hidden">
      <div className="max-w-5xl w-full space-y-6">
        <h1 className="slide-body-lg text-center font-display font-light text-foreground leading-tight">
          Everyone got <span className="italic">better.</span>{" "}
          <span className="text-muted-foreground">The group got narrower.</span>
        </h1>

        <div className="grid grid-cols-2 gap-12 items-start pt-2">
          <Cluster label="Without AI" spread="wide"   color="muted"   visible={shown(1)} />
          <Cluster label="With AI"    spread="narrow" color="primary" visible={shown(1)} />
        </div>

        <div className="min-h-[100px] flex items-center justify-center">
          {shown(2) && (
            <div className="animate-fade-in text-center space-y-3">
              <p className="slide-body-lg font-display italic text-foreground">
                Same model → <span className="not-italic text-primary font-semibold">same place.</span>
              </p>
              <Citation sources={["Doshi & Hauser (2024). Science Advances, 10(28)."]} />
            </div>
          )}
        </div>

        <Dots />
      </div>
      <ScriptOverlay />
    </div>
  );
};
