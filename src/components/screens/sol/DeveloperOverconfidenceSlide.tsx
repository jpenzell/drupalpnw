import { useReveal } from "@/hooks/useReveal";
import { Citation } from "@/components/blocks/Citation";

/**
 * A3-3-2d — Developers think they're faster with AI. They aren't.
 * METR 2025 RCT: experienced OSS devs predicted +24% speed, were actually
 * 19% slower. GitClear 2024: code churn ~2× since Copilot, more rework.
 */
export const DeveloperOverconfidenceSlide = () => {
  const { shown, Dots } = useReveal(4);

  const Bar = ({
    label,
    pct,
    direction,
    color,
    visible,
  }: {
    label: string;
    pct: number;
    direction: "up" | "down";
    color: "muted" | "primary" | "accent";
    visible: boolean;
  }) => {
    const colorClass =
      color === "primary"
        ? "bg-primary"
        : color === "accent"
        ? "bg-accent"
        : "bg-muted-foreground/40";
    const textColor =
      color === "primary"
        ? "text-primary"
        : color === "accent"
        ? "text-accent"
        : "text-muted-foreground";
    return (
      <div
        className={`flex flex-col items-center gap-2 transition-all duration-700 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-[11px] uppercase tracking-widest font-mono text-muted-foreground text-center">
          {label}
        </p>
        <div className="h-32 flex items-end">
          <div
            className={`w-16 rounded-t-md transition-all duration-1000 ${colorClass}`}
            style={{ height: visible ? `${pct * 1.1}px` : "0px" }}
          />
        </div>
        <p className={`text-2xl md:text-3xl font-display font-bold ${textColor}`}>
          {direction === "up" ? "+" : "−"}
          {pct}%
        </p>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-6 overflow-hidden">
      <div className="max-w-5xl w-full space-y-6">
        <div className="text-center space-y-1.5">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary font-bold">
            METR · Experienced open-source developers · 2025
          </p>
          <h1 className="text-3xl md:text-5xl font-display font-light text-foreground leading-tight">
            They thought AI made them <span className="italic">faster.</span>
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-16 items-end max-w-2xl mx-auto pt-2">
          <Bar
            label="What devs predicted"
            pct={24}
            direction="up"
            color="muted"
            visible={shown(1)}
          />
          <Bar
            label="What actually happened"
            pct={19}
            direction="down"
            color="primary"
            visible={shown(2)}
          />
        </div>

        <div className="min-h-[110px] flex items-center justify-center">
          {shown(3) && !shown(4) && (
            <div className="animate-fade-in max-w-3xl text-center space-y-2">
              <p className="text-lg md:text-2xl font-display text-foreground leading-snug">
                Even <span className="italic">after</span> the study, devs still believed
                AI had sped them up by ~20%.
              </p>
              <p className="text-sm font-mono text-muted-foreground">
                The feeling of speed and the reality of speed are not the same thing.
              </p>
            </div>
          )}

          {shown(4) && (
            <div className="animate-fade-in max-w-3xl text-center space-y-3">
              <p className="text-lg md:text-2xl font-display text-foreground leading-snug">
                Meanwhile: code <span className="text-accent font-semibold">churn doubled</span>{" "}
                — more code written, then thrown away or refactored within two weeks.
              </p>
              <Citation sources={[
                "METR (2025). Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity.",
                "GitClear (2024). Coding on Copilot — AI-Assisted Code Quality Report.",
              ]} />
            </div>
          )}
        </div>

        <Dots />
      </div>
    </div>
  );
};
