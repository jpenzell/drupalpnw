import { Citation } from "@/components/blocks/Citation";
import { useReveal } from "@/hooks/useReveal";
import { ScriptOverlay } from "@/components/blocks/ScriptOverlay";

export const TrustGapSlide = () => {
  const { shown, Dots } = useReveal(4);

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-10">
      <div className="max-w-5xl w-full space-y-7 text-center">
        <div className="space-y-3">
          <p className="slide-kicker text-secondary">The gap nobody says out loud</p>
          <h1 className="slide-subtitle font-display font-light text-foreground leading-tight">
            Using it isn't the same as trusting it.
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {shown(2) && (
            <div className="rounded-2xl border border-border/60 bg-card/60 px-7 py-6 min-h-[180px] flex flex-col justify-center gap-4 animate-fade-in">
              <p className="slide-title-lg font-display font-bold text-secondary leading-none">
                ~70%
              </p>
              <p className="slide-caption text-foreground/85 leading-snug">
                of clinicians now use AI at work
              </p>
            </div>
          )}
          {shown(3) && (
            <div className="rounded-2xl border border-accent/40 bg-card/60 px-7 py-6 min-h-[180px] flex flex-col justify-center gap-4 animate-fade-in">
              <p className="slide-title-lg font-display font-bold text-accent leading-none">82%</p>
              <p className="slide-caption text-foreground/85 leading-snug">
                cite lack of trust in AI outputs as a problem — hallucinations, inconsistency,
                documentation errors
              </p>
            </div>
          )}
        </div>

        {shown(4) && (
          <p className="slide-body font-display italic text-muted-foreground animate-fade-in max-w-4xl mx-auto leading-snug">
            People don't stop using it. They stop saying when it's wrong. That's a rehearsal
            room problem, not a technology problem.
          </p>
        )}

        <div>
          <Citation
            sources={["epocrates (2025). Clinician AI survey · 519 clinicians."]}
          />
        </div>

        <Dots />
      </div>
      <ScriptOverlay />
    </div>
  );
};
