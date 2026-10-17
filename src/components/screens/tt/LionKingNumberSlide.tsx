import { Award } from "lucide-react";

export const LionKingNumberSlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
      <div className="max-w-5xl mx-auto text-center space-y-8 px-4">
        <h1 className="text-7xl md:text-9xl font-display font-bold text-secondary spotlight-glow">
          $9.1B
        </h1>

        <div className="flex items-center justify-center gap-8 text-xl text-muted-foreground">
          <div className="text-center">
            <p className="slide-chrome uppercase tracking-wider text-muted-foreground/60">Film (1994)</p>
            <p className="text-3xl font-bold text-foreground mt-1">~$979M</p>
          </div>
          <div className="text-4xl text-secondary">→</div>
          <div className="text-center">
            <p className="slide-chrome uppercase tracking-wider text-muted-foreground/60">Musical (1997–)</p>
            <p className="text-3xl font-bold text-secondary mt-1">$9.1B</p>
          </div>
        </div>

        <p className="text-2xl text-muted-foreground pt-4">
          Same story. Same songs. <span className="text-accent font-bold">9×.</span>
        </p>

        <a
          href="https://www.guinnessworldrecords.com/world-records/611346-highest-grossing-entertainment-title"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 mt-4 bg-card border border-secondary/40 rounded-full text-sm text-foreground hover:bg-secondary/10 transition-colors"
        >
          <Award className="h-4 w-4 text-secondary" />
          <span>Guinness: highest-grossing entertainment title ever</span>
        </a>
      </div>
    </div>
  );
};
