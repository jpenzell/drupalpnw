import { Brain, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";

export const MindsetMetacognitiveScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center overflow-hidden">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 glass-effect rounded-full mb-4">
            <span className="text-3xl font-black text-primary">C</span>
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Metacognitive Reflection
          </h1>
          <p className="text-2xl text-primary font-semibold">
            Think about how you're thinking
          </p>
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <h3 className="text-lg font-bold text-muted-foreground mb-3">From the Demos</h3>
            <p className="text-xl text-foreground leading-relaxed">
              In the promo analysis, we didn't just ask for answers—we asked AI to 
              <strong className="text-primary"> structure our thinking</strong> before diving into data.
            </p>
            <p className="text-base text-muted-foreground mt-4">
              A Director steps back to see the whole production, not just individual scenes.
            </p>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20">
            <h3 className="text-lg font-bold text-muted-foreground mb-3">The Artistic Lens</h3>
            <p className="text-xl text-foreground leading-relaxed">
              Rehearsal includes <strong className="text-accent">"table work"</strong>—stepping back to discuss themes, motivations, and arc.
            </p>
            <p className="text-base text-muted-foreground mt-4">
              Use AI for table work. "Am I even asking the right question?"
            </p>
          </Card>
        </div>

        {/* Takeaway */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Quote className="h-6 w-6 text-primary/50" />
          <p className="text-xl text-muted-foreground italic">
            "Before asking AI for answers, ask it to help you think about the problem"
          </p>
        </div>
      </div>
    </div>
  );
};
