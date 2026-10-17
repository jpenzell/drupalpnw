export const MicrosoftDeskillStudyScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 overflow-hidden animate-fade-in">
      <div className="w-full max-w-7xl space-y-12 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Microsoft Research · 2025
        </p>

        <h1 className="text-6xl md:text-8xl font-display font-bold text-foreground leading-[1.05]">
          Skills <span className="text-primary">atrophy</span>.
        </h1>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="text-left md:text-right md:pr-8 md:border-r-2 md:border-primary/20">
            <p className="text-2xl md:text-3xl font-display text-foreground/80 leading-snug">
              Clinicians using AI lost diagnostic accuracy in <span className="text-primary font-semibold">three months</span>.
            </p>
          </div>
          <div className="text-left md:pl-8">
            <p className="text-2xl md:text-3xl font-display text-foreground/80 leading-snug">
              The decline <span className="text-primary font-semibold">stayed</span> after the AI was taken away.
            </p>
          </div>
        </div>

        <p className="text-3xl md:text-4xl font-display italic text-foreground">
          Use it as a crutch, lose the muscle.
        </p>
      </div>
    </div>
  );
};
