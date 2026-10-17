/**
 * S2a — Bridge between hairstyle exercise and team metaphor.
 * Static slide. No builds. Presenter delivers the contrast verbally.
 */
export const HairstyleBridgeSlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 animate-fade-in">
      <div className="w-full max-w-5xl mx-auto space-y-10 text-center">
        <h1 className="font-display font-bold leading-[1.05] text-foreground text-5xl md:text-7xl lg:text-8xl">
          "How are you?"
          <span className="block text-muted-foreground/70 italic mt-4">
            "Fine."
          </span>
        </h1>

        <p className="text-3xl md:text-5xl font-display font-bold text-primary italic">
          A metaphor tells the truth.
        </p>
      </div>
    </div>
  );
};
