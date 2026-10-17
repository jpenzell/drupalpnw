import { Film, Drama } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

export const FilmVsTheaterSlide = () => {
  const { shown, Dots } = useReveal(3);
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 overflow-hidden animate-fade-in">
      <div className="w-full max-w-7xl space-y-12">
        <h1 className="slide-title font-display font-bold text-center text-foreground leading-tight">
          Why does the <span className="text-secondary">stage</span> outperform the <span className="text-primary/80">screen</span>?
        </h1>

        <div className="grid grid-cols-2 gap-12 items-stretch">
          {/* Film */}
          <div className={`bg-card border-2 border-muted rounded-2xl p-10 text-center space-y-5 transition-all duration-500 ${shown(1) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="w-20 h-20 mx-auto rounded-full bg-muted/40 flex items-center justify-center">
              <Film className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="slide-body-lg font-bold text-foreground">Film</p>
            <p className="slide-body font-display italic text-muted-foreground">Fixed.</p>
            <p className="slide-caption text-foreground/70">Shot once. Locked forever.</p>
          </div>

          {/* Theater */}
          <div className={`bg-card border-2 border-secondary/40 rounded-2xl p-10 text-center space-y-5 shadow-lg transition-all duration-500 ${shown(2) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="w-20 h-20 mx-auto rounded-full bg-secondary/15 flex items-center justify-center">
              <Drama className="h-10 w-10 text-secondary" />
            </div>
            <p className="slide-body-lg font-bold text-foreground">Theater</p>
            <p className="slide-body font-display italic text-secondary">Performed.</p>
            <p className="slide-caption text-foreground/80">Rehearsed daily. Alive every night.</p>
          </div>
        </div>

        {shown(3) && (
          <p className="slide-body-lg text-center font-display italic text-foreground animate-fade-in">
            Working with AI isn't a film. It's a <span className="text-secondary">performance</span>.
          </p>
        )}

        <Dots />
      </div>
    </div>
  );
};
