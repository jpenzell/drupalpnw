import { Sparkles } from "lucide-react";

export const GongLabsTransitionScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-8 overflow-hidden">
      <div className="max-w-4xl mx-auto w-full text-center space-y-8">
        <p className="text-base text-muted-foreground uppercase tracking-widest">
          Gong Labs • 1M+ Opportunities
        </p>
        
        <div className="inline-block bg-destructive/10 border-2 border-destructive/30 rounded-2xl px-12 py-8">
          <p className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3 justify-center">
            <Sparkles className="h-8 w-8 text-destructive" />
            But did time savings translate to more wins?
          </p>
        </div>

        <p className="text-xl text-muted-foreground">
          Let's find out…
        </p>
      </div>
    </div>
  );
};
