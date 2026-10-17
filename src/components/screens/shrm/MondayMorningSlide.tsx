export const MondayMorningSlide = () => {
  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in px-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <p className="text-sm uppercase tracking-[0.3em] text-secondary font-semibold">
          Your One Move
        </p>
        <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground leading-tight">
          Monday morning,
          <span className="block text-primary">what's the one thing</span>
          <span className="block text-foreground">you'll do differently?</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground italic font-light">
          One conversation. One experiment. One observable shift.
        </p>
      </div>
    </div>
  );
};
