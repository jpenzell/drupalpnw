import { MessageSquare, HelpCircle } from "lucide-react";

export const LanguageBridgeScreen = () => {
  return (
    <div className="flex-1 flex flex-col animate-slide-in">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          {/* The Setup */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full">
              <HelpCircle className="h-5 w-5 text-accent" />
              <span className="text-accent font-semibold text-lg">But wait...</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              It's not just <span className="text-primary">how</span> it thinks.
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              It's <span className="text-accent">what</span> it's trained on.
            </h2>
          </div>

          {/* The Key Insight */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30 rounded-2xl p-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <MessageSquare className="h-12 w-12 text-primary" />
              <span className="text-5xl md:text-6xl font-bold text-foreground">
                Large <span className="text-primary">Language</span> Model
              </span>
            </div>
            <p className="text-2xl text-muted-foreground leading-relaxed">
              And language, as we know, is <strong className="text-foreground">subjective</strong>.
            </p>
          </div>

          {/* The Question */}
          <div className="space-y-2">
            <p className="text-xl text-muted-foreground">
              What happens when the same words mean different things to different people?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
