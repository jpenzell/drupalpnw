export const PurposefulMetaphorSlide = () => {
  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in">
      <div className="max-w-4xl mx-auto text-center space-y-8 px-4">
        <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground leading-tight">
          Was your metaphor
          <span className="block text-secondary spotlight-glow">purposeful?</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Did someone <span className="font-semibold text-foreground">direct</span> it?
          <br />
          Or did it just… <span className="italic">happen?</span>
        </p>
      </div>
    </div>
  );
};
