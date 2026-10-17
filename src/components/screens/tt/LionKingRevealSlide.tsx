import lionKingPoster from "@/assets/lion-king-musical.jpg";

export const LionKingRevealSlide = () => {
  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in px-8">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
        <div className="flex justify-center">
          <img
            src={lionKingPoster}
            alt="The Lion King Broadway Musical poster"
            width={768}
            height={1024}
            loading="eager"
            decoding="sync"
            // @ts-expect-error fetchpriority is a valid HTML attribute
            fetchpriority="high"
            className="rounded-2xl shadow-2xl max-h-[70vh] w-auto object-contain"
          />
        </div>
        <div className="text-center md:text-left space-y-4">
          <p className="slide-kicker text-muted-foreground">The answer</p>
          <h1 className="slide-title-lg font-display font-bold text-secondary spotlight-glow leading-tight">
            The Lion King
          </h1>
        </div>
      </div>
    </div>
  );
};
