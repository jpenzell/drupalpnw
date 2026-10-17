export const RehearsalThesisSlide = () => {
  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in px-6">
      <div className="max-w-5xl mx-auto text-center space-y-10">
        <p className="text-sm uppercase tracking-[0.3em] text-secondary font-semibold">
          The Thesis
        </p>
        <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground leading-tight">
          You can't <span className="text-primary">plan</span> your way
          <span className="block">into AI transformation.</span>
        </h1>
        <p className="text-2xl md:text-4xl text-muted-foreground font-display italic">
          You have to <span className="text-accent font-semibold not-italic">rehearse</span> your way in.
        </p>
        <div className="grid md:grid-cols-3 gap-4 pt-6 text-left max-w-4xl mx-auto">
          <div className="rounded-lg border border-border bg-card/60 p-4 text-center">
            <p className="text-xs uppercase tracking-widest text-secondary mb-1">Small</p>
            <p className="text-sm text-foreground">Safe experiments over perfect plans.</p>
          </div>
          <div className="rounded-lg border border-border bg-card/60 p-4 text-center">
            <p className="text-xs uppercase tracking-widest text-secondary mb-1">Empathetic</p>
            <p className="text-sm text-foreground">People before platforms.</p>
          </div>
          <div className="rounded-lg border border-border bg-card/60 p-4 text-center">
            <p className="text-xs uppercase tracking-widest text-secondary mb-1">Adaptable</p>
            <p className="text-sm text-foreground">Strategic clarity, not rigid scripts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
