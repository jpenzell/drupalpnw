export const FearFatigueSlide = () => {
  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in px-6">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-border bg-card/60 p-10 space-y-5">
          <p className="text-base uppercase tracking-[0.3em] text-secondary font-semibold">Fear sounds like</p>
          <ul className="space-y-4 text-foreground text-3xl font-display leading-snug">
            <li>“I'm not technical enough.”</li>
            <li>“What if my team finds out?”</li>
            <li>“Am I cheating?”</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-10 space-y-5">
          <p className="text-base uppercase tracking-[0.3em] text-accent font-semibold">Fatigue sounds like</p>
          <ul className="space-y-4 text-foreground text-3xl font-display leading-snug">
            <li>“Just tell me the tool.”</li>
            <li>“Lean. Agile. Now this.”</li>
            <li>“I'll deal with it after Q4.”</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
