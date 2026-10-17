import { useReveal } from "@/hooks/useReveal";
import { Citation } from "@/components/blocks/Citation";

export const RussianBluesSlide = () => {
  const { shown, Dots } = useReveal(3);

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6">
      <div className="max-w-5xl w-full space-y-10 text-center">
        {/* Two swatches */}
        <div className="flex items-center justify-center gap-10">
          <div className="space-y-3">
            <div
              className="w-44 h-44 md:w-56 md:h-56 rounded-2xl shadow-large"
              style={{ background: "hsl(205 75% 70%)" }}
            />
            <p className="font-mono text-secondary text-base">goluboy</p>
          </div>
          <div className="space-y-3">
            <div
              className="w-44 h-44 md:w-56 md:h-56 rounded-2xl shadow-large"
              style={{ background: "hsl(220 80% 38%)" }}
            />
            <p className="font-mono text-secondary text-base">siniy</p>
          </div>
        </div>

        {shown(2) && (
          <p className="text-2xl md:text-3xl text-muted-foreground font-display italic animate-fade-in">
            Russian speakers discriminate these shades{" "}
            <span className="text-primary not-italic font-bold">124&nbsp;ms</span> faster than English speakers.
          </p>
        )}

        {shown(3) && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-3xl md:text-5xl font-display text-foreground leading-snug">
              Language doesn't describe what you think.
            </p>
            <p className="text-3xl md:text-5xl font-display text-primary leading-snug">
              It conditions what you can think.
            </p>
            <Citation sources={[
              "Winawer et al. (2007). Russian blues reveal effects of language",
              "on color discrimination. PNAS, 104(19), 7780–7785.",
            ]} />
          </div>
        )}

        <Dots />
      </div>
    </div>
  );
};
