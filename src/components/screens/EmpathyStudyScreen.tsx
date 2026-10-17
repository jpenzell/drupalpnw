import { Heart } from "lucide-react";

export const EmpathyStudyScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center px-6 animate-fade-in">
      <div className="max-w-5xl mx-auto w-full text-center space-y-10">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary font-semibold">
            Nature Communications Medicine, 2024
          </p>
          <h1 className="slide-title inline-flex items-center gap-3 font-display font-bold text-foreground">
            <Heart className="h-10 w-10 text-primary" />
            AI rated more empathetic than doctors.
          </h1>
        </div>

        <div className="bg-primary/10 border-2 border-primary/40 rounded-3xl p-10 max-w-3xl mx-auto">
          <p className="slide-title-lg font-display font-black text-primary leading-none">
            4×
          </p>
          <p className="slide-body text-foreground mt-4">
            Blind evaluators preferred AI responses to physician responses.
          </p>
        </div>

        <p className="slide-caption text-muted-foreground italic max-w-3xl mx-auto">
          Not "AI replacing humans." AI helping humans communicate better — when humans still direct the scene.
        </p>
      </div>
    </div>
  );
};
