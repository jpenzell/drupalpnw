import { useReveal } from "@/hooks/useReveal";
import { ScriptOverlay } from "@/components/blocks/ScriptOverlay";

export const TwoMovesSlide = () => {
  const { shown, Dots } = useReveal(3);
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6">
      <div className="max-w-4xl w-full text-center space-y-12">
        <h1 className="slide-title font-display font-light text-foreground leading-tight">
          Two directing moves.
        </h1>

        <div className="space-y-6">
          {shown(1) && (
            <div className="flex items-baseline justify-center gap-6 animate-fade-in">
              <span className="slide-title font-display text-secondary">1.</span>
              <p className="slide-subtitle font-display text-foreground">
                Provide the <span className="text-primary italic">need.</span>
              </p>
            </div>
          )}
          {shown(2) && (
            <div className="flex items-baseline justify-center gap-6 animate-fade-in">
              <span className="slide-title font-display text-secondary">2.</span>
              <p className="slide-subtitle font-display text-foreground">
                Suggest the <span className="text-primary italic">action.</span>
              </p>
            </div>
          )}
        </div>

        {shown(3) && (
          <p className="slide-body-lg font-display italic text-muted-foreground animate-fade-in">
            Everything else is reaction.
          </p>
        )}

        <Dots />
      </div>
      <ScriptOverlay />
    </div>
  );
};
