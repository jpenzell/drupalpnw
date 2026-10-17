import { RefreshCw } from "lucide-react";

export const AnthropicFluencyScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 overflow-hidden animate-fade-in">
      <div className="w-full max-w-7xl space-y-10 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-secondary/10 border border-secondary/30 rounded-full">
          <RefreshCw className="h-4 w-4 text-secondary" />
          <span className="slide-kicker text-secondary">Anthropic AI Fluency Index · 2026</span>
        </div>

        <h1 className="slide-title-lg font-display font-bold text-foreground leading-[1.05]">
          Iteration <span className="text-primary">doubles</span><br />
          the quality of AI output.
        </h1>

        <p className="text-[10rem] md:text-[14rem] font-black text-primary leading-none spotlight-glow">
          2×
        </p>

        <p className="slide-body-lg font-display italic text-foreground/80 max-w-4xl mx-auto">
          The skill isn't the prompt. It's the <span className="text-secondary font-semibold not-italic">rehearsal</span>.
        </p>

        <p className="slide-caption text-muted-foreground tracking-widest uppercase">
          9,830 conversations · Anthropic, Feb 2026
        </p>
      </div>
    </div>
  );
};
