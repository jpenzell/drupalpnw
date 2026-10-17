import { Layers, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";

export const MindsetAbundanceScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center overflow-hidden">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 glass-effect rounded-full mb-4">
            <span className="text-3xl font-black text-primary">E</span>
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Abundance Curation
          </h1>
          <p className="text-2xl text-primary font-semibold">
            Generate many, curate the best
          </p>
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <h3 className="text-lg font-bold text-muted-foreground mb-3">From the Demos</h3>
            <p className="text-xl text-foreground leading-relaxed">
              For scenario planning, we asked for <strong className="text-primary">multiple framings</strong> of the Memorial Day decision—then picked the most useful lens.
            </p>
            <p className="text-base text-muted-foreground mt-4">
              A Director runs the scene multiple ways before choosing the final take.
            </p>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20">
            <h3 className="text-lg font-bold text-muted-foreground mb-3">The Artistic Lens</h3>
            <p className="text-xl text-foreground leading-relaxed">
              Rehearsal is about <strong className="text-accent">exploring options</strong>, not finding the "right" answer immediately.
            </p>
            <p className="text-base text-muted-foreground mt-4">
              AI is cheap and fast. Ask for 5 versions. Then be the curator.
            </p>
          </Card>
        </div>

        {/* Takeaway */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Quote className="h-6 w-6 text-primary/50" />
          <p className="text-xl text-muted-foreground italic">
            "Your job isn't to take the first answer—it's to curate from abundance"
          </p>
        </div>
      </div>
    </div>
  );
};
