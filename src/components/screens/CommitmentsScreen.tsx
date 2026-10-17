import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";

export const CommitmentsScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-12 animate-slide-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full mb-4">
          <Target className="h-5 w-5 text-primary" />
          <span className="text-primary font-semibold text-lg">Your Next Steps</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Your Commitments
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
          What will you start in the next 14 days?
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10">
          <Card className="p-10 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-3xl font-bold text-foreground">One Ritual</h3>
            </div>
            <p className="text-muted-foreground mb-6 text-xl">
              A repeatable practice you'll adopt
            </p>
            <div className="bg-background/80 border-2 border-primary/30 p-8 rounded-xl min-h-[100px]">
              <p className="text-muted-foreground italic text-lg leading-relaxed">
                Example: Every Monday, use AI to summarize last week's account velocity data and flag accounts needing attention
              </p>
            </div>
          </Card>

          <Card className="p-10 bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent/30">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-3xl font-bold text-foreground">One Pilot</h3>
            </div>
            <p className="text-muted-foreground mb-6 text-xl">
              A low-risk experiment with clear metrics
            </p>
            <div className="bg-background/80 border-2 border-accent/30 p-8 rounded-xl min-h-[100px]">
              <p className="text-muted-foreground italic text-lg leading-relaxed">
                Example: Use AI to prepare for your next 3 buyer meetings; track prep time saved and meeting quality
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="bg-gradient-to-br from-secondary/5 to-primary/5 border-2 border-secondary/20 rounded-2xl p-10 max-w-4xl mx-auto">
        <p className="text-foreground text-xl leading-relaxed text-center">
          <strong>Small commitments, consistently applied, create lasting change.</strong> Start with 
          one ritual and one pilot—then iterate and expand as you learn.
        </p>
      </div>

      <div className="text-center pt-8">
        <p className="text-4xl font-bold text-foreground mb-4">
          Thank you for investing in your AI skills.
        </p>
        <p className="text-2xl text-muted-foreground">
          Questions? Ideas to share? Let's continue the conversation.
        </p>
      </div>
    </div>
  );
};
