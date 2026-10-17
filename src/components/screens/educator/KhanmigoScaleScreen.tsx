import { Sparkles, ArrowRight } from "lucide-react";

export const KhanmigoScaleScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-in px-4">
      <div className="max-w-5xl w-full text-center space-y-8">
        {/* Source Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-accent">Khan Academy • 2024-25</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-foreground">
          Khanmigo: AI at Scale
        </h1>

        {/* Growth Visualization - Hero */}
        <div className="flex items-center justify-center gap-6 md:gap-12 py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">2023-24</p>
            <p className="text-5xl md:text-7xl font-black text-muted-foreground">40K</p>
            <p className="text-muted-foreground">students</p>
          </div>
          
          <div className="flex flex-col items-center">
            <ArrowRight className="h-12 w-12 md:h-16 md:w-16 text-accent" />
            <span className="text-2xl md:text-3xl font-black text-accent">17.5×</span>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-accent mb-1">2024-25</p>
            <p className="text-5xl md:text-7xl font-black text-accent">700K</p>
            <p className="text-accent">students</p>
          </div>
          
          <div className="flex flex-col items-center">
            <ArrowRight className="h-8 w-8 md:h-12 md:w-12 text-primary/50" />
          </div>
          
          <div className="text-center opacity-70">
            <p className="text-sm text-primary mb-1">Projected</p>
            <p className="text-5xl md:text-7xl font-black text-primary">1M+</p>
            <p className="text-primary">students</p>
          </div>
        </div>

        {/* Key Point */}
        <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 max-w-2xl mx-auto">
          <p className="text-xl text-foreground">
            Not just student tutoring—<strong className="text-accent">teacher tools</strong> for lesson planning, assessment & feedback
          </p>
        </div>
      </div>
    </div>
  );
};
