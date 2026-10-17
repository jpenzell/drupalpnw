import { Award } from "lucide-react";

export const HarvardAITutoringScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-in px-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Source Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <Award className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Harvard / Nature Scientific Reports • 2025</span>
        </div>

        {/* Main Finding */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            AI Tutoring <span className="text-green-500">Outperformed</span>
            <br />Active Learning
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Randomized Controlled Trial in real classrooms
          </p>
        </div>

        {/* Key Stats - Simplified */}
        <div className="flex justify-center gap-12 md:gap-20 pt-4">
          <div className="text-center">
            <p className="text-5xl md:text-7xl font-black text-green-500">More</p>
            <p className="text-lg text-muted-foreground">Learning Gains</p>
          </div>
          <div className="text-center">
            <p className="text-5xl md:text-7xl font-black text-primary">Less</p>
            <p className="text-lg text-muted-foreground">Time Required</p>
          </div>
        </div>

        {/* Takeaway */}
        <div className="bg-muted/30 rounded-2xl p-6 max-w-2xl mx-auto">
          <p className="text-lg text-foreground">
            AI can augment <strong>your best teaching practices</strong>—not just replace weak ones
          </p>
        </div>
      </div>
    </div>
  );
};
