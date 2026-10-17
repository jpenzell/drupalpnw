import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

export const CorePrinciplesScreen = () => {
  const principles = [
    "Always review AI outputs—fluent ≠ true",
    "Use AI to draft; humans decide",
    "Audit & measure for bias regularly",
    "Design for the inside-frontier tasks",
    "Process redesign unlocks AI gains",
    "Build capacity through champions",
  ];

  return (
    <div className="flex-1 flex flex-col justify-center space-y-12 animate-slide-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full mb-4">
          <BookOpen className="h-5 w-5 text-secondary" />
          <span className="text-secondary font-semibold text-lg">Guiding Principles</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Core Principles
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
          Six essential principles to guide your AI leadership journey
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {principles.map((principle, index) => (
            <Card
              key={index}
              className="p-8 hover:shadow-xl transition-all border-2 border-primary/20"
            >
              <div className="flex gap-6 items-center">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">{index + 1}</span>
                </div>
                <span className="text-foreground font-semibold text-xl leading-relaxed">{principle}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-secondary/5 to-primary/5 border-2 border-secondary/20 rounded-2xl p-8 max-w-4xl mx-auto">
        <p className="text-foreground text-xl leading-relaxed text-center">
          These principles aren't rules to memorize—they're guardrails to help you 
          navigate the complexity of AI with wisdom and care.
        </p>
      </div>
    </div>
  );
};
