import { Sparkles } from "lucide-react";

export const BenefitsIntroScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          When Used as a Thought Partner
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
          AI + Critical Thinking = Powerful Results
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-2xl p-10 shadow-xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                The Right Approach Unlocks Real Benefits
              </h2>
              <p className="text-muted-foreground text-lg italic">Research shows measurable improvements</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-foreground text-2xl leading-relaxed">
              We've covered the risks—hallucination, bias, over-trust. But when you use AI with 
              <strong> conversation and critical thinking</strong>, the research shows compelling benefits.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="bg-primary/10 border-2 border-primary/20 p-6 rounded-xl">
                <p className="font-bold text-primary mb-2 text-xl">More Empathetic</p>
                <p className="text-foreground">AI-assisted responses rated higher in compassion</p>
              </div>

              <div className="bg-accent/10 border-2 border-accent/20 p-6 rounded-xl">
                <p className="font-bold text-accent mb-2 text-xl">More Creative</p>
                <p className="text-foreground">AI thought partnership enhances ideation</p>
              </div>

              <div className="bg-secondary/10 border-2 border-secondary/20 p-6 rounded-xl">
                <p className="font-bold text-secondary mb-2 text-xl">Better Thinking</p>
                <p className="text-foreground">Metacognition improves with AI dialogue</p>
              </div>
            </div>

            <div className="bg-accent/10 border-l-4 border-accent rounded-xl p-6 mt-8">
              <p className="text-foreground text-xl leading-relaxed">
                <strong>The key?</strong> Don't use AI to <em>replace</em> your thinking. 
                Use it to <em>enhance</em> your thinking through conversation and reflection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
