import { Shuffle, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";

export const MindsetProbabilisticScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center overflow-hidden">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 glass-effect rounded-full mb-4">
            <span className="text-3xl font-black text-primary">A</span>
            <Shuffle className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Probabilistic Thinking
          </h1>
          <p className="text-2xl text-primary font-semibold">
            AI predicts—it doesn't know
          </p>
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <h3 className="text-lg font-bold text-muted-foreground mb-3">From the Demos</h3>
            <p className="text-xl text-foreground leading-relaxed">
              When AI suggested rosé pricing strategies, those weren't facts—they were 
              <strong className="text-primary"> pattern predictions</strong> based on training data.
            </p>
            <p className="text-base text-muted-foreground mt-4">
              A Director doesn't take the first read as gospel. They verify.
            </p>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20">
            <h3 className="text-lg font-bold text-muted-foreground mb-3">The Artistic Lens</h3>
            <p className="text-xl text-foreground leading-relaxed">
              In rehearsal, actors try multiple interpretations. 
              <strong className="text-accent"> Nothing is "right" until you test it.</strong>
            </p>
            <p className="text-base text-muted-foreground mt-4">
              AI gives you options—you decide which ones hold up under scrutiny.
            </p>
          </Card>
        </div>

        {/* Takeaway */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Quote className="h-6 w-6 text-primary/50" />
          <p className="text-xl text-muted-foreground italic">
            "Verify before you trust—fluent doesn't mean true"
          </p>
        </div>
      </div>
    </div>
  );
};
