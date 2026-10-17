export const CoachingLeadersSlide = () => {
  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in px-6">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-stretch">
        <div className="rounded-2xl border border-border bg-card/60 p-10 space-y-5">
          <p className="text-base uppercase tracking-[0.3em] text-muted-foreground font-semibold">
            Stop performing
          </p>
          <h3 className="text-4xl font-display font-bold text-foreground leading-tight">Confidence they don't have</h3>
          <ul className="space-y-3 text-2xl text-muted-foreground leading-snug">
            <li>• “We have a clear AI strategy.”</li>
            <li>• “Just use it more.”</li>
            <li>• Avoiding the room.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-secondary/40 bg-secondary/5 p-10 space-y-5">
          <p className="text-base uppercase tracking-[0.3em] text-secondary font-semibold">
            Start modeling
          </p>
          <h3 className="text-4xl font-display font-bold text-foreground leading-tight">Curiosity, out loud</h3>
          <ul className="space-y-3 text-2xl text-foreground leading-snug">
            <li>• “Here's what I tried. It flopped.”</li>
            <li>• “I don't know yet — let's rehearse.”</li>
            <li>• Share the prompt, not just the result.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
