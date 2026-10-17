const steps = [
  { n: "01", name: "Principles before tools",   body: "Tools change quarterly. Principles don't." },
  { n: "02", name: "Make rehearsal safe",       body: "Sandbox the work. Reward “I tried it and it flopped.”" },
  { n: "03", name: "Audit the scene",            body: "Watch how AI is used — not just what it does." },
];

export const HRThreeStepsSlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6 py-8">
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary font-semibold">
            L&D's Three Moves
          </p>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground">
            Rigor · Voice · Standards
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground italic">
            A leadership posture, not a checklist.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="rounded-xl border border-border bg-card/60 p-6 space-y-3 hover:border-secondary/60 transition-colors animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p className="text-4xl font-display font-bold text-secondary">{s.n}</p>
              <h3 className="text-2xl font-display font-bold text-foreground leading-tight">
                {s.name}
              </h3>
              <p className="text-lg text-muted-foreground leading-snug">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
