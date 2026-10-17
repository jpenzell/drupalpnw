import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export const SixViewpointsScreen = () => {
  const viewpoints = [
    { id: "A", title: "Probabilistic Thinking", icon: "🎲" },
    { id: "B", title: "Conversational Curiosity", icon: "💬" },
    { id: "C", title: "Metacognitive Reflection", icon: "🤔" },
    { id: "D", title: "Fluid Identities", icon: "🎭" },
    { id: "E", title: "Abundance Curation", icon: "📸" },
    { id: "F", title: "Develop & Delegate", icon: "🎯" },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center space-y-12 animate-slide-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full mb-4">
          <Sparkles className="h-5 w-5 text-accent" />
          <span className="text-accent font-semibold text-lg">Framework Summary</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          The Six Viewpoints
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
          Your AI leadership framework—six lenses to refract every AI decision
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {viewpoints.map((vp) => (
            <Card 
              key={vp.id} 
              className="p-8 text-center hover:shadow-xl transition-all bg-gradient-to-br from-background to-primary/5 border-2 border-primary/20"
            >
              <div className="text-6xl mb-4">{vp.icon}</div>
              <div className="text-3xl font-bold text-primary mb-3">{vp.id}</div>
              <h3 className="text-xl font-bold text-foreground">{vp.title}</h3>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-2xl p-8 max-w-4xl mx-auto">
        <p className="text-foreground text-xl leading-relaxed text-center">
          These six viewpoints connect everything we've covered—use them as lenses 
          to approach any AI use case with confidence and critical thinking.
        </p>
      </div>
    </div>
  );
};
