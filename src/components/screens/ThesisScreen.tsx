import { RotateCcw } from "lucide-react";

export const ThesisScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-4xl mx-auto px-4 text-center space-y-8">
        {/* First Principles Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-secondary/10 border border-secondary/30 rounded-full">
          <RotateCcw className="h-4 w-4 text-secondary" />
          <span className="text-secondary font-semibold tracking-wide text-sm uppercase">
            First Principles
          </span>
        </div>

        {/* Core Statement */}
        <div className="space-y-6">
          <p className="text-xl md:text-2xl text-muted-foreground">
            To understand the most complex technology ever created...
          </p>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              We go back to basics.
            </span>
          </h1>
        </div>

        <p className="text-lg text-muted-foreground/60">
          (Zoox did it. Worked out pretty well.)
        </p>
      </div>
    </div>
  );
};
