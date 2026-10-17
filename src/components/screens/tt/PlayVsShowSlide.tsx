export const PlayVsShowSlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-4">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center">
          Every initiative has two layers.
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6 space-y-3">
            <h3 className="text-xl font-display font-bold text-foreground">
              THE PLAY
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              The initiative as written. The plan. The project.
            </p>
          </div>
          <div className="rounded-xl border border-secondary/40 bg-secondary/5 backdrop-blur-sm p-6 space-y-3">
            <h3 className="text-xl font-display font-bold text-secondary">
              THE SHOW
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              The pattern people are actually living. The thing nobody named yet.
            </p>
          </div>
        </div>

        <p className="text-center text-lg text-muted-foreground">
          Let's map one together.
        </p>
      </div>
    </div>
  );
};
