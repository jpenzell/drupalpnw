import { useReveal } from "@/hooks/useReveal";
import { StaticAIResult } from "@/components/StaticAIResult";
import { Citation } from "@/components/blocks/Citation";

const PERFORMERS = [
  "Olivier", "Burton", "Gielgud", "Jacobi", "Branagh",
  "Tennant", "Cumberbatch", "Hawke", "Whishaw", "Scott",
];

export const ShakespeareDemoSlide = () => {
  const { shown, Dots } = useReveal(2);
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6 py-6 overflow-y-auto">
      <div className="w-full max-w-6xl space-y-6">
        <h1 className="text-3xl md:text-5xl font-display italic text-center text-foreground leading-snug">
          "To be, or not to be — <span className="text-primary">that is the question.</span>"
        </h1>

        <StaticAIResult
          variant="single"
          panelA={{
            label: "Direct the actor",
            prompt:
              "How should an actor deliver the line 'To be, or not to be, that is the question'? Give specific direction.",
            cached:
              "Deliver the line slowly, with melancholy weight. Pause meaningfully after 'be.' Eyes lifted, voice low. The audience should feel a man on the threshold of a terrible decision — the soliloquy of a soul considering its own ending.",
          }}
        />

        {shown(2) && (
          <div className="space-y-4 text-center animate-fade-in">
            <p className="text-base text-muted-foreground italic">
              Hundreds of legitimate, professionally celebrated deliveries:
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 max-w-4xl mx-auto">
              {PERFORMERS.map((p, i) => (
                <span key={p} className="text-xl md:text-2xl font-display text-foreground">
                  {p}
                  {i < PERFORMERS.length - 1 && <span className="text-secondary mx-2">·</span>}
                </span>
              ))}
              <span className="text-xl md:text-2xl font-display text-muted-foreground italic">…</span>
            </div>
            <p className="text-xl md:text-2xl font-display text-primary italic pt-3">
              The right tail belongs to humans.
            </p>
            <Citation sources={[
              "Wang, Huang, Shen & Uzzi (2025). Humans hold the right tail of",
              "creativity. Nature Human Behaviour.",
            ]} />
          </div>
        )}

        <Dots />
      </div>
    </div>
  );
};
