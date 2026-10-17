import { MessageSquare, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";

export const MindsetCuriosityScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center overflow-hidden">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 glass-effect rounded-full mb-4">
            <span className="text-3xl font-black text-primary">B</span>
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Conversational Curiosity
          </h1>
          <p className="text-2xl text-primary font-semibold">
            Better questions → better answers
          </p>
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <h3 className="text-lg font-bold text-muted-foreground mb-3">From the Demos</h3>
            <p className="text-xl text-foreground leading-relaxed">
              The Kroger prep started broad: "What should I know?" Then we 
              <strong className="text-primary"> followed the threads</strong>—asking "why?" and "what else?"
            </p>
            <p className="text-base text-muted-foreground mt-4">
              A Director doesn't accept the first answer. They probe deeper.
            </p>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20">
            <h3 className="text-lg font-bold text-muted-foreground mb-3">The Artistic Lens</h3>
            <p className="text-xl text-foreground leading-relaxed">
              Great directors ask <strong className="text-accent">"What's the motivation here?"</strong> over and over.
            </p>
            <p className="text-base text-muted-foreground mt-4">
              AI rewards the same curiosity. The conversation IS the work.
            </p>
          </Card>
        </div>

        {/* Takeaway */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Quote className="h-6 w-6 text-primary/50" />
          <p className="text-xl text-muted-foreground italic">
            "Don't ask once—keep asking until you find what you didn't know to look for"
          </p>
        </div>
      </div>
    </div>
  );
};
