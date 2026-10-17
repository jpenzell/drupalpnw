import { HelpCircle } from "lucide-react";

export const ChargersBiasWhyScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 overflow-hidden">
      <div className="max-w-6xl w-full">
        <div className="text-center space-y-8 animate-fade-in">
          <p className="slide-caption text-muted-foreground uppercase tracking-widest font-medium">
            The real question:
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <HelpCircle className="h-14 w-14 text-secondary" />
            <h2 className="slide-title font-bold text-secondary">Why?</h2>
          </div>
          
          <p className="slide-body-lg text-muted-foreground max-w-4xl mx-auto">
            Nobody knows. Not even the people who built it.
          </p>
          
          <div className="bg-secondary/10 border-4 border-secondary rounded-2xl p-8 max-w-4xl mx-auto space-y-6">
            <p className="slide-body-lg font-semibold text-foreground">
              AI learned from <span className="text-primary">humans</span>.
            </p>
            <p className="slide-body-lg font-semibold text-foreground">
              It acts like a <span className="text-primary">human</span>.
            </p>
            <p className="slide-body-lg font-semibold text-foreground">
              It makes mistakes like a <span className="text-primary">human</span>.
            </p>
          </div>
          
          <p className="slide-body text-foreground max-w-3xl mx-auto">
            So maybe... <span className="text-secondary font-bold">work with it like one</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
