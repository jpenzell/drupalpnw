import { AlertTriangle, Quote } from "lucide-react";

export const HallucinationExplainerScreen = () => {
  return (
    <div className="flex-1 flex flex-col animate-slide-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full mb-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <span className="text-destructive font-semibold text-lg">Critical Understanding</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          Why AI Gets Things Wrong
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Quote */}
          <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30 rounded-2xl p-10">
            <Quote className="absolute top-6 left-6 h-12 w-12 text-primary/20" />
            <blockquote className="text-3xl md:text-4xl font-bold text-foreground leading-tight text-center pt-6">
              "AI doesn't know things.<br />
              <span className="text-primary">It predicts what comes next.</span>"
            </blockquote>
            <p className="text-center text-muted-foreground mt-6 text-lg">
              — The fundamental difference between knowledge and pattern matching
            </p>
          </div>

          {/* Simple Takeaway */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
              <p className="text-2xl font-bold text-green-600 mb-2">"Paris is the capital of France"</p>
              <p className="text-muted-foreground">Pattern matches reality ✓</p>
            </div>
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center">
              <p className="text-2xl font-bold text-destructive mb-2">"47,000 elephants fit in the Superdome"</p>
              <p className="text-muted-foreground">Pattern sounds plausible ✗</p>
            </div>
          </div>

          {/* Bottom Line */}
          <div className="text-center">
            <p className="text-xl text-foreground font-semibold">
              <span className="text-primary">Your job:</span> Bring the expertise AI doesn't have.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
