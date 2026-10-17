import { Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const DemoBuyerPrepScreen = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full mb-4">
          <Badge variant="outline" className="border-secondary/50 text-secondary bg-secondary/10">
            Rehearsal 1 of 5
          </Badge>
          <Target className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="border-primary/30 text-primary">
            Strategic Account Focus
          </Badge>
        </div>
        <h1 className="slide-subtitle font-bold text-foreground mb-2">
          Consultative Buyer Prep
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-muted/50 border-2 border-border rounded-2xl p-12">
            <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">
              📍 Scenario
            </p>
            <p className="slide-body-lg text-foreground leading-relaxed">
              You have a line review at Kroger next week. You've prepared your standard deck and talking points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
