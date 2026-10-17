export const TheaterThinkIntroSlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-4">
      <div className="max-w-3xl mx-auto w-full space-y-8 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          TheaterThink<span className="text-secondary">®</span>
        </h2>
        <p className="text-xl text-muted-foreground leading-relaxed">
          is what happens when you bring that language in{" "}
          <span className="text-foreground font-semibold">mindfully</span> and{" "}
          <span className="text-foreground font-semibold">purposefully</span>.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed">
          I built a framework around it.
        </p>
        <p className="text-xl text-foreground font-display font-semibold">
          Four lenses. Not a cycle. Not a checklist.
        </p>
      </div>
    </div>
  );
};
