import { Users, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";

export const MindsetFluidIdentitiesScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center overflow-hidden">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 glass-effect rounded-full mb-4">
            <span className="text-3xl font-black text-primary">D</span>
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Fluid Identities
          </h1>
          <p className="text-2xl text-primary font-semibold">
            Give AI a role to get a better response
          </p>
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <h3 className="text-lg font-bold text-muted-foreground mb-3">From the Demos</h3>
            <p className="text-xl text-foreground leading-relaxed">
              For 19 Crimes, we asked AI to think like a 
              <strong className="text-primary"> competitor's brand strategist</strong>—not just a helpful assistant.
            </p>
            <p className="text-base text-muted-foreground mt-4">
              A Director casts specific roles. "You're a skeptical buyer" gets different insights than "You're an AI."
            </p>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20">
            <h3 className="text-lg font-bold text-muted-foreground mb-3">The Artistic Lens</h3>
            <p className="text-xl text-foreground leading-relaxed">
              Actors don't just "act"—they <strong className="text-accent">embody a character's worldview</strong> and respond from that perspective.
            </p>
            <p className="text-base text-muted-foreground mt-4">
              Cast your AI. "You are a Kroger category manager" unlocks different thinking.
            </p>
          </Card>
        </div>

        {/* Takeaway */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Quote className="h-6 w-6 text-primary/50" />
          <p className="text-xl text-muted-foreground italic">
            "Don't ask 'the AI'—ask a specific character with a specific perspective"
          </p>
        </div>
      </div>
    </div>
  );
};
