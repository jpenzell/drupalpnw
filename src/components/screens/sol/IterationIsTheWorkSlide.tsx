import { useReveal } from "@/hooks/useReveal";

/**
 * A3-3-2c — Iteration is the work. The first take is a draft, not the scene.
 * Directors run the scene again with a new adjustment. Same with AI.
 */
export const IterationIsTheWorkSlide = () => {
  const { shown, Dots } = useReveal(4);

  const Take = ({
    n,
    note,
    glow,
    visible,
  }: {
    n: number;
    note: string;
    glow?: boolean;
    visible: boolean;
  }) => (
    <div
      className={`flex flex-col items-center gap-2 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <div
        className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-2 flex items-center justify-center font-display text-3xl md:text-4xl ${
          glow
            ? "border-primary text-primary spotlight-glow"
            : "border-muted-foreground/40 text-muted-foreground"
        }`}
      >
        {n}
      </div>
      <p className="text-xs md:text-sm font-mono text-muted-foreground text-center max-w-[140px]">
        {note}
      </p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-6">
      <div className="max-w-5xl w-full space-y-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary font-bold">
          Iteration is the work
        </p>
        <h1 className="text-3xl md:text-5xl font-display font-light text-foreground leading-tight">
          The first take is a <span className="italic text-muted-foreground">draft.</span>
          <br />
          Not the scene.
        </h1>

        <div className="flex items-center justify-center gap-6 md:gap-10 pt-2">
          <Take n={1} note="Read it cold." visible={shown(1)} />
          <span className="text-2xl text-muted-foreground/40">→</span>
          <Take n={2} note="One adjustment." visible={shown(2)} />
          <span className="text-2xl text-muted-foreground/40">→</span>
          <Take n={3} note="Tighter. Sharper." visible={shown(3)} />
        </div>

        {shown(4) && (
          <p className="text-xl md:text-2xl font-display italic text-muted-foreground animate-fade-in pt-2 max-w-3xl mx-auto">
            One prompt is a guess. Three is a rehearsal.
            <br />
            <span className="text-foreground not-italic">
              The director's job is the next note — not the perfect first one.
            </span>
          </p>
        )}

        <Dots />
      </div>
    </div>
  );
};
