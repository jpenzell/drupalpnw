import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const DemoConsumerInsightsScreen = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full mb-4">
          <Badge variant="outline" className="border-secondary/50 text-secondary bg-secondary/10">
            Rehearsal 3 of 5
          </Badge>
          <Users className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="border-primary/30 text-primary">
            Insights Analytics
          </Badge>
        </div>
        <h1 className="slide-subtitle font-bold text-foreground mb-2">
          Consumer Insights Discovery
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-muted/50 border-2 border-border rounded-2xl p-12">
            <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">
              📍 Scenario
            </p>
            <p className="slide-body-lg text-foreground leading-relaxed">
              Our rosé sales are flat with buyers under 35, and you need to understand why before the category review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
