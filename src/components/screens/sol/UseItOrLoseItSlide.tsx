import { useReveal } from "@/hooks/useReveal";
import { Citation } from "@/components/blocks/Citation";

/**
 * A3-3-4 — Use it or lose it. Visualized contrast between two stances toward AI:
 * "AI has the answer" (brain disengages) vs "I'm directing the conversation"
 * (brain stays in the room). Data anchored in Lee 2025 (MS/CMU) + Kosmyna 2025 (MIT).
 *
 * Builds:
 *  1. Two stances appear, brain-activity dots dim/bright
 *  2. Data point: Lee/CMU — confidence in AI predicts less critical thinking
 *  3. Data point: MIT EEG — lowest neural connectivity + 83% couldn't quote own essay
 *  4. Punchline: stance, not the tool, decides
 */
export const UseItOrLoseItSlide = () => {
  const { shown, Dots } = useReveal(4);

  // Brain activity grid — dim vs bright dots
  const ActivityGrid = ({ density, color }: { density: number; color: "muted" | "primary" }) => {
    const cells = Array.from({ length: 36 });
    return (
      <div className="grid grid-cols-9 gap-1.5">
        {cells.map((_, i) => {
          const active = i < density;
          return (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${
                active
                  ? color === "primary"
                    ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
                    : "bg-muted-foreground/40"
                  : "bg-muted-foreground/10"
              }`}
              style={{ transitionDelay: `${i * 15}ms` }}
            />
          );
        })}
      </div>
    );
  };

  const Side = ({
    label,
    stance,
    density,
    color,
    caption,
  }: {
    label: string;
    stance: string;
    density: number;
    color: "muted" | "primary";
    caption: string;
  }) => (
    <div className="flex flex-col items-center gap-4 px-2">
      <p className="text-[11px] uppercase tracking-[0.3em] font-mono text-muted-foreground">
        {label}
      </p>
      <p
        className={`text-lg md:text-2xl font-display leading-snug text-center min-h-[3.5rem] ${
          color === "primary" ? "text-primary italic" : "text-muted-foreground"
        }`}
      >
        "{stance}"
      </p>
      <ActivityGrid density={density} color={color} />
      <p className="text-xs md:text-sm font-mono text-muted-foreground text-center">
        {caption}
      </p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-6 overflow-hidden">
      <div className="max-w-6xl w-full space-y-6">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-secondary font-bold">
          The brain on AI · two stances
        </p>

        <div className="grid grid-cols-2 gap-10 items-start">
          <Side
            label="Stance A"
            stance="AI has the answer."
            density={6}
            color="muted"
            caption="brain disengages"
          />
          <Side
            label="Stance B"
            stance="I'm directing the conversation."
            density={32}
            color="primary"
            caption="brain stays in the room"
          />
        </div>

        {/* Data evidence — fixed area, swaps to avoid scroll */}
        <div className="min-h-[150px] mt-2 flex flex-col items-center justify-center">
          {shown(2) && !shown(3) && (
            <div className="animate-fade-in max-w-3xl text-center space-y-2">
              <p className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">
                Lee et al. · Microsoft + CMU · CHI 2025 · n = 319 knowledge workers
              </p>
              <p className="text-xl md:text-2xl font-display text-foreground leading-snug">
                Higher trust in AI →{" "}
                <span className="text-primary font-semibold">less critical thinking</span>.
                Workers offloaded judgment first, skill second.
              </p>
            </div>
          )}

          {shown(3) && !shown(4) && (
            <div className="animate-fade-in max-w-3xl text-center space-y-2">
              <p className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground">
                Kosmyna et al. · MIT Media Lab · 2025 · EEG study, 4 mo.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-1">
                <div>
                  <p className="text-3xl md:text-4xl font-display font-bold text-primary">↓ lowest</p>
                  <p className="text-sm font-mono text-muted-foreground">neural connectivity in the ChatGPT group</p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-display font-bold text-primary">83%</p>
                  <p className="text-sm font-mono text-muted-foreground">couldn't quote their own essay minutes later</p>
                </div>
              </div>
            </div>
          )}

          {shown(4) && (
            <div className="animate-fade-in space-y-3 text-center">
              <p className="text-2xl md:text-4xl font-display text-foreground leading-snug">
                The tool didn't decide.{" "}
                <span className="text-primary italic">The stance did.</span>
              </p>
              <Citation sources={[
                "Lee et al. (2025). The Impact of Generative AI on Critical Thinking. CHI 2025.",
                "Kosmyna et al. (2025). Your Brain on ChatGPT. MIT Media Lab preprint.",
              ]} />
            </div>
          )}
        </div>

        <Dots />
      </div>
    </div>
  );
};
