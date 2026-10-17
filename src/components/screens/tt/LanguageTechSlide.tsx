export const LanguageTechSlide = () => {
  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in">
      <div className="max-w-4xl mx-auto text-center space-y-8 px-4">
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
          The same word means different things to different people.
          <br />
          That's not a flaw. <span className="font-semibold text-foreground">That's how humans work.</span>
        </p>

        <div className="py-4">
          <div className="w-24 h-px bg-secondary/40 mx-auto" />
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight">
          And now we've built our most powerful technology
          <span className="block text-primary mt-2">on top of language.</span>
        </h1>

        <p className="text-lg text-muted-foreground/70">
          Not logic. Not process. <span className="text-accent font-semibold">Language.</span>
        </p>
      </div>
    </div>
  );
};
