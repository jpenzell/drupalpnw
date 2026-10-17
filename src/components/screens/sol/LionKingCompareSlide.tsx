import { Trophy } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import lionKingPoster from "@/assets/lion-king-musical.jpg";

export const LionKingCompareSlide = () => {
  const { stage, shown } = useReveal(2);

  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in px-12 py-8 min-h-0 overflow-hidden">
      <div className="max-w-7xl w-full grid md:grid-cols-2 gap-16 items-center">
        {/* Left: poster, revealed at stage 2 */}
        <div
          className={`flex justify-center transition-all duration-700 ${
            shown(2) ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <img
            src={lionKingPoster}
            alt="The Lion King Broadway Musical poster"
            width={768}
            height={1024}
            loading="eager"
            decoding="sync"
            // @ts-expect-error fetchpriority is a valid HTML attribute
            fetchpriority="high"
            className="rounded-2xl shadow-2xl max-h-[65vh] w-auto object-contain"
          />
        </div>

        {/* Right: question → reveal */}
        <div className="text-center md:text-left space-y-8">
          <h2 className="slide-subtitle font-display font-light text-foreground leading-tight">
            Highest-grossing<br />
            entertainment title<br />
            <span className="italic text-muted-foreground">of all time?</span>
          </h2>

          {shown(2) && (
            <div className="space-y-5 animate-fade-in">
              <p className="slide-kicker text-muted-foreground">The answer</p>
              <h1 className="slide-title font-display font-bold text-primary spotlight-glow leading-none">
                The Lion King
              </h1>
              <p className="slide-body-lg font-display italic text-foreground">
                the Broadway musical.
              </p>
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-secondary/15 border-2 border-secondary/50 rounded-full">
                <Trophy className="h-5 w-5 text-primary" />
                <p className="slide-chrome font-display text-foreground">
                  <span className="font-bold text-primary">Guinness World Record.</span>{" "}
                  <span className="italic text-muted-foreground">Ever.</span>
                </p>
              </div>
            </div>
          )}

          <div className="flex md:justify-start justify-center gap-2 pt-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  s === stage ? "bg-primary scale-125" : s < stage ? "bg-primary/50" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
