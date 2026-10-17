import { Users, MessageSquare } from "lucide-react";

export const AIBiasScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-in px-8">
      <div className="max-w-5xl w-full space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            That's Why <span className="text-primary">Critical Thinking</span> Matters
          </h1>
          <p className="text-2xl text-muted-foreground">
            Use AI as a <span className="font-semibold text-foreground">thought partner</span>, not a decision maker
          </p>
        </div>

        {/* Side by Side Comparison */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Wrong Way */}
          <div className="bg-destructive/5 border-2 border-destructive/30 p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
              <p className="text-xl font-bold text-destructive">Treating AI as Expert</p>
            </div>
            <div className="bg-background/80 rounded-xl p-4 mb-4">
              <p className="text-lg text-foreground italic">
                "Create a lesson plan for teaching fractions."
              </p>
            </div>
            <p className="text-lg text-muted-foreground">
              → Accept first output
            </p>
            <p className="text-destructive font-semibold mt-4">
              You miss biases and better approaches
            </p>
          </div>

          {/* Right Way */}
          <div className="bg-primary/5 border-2 border-primary/30 p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xl font-bold text-primary">Using AI as Thought Partner</p>
            </div>
            <div className="bg-background/80 rounded-xl p-4 mb-4">
              <p className="text-lg text-foreground italic">
                "What assumptions am I making? What might I be missing? Show me 3 approaches."
              </p>
            </div>
            <p className="text-lg text-muted-foreground">
              → Explore, challenge, iterate
            </p>
            <p className="text-primary font-semibold mt-4">
              You leverage AI while applying your expertise
            </p>
          </div>
        </div>

        {/* Takeaway */}
        <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="h-8 w-8 text-accent" />
            <h3 className="text-2xl font-bold text-accent">The Honest Takeaway</h3>
          </div>
          <p className="text-xl text-foreground max-w-3xl mx-auto">
            We don't fully understand bias—in AI <em>or</em> in ourselves. 
            That's why you can't just "prompt correctly" and be done.
          </p>
          <p className="text-lg text-muted-foreground mt-4">
            Use AI to expose your blind spots—because both you and the AI have them.
          </p>
        </div>
      </div>
    </div>
  );
};
