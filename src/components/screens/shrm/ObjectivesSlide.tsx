const objectives = [
  "Spot the fear & fatigue stalling AI work.",
  "Name three moves that hold rigor, voice, and standards.",
  "Pick one shift that coaches curiosity, not compliance.",
  "Direct the work — don't just deploy the tool.",
];

export const ObjectivesSlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6 py-8">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary font-semibold">
            What you'll leave with
          </p>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground">
            The Run of Show
          </h2>
        </div>

        <div className="space-y-3">
          {objectives.map((o, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-border bg-card/60 p-5 animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-3xl font-display font-bold text-secondary shrink-0 w-12">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-2xl md:text-3xl text-foreground leading-snug">{o}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
