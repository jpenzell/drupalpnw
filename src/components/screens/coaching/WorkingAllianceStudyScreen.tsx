import { Users, Bot } from "lucide-react";

export const WorkingAllianceStudyScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 overflow-hidden">
      <div className="w-full max-w-7xl space-y-12">
        {/* Source chip */}
        <div className="text-center">
          <span className="text-sm text-muted-foreground tracking-widest uppercase font-medium">
            Barger · 2025 · Frontiers in Psychology
          </span>
        </div>

        {/* Headline */}
        <h1 className="slide-title font-bold text-center text-foreground leading-tight">
          Employees trust AI <span className="text-primary">just as much</span> as a human.
        </h1>

        {/* Visual comparison */}
        <div className="grid grid-cols-2 gap-12 items-center">
          {/* Human */}
          <div className="text-center space-y-4">
            <div className="w-40 h-40 mx-auto rounded-full bg-secondary/15 border-4 border-secondary/40 flex items-center justify-center">
              <Users className="h-20 w-20 text-secondary" />
            </div>
            <p className="slide-body font-semibold text-foreground">Human</p>
            <p className="slide-title font-black text-secondary">74.5</p>
          </div>

          {/* AI */}
          <div className="text-center space-y-4">
            <div className="w-40 h-40 mx-auto rounded-full bg-primary/15 border-4 border-primary/40 flex items-center justify-center">
              <Bot className="h-20 w-20 text-primary" />
            </div>
            <p className="slide-body font-semibold text-foreground">AI</p>
            <p className="slide-title font-black text-primary">72.7</p>
          </div>
        </div>

        <p className="slide-caption text-center text-muted-foreground italic">
          Working Alliance Inventory · no significant difference (p ≈ 0.48)
        </p>

        {/* HR takeaway */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30 rounded-2xl px-10 py-8">
          <p className="slide-body-lg font-bold text-foreground">
            HR's edge isn't being human.<br />
            It's being a <span className="text-primary">skilled</span> human.
          </p>
        </div>
      </div>
    </div>
  );
};
