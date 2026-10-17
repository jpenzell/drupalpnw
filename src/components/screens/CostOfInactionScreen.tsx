const stats = [
  {
    figure: "+50%",
    label: "Win rate",
    detail: "Sales teams using AI to optimize actions",
    source: "Gong Labs",
  },
  {
    figure: "20–30%",
    label: "Productivity gap",
    detail: "Non-adopters vs. companies that pushed through the dip",
    source: "McKinsey · 2024",
  },
  {
    figure: "30 yrs",
    label: "Electricity payoff",
    detail: "Factories had to redesign workflows — those that didn't went bankrupt",
    source: "Paul David",
  },
];

export const CostOfInactionScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 overflow-hidden animate-fade-in">
      <div className="w-full max-w-7xl space-y-10 text-center">
        <p className="slide-caption text-base uppercase tracking-[0.3em] text-muted-foreground font-semibold">
          The cost of doing nothing
        </p>

        <h1 className="slide-title-lg font-display font-bold text-foreground leading-[1.05]">
          The dip is the <span className="text-primary">tuition</span>.
        </h1>

        <p className="slide-body-lg font-display text-foreground/85 max-w-5xl mx-auto leading-snug">
          Skip it, and you pay more later — in talent, trust, and time.
        </p>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto pt-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center space-y-3">
              <p className="slide-title-lg font-display font-bold text-primary leading-none">
                {s.figure}
              </p>
              <p className="slide-body-lg font-semibold text-foreground">
                {s.label}
              </p>
              <p className="slide-caption text-foreground/80 leading-snug max-w-sm mx-auto">
                {s.detail}
              </p>
              <p className="text-sm md:text-base uppercase tracking-widest text-muted-foreground font-semibold pt-2">
                {s.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
