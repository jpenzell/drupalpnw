import { AlertCircle } from "lucide-react";

export const PromptingIsTheProblemSlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 overflow-hidden animate-fade-in">
      <div className="text-center space-y-8 max-w-5xl">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 border border-primary/30 rounded-full">
          <AlertCircle className="h-5 w-5 text-primary" />
          <span className="text-primary font-semibold text-sm tracking-widest uppercase">
            The Real Issue
          </span>
        </div>

        <h1 className="slide-title-lg font-display font-bold text-foreground leading-tight spotlight-glow">
          Prompting is <span className="text-primary">the problem</span>.
        </h1>
      </div>
    </div>
  );
};
