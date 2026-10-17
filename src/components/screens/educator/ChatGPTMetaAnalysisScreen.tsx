import { Brain } from "lucide-react";

export const ChatGPTMetaAnalysisScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-in px-4">
      <div className="max-w-5xl w-full text-center space-y-8">
        {/* Source Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full">
          <Brain className="h-4 w-4 text-secondary" />
          <span className="text-sm font-medium text-secondary">Nature Meta-Analysis • 2025</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-foreground">
          ChatGPT & Student Learning
        </h1>

        {/* The Core Tension */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-green-500/10 border-2 border-green-500/30 rounded-2xl p-8">
            <p className="text-4xl md:text-5xl font-black text-green-500 mb-2">Gains</p>
            <p className="text-lg text-foreground">
              Performance improved<br />
              Students felt supported
            </p>
          </div>

          <div className="bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-8">
            <p className="text-4xl md:text-5xl font-black text-destructive mb-2">Risks</p>
            <p className="text-lg text-foreground">
              Critical thinking decline<br />
              Over-reliance on AI
            </p>
          </div>
        </div>

        {/* Key Insight - Hero */}
        <div className="bg-gradient-to-r from-secondary/10 to-primary/10 border-2 border-secondary/30 rounded-2xl p-8 max-w-3xl mx-auto">
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            The outcome depends on <span className="text-secondary">how</span> students use AI
          </p>
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <p className="text-destructive font-bold text-lg">Passive Use</p>
              <p className="text-sm text-muted-foreground">Copy-paste → Skill loss</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="text-green-500 font-bold text-lg">Active Collaboration</p>
              <p className="text-sm text-muted-foreground">Question & verify → Growth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
