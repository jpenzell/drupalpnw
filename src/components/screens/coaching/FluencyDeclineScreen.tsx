export const FluencyDeclineScreen = () => {
  const four = ["Delegate", "Describe", "Discern", "Diligence"];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 overflow-hidden animate-fade-in">
      <div className="w-full max-w-7xl space-y-14 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Anthropic · AI Fluency
        </p>

        <h1 className="text-6xl md:text-8xl font-display font-bold text-foreground leading-[1.05]">
          Speed feels like <span className="text-primary">fluency</span>.
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {four.map((word, i) => (
            <span key={word} className="flex items-center gap-10">
              <span className="text-3xl md:text-5xl font-display text-foreground/80">
                {word}
              </span>
              {i < four.length - 1 && (
                <span className="text-3xl md:text-5xl text-primary/40">·</span>
              )}
            </span>
          ))}
        </div>

        <p className="text-3xl md:text-4xl font-display italic text-foreground/80">
          Rush, and you skip all four.
        </p>
      </div>
    </div>
  );
};
