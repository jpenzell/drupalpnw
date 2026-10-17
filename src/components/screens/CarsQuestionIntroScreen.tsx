import { MessageSquare } from "lucide-react";

/**
 * S3a2-q — The one-word question intro.
 * Just the question on screen. The next slide shows the live answers coming in.
 */
export const CarsQuestionIntroScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 animate-fade-in select-none">
      <div className="w-full max-w-7xl mx-auto text-center space-y-12">
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/30 rounded-full">
          <MessageSquare className="h-3.5 w-3.5 text-accent" />
          <span className="text-accent font-semibold tracking-wide text-xs uppercase">
            Round 2 · One-Word Question
          </span>
        </div>

        <h1 className="slide-title-lg font-display font-bold leading-[1.05] text-foreground">
          How many <span className="text-primary italic">elephants</span> could fit inside{" "}
          <span className="text-primary">U.S. Bank Stadium?</span>
        </h1>

        <p className="slide-caption text-muted-foreground max-w-3xl mx-auto">
          Same one-word format as Round 1 — but this time there's a real answer.
        </p>
      </div>
    </div>
  );
};
