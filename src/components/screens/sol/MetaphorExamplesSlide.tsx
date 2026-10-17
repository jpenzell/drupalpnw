export const MetaphorExamplesSlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6 py-8">
      <div className="w-full max-w-5xl space-y-16 text-center">
        <p className="slide-body-lg font-display italic text-foreground/80">
          "It's in the <span className="text-primary not-italic font-semibold">favor bank.</span>"
        </p>

        <h1 className="slide-title">
          Trust becomes <span className="italic text-primary">currency.</span>
        </h1>

        <p className="slide-subtitle text-muted-foreground">
          No bank exists. The metaphor built one.
        </p>
      </div>
    </div>
  );
};
