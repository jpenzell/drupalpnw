import { Wine, MessageSquare, TrendingUp, Target, DollarSign, Users, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const WineRetailUseCasesScreen = () => {
  const demoScenarios = [
    {
      icon: Users,
      title: "Consumer Insights Discovery",
      category: "Insights Analytics",
      scenario: "Rosé sales are flat with under-35 buyers before category review",
    },
    {
      icon: TrendingUp,
      title: "Promo Velocity vs. Volume",
      category: "Trade Marketing",
      scenario: "18 months of promo data—leadership wants to know what worked",
    },
    {
      icon: Target,
      title: "Consultative Buyer Prep",
      category: "Strategic Accounts",
      scenario: "Line review at Kroger next week with your standard deck ready",
    },
    {
      icon: DollarSign,
      title: "What-If Scenario Planning",
      category: "Forecasting",
      scenario: "Buyer wants to move summer promo from July 4th to Memorial Day",
    },
    {
      icon: MessageSquare,
      title: "Competitive Strategy Deep-Dive",
      category: "Competitive Intel",
      scenario: "19 Crimes is eating your lunch in the $10-15 segment",
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full mb-4">
          <Wine className="h-5 w-5 text-primary" />
          <span className="slide-caption text-primary font-semibold">Demo Moment</span>
        </div>
        <h1 className="slide-subtitle font-bold text-foreground mb-2">
          Thinking <span className="text-primary">WITH</span> AI
        </h1>
        <p className="slide-caption text-secondary font-semibold mb-2">
          Putting ideas on their feet
        </p>
        <p className="slide-caption text-muted-foreground font-light max-w-3xl mx-auto">
          Five real scenarios where AI becomes a thinking partner, not just a tool
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-5 gap-4">
            {demoScenarios.map((demo, index) => {
              const Icon = demo.icon;
              return (
                <Card 
                  key={index}
                  className="p-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all group"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      {demo.category}
                    </Badge>
                    <h3 className="slide-caption font-bold text-foreground leading-tight">{demo.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{demo.scenario}</p>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 text-muted-foreground">
            <ArrowRight className="h-5 w-5 text-primary" />
            <p className="slide-caption">
              We'll walk through each scenario and <strong className="text-primary">think together</strong> with AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
