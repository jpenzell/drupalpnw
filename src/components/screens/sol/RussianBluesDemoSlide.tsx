export const RussianBluesDemoSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6">
    <div className="max-w-5xl w-full space-y-14 text-center">
      <div className="flex items-center justify-center gap-16">
        <div className="space-y-4">
          <div
            className="w-64 h-64 md:w-72 md:h-72 rounded-2xl shadow-large"
            style={{ background: "hsl(205 75% 70%)" }}
          />
          <p className="font-mono text-secondary slide-caption">goluboy</p>
        </div>
        <div className="space-y-4">
          <div
            className="w-64 h-64 md:w-72 md:h-72 rounded-2xl shadow-large"
            style={{ background: "hsl(220 80% 38%)" }}
          />
          <p className="font-mono text-secondary slide-caption">siniy</p>
        </div>
      </div>

      <p className="slide-subtitle text-foreground font-display">
        <span className="text-primary font-bold">124&nbsp;ms</span> faster.
      </p>
    </div>
  </div>
);
