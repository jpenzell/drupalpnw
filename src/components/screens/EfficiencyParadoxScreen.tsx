import { AlertTriangle } from "lucide-react";

export const EfficiencyParadoxScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full mb-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <span className="text-destructive font-semibold text-lg">Critical Warning</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          The Efficiency Paradox
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto font-light">
          Access ≠ Impact: The Productivity J-Curve
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-l-4 border-l-destructive p-8 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            The Productivity J-Curve
          </h3>
          <p className="text-foreground text-lg mb-4 leading-relaxed">
            Bolting AI onto old teaching practices can <strong>multiply confusion</strong> as fast as it creates efficiency.
            Without pedagogical redesign, you're just automating outdated workflows.
          </p>
          <p className="text-primary font-semibold text-lg mb-4">
            → AI multiplies outcomes—good or bad—depending on how you redesign your approach.
          </p>
          <p className="text-muted-foreground text-base leading-relaxed">
            Research on technology adoption in education shows initial productivity <strong>decline</strong> is common. 
            Recovery requires professional development, curriculum redesign, and changed classroom practices—not just access to tools.
          </p>
        </div>

        <div className="bg-accent/10 border-2 border-accent/20 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-accent mb-4 flex items-center gap-2">
            <span className="text-3xl">📊</span>
            Let's Test Your Intuition
          </h3>
          <p className="text-foreground text-xl leading-relaxed">
            Three studies that challenge common assumptions about AI and productivity.
          </p>
        </div>
      </div>
    </div>
  );
};
