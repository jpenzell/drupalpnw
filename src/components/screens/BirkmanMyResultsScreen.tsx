import { useReveal } from "@/hooks/useReveal";
import { ScriptOverlay } from "@/components/blocks/ScriptOverlay";

export const BirkmanMyResultsScreen = () => {
  const { shown, Dots } = useReveal(4);

  const Color = ({ name, hex, delay }: { name: string; hex: string; delay: number }) => (
    <div className="flex flex-col items-center gap-2 transition-all duration-500" style={{ transitionDelay: `${delay}ms` }}>
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-md" style={{ backgroundColor: hex }} />
      <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground">{name}</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-4 animate-fade-in overflow-hidden">
      <div className="max-w-6xl w-full space-y-4">
        <div className="text-center space-y-1">
          <p className="slide-kicker text-secondary">A bit of my Birkman</p>
          <h1 className="slide-subtitle text-foreground font-light">
            Most assessments hand you <span className="italic text-muted-foreground">qualities.</span>
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* LEFT — qualities */}
          <div className={`rounded-2xl border-2 border-border bg-card/40 p-5 space-y-4 transition-all duration-500 ${shown(1) ? "opacity-100" : "opacity-0"}`}>
            <p className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">Qualities · what you'd say about me</p>
            <p className="slide-subtitle text-foreground">"I'm <span className="font-semibold">Blue · Green · Blue</span>."</p>
            <div className="flex items-center justify-center gap-5 py-2">
              <Color name="Blue" hex="#2C5FA8" delay={0} />
              <Color name="Green" hex="#3F9F6B" delay={120} />
              <Color name="Blue" hex="#2C5FA8" delay={240} />
            </div>
            {shown(2) && (
              <p className="slide-body font-mono italic text-muted-foreground animate-fade-in border-t border-border/60 pt-3">
                Now what? <span className="not-italic">You can't act on that.</span>
              </p>
            )}
          </div>

          {/* RIGHT — needs */}
          <div className={`rounded-2xl border-2 border-primary/40 bg-primary/5 p-5 space-y-4 transition-all duration-500 ${shown(3) ? "opacity-100" : "opacity-0"}`}>
            <p className="text-[11px] uppercase tracking-widest font-mono text-primary font-bold">Need · what I actually require</p>
            <p className="slide-subtitle text-foreground">Social Energy</p>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm font-mono text-muted-foreground">Usual — what you see</p>
                <p className="text-3xl md:text-4xl font-display font-bold text-foreground/70">84</p>
              </div>
              <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-foreground/40 rounded-full transition-all duration-1000" style={{ width: shown(3) ? "84%" : "0%" }} />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm font-mono text-primary">Need — what I require to recharge</p>
                <p className="text-3xl md:text-4xl font-display font-bold text-primary">27</p>
              </div>
              <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: shown(3) ? "27%" : "0%" }} />
              </div>
            </div>

            <p className="slide-body font-display italic text-foreground border-t border-primary/30 pt-3">
              "I look outgoing. I need quiet to come back."
            </p>
          </div>
        </div>

        {shown(4) && (
          <p className="text-center slide-body text-foreground animate-fade-in pt-1">
            Qualities describe. <span className="text-primary italic">Needs direct.</span>
          </p>
        )}

        <Dots />
      </div>
      <ScriptOverlay />
    </div>
  );
};
