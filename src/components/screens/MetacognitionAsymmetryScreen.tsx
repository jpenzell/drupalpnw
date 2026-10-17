import { TrendingUp, TrendingDown } from "lucide-react";

export const MetacognitionAsymmetryScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-in px-12">
      <div className="w-full max-w-7xl space-y-12">
        {/* Headline */}
        <h1 className="slide-title font-bold text-foreground text-center leading-tight">
          AI doesn't lift creativity.
          <br />
          <span className="text-primary">Metacognition does.</span>
        </h1>

        {/* The two outcomes — pure numbers */}
        <div className="grid grid-cols-2 gap-10">
          {/* IF */}
          <div className="bg-primary/15 border-2 border-primary rounded-3xl p-12 shadow-2xl text-center">
            <TrendingUp className="h-16 w-16 text-primary mx-auto mb-4" />
            <p className="slide-title-lg font-bold text-primary leading-none mb-6">+50%</p>
            <p className="slide-body-lg font-bold text-foreground">
              With strong metacognition
            </p>
          </div>

          {/* OTHERWISE */}
          <div className="bg-destructive/10 border-2 border-destructive rounded-3xl p-12 shadow-xl text-center">
            <TrendingDown className="h-16 w-16 text-destructive mx-auto mb-4" />
            <p className="slide-title-lg font-bold text-destructive leading-none mb-6">−20%</p>
            <p className="slide-body-lg font-bold text-foreground">
              Without it
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
