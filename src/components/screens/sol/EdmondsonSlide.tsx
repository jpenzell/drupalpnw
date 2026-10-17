import { useReveal } from "@/hooks/useReveal";
import { Citation } from "@/components/blocks/Citation";

/**
 * A3-2-2 — Edmondson 1996 nurse error-reporting study.
 * Single build: bars + punchline.
 */
export const EdmondsonSlide = () => {
  const { shown, Dots } = useReveal(2);

  const lowSafety = { reported: 4, hidden: 26 };
  const highSafety = { reported: 22, hidden: 8 };

  const Bar = ({
    label,
    color,
    reported,
    hidden,
  }: {
    label: string;
    color: "muted" | "primary";
    reported: number;
    hidden: number;
  }) => {
    const total = reported + hidden;
    const cellSize = 14;
    const cols = 6;
    const cells = Array.from({ length: total });
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">{label}</p>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}>
          {cells.map((_, i) => {
            const isReported = i < reported;
            return (
              <div
                key={i}
                className={`rounded-sm ${
                  isReported
                    ? color === "primary"
                      ? "bg-primary"
                      : "bg-muted-foreground/60"
                    : "border-2 border-dashed border-muted-foreground/40 bg-transparent"
                }`}
                style={{ width: cellSize, height: cellSize }}
              />
            );
          })}
        </div>
        <div className="text-center">
          <p className="slide-caption font-display font-bold text-foreground leading-none">
            {reported}{" "}
            <span className="text-xs font-mono text-muted-foreground font-normal">reported</span>
          </p>
          <p className="text-xs font-mono text-muted-foreground italic mt-0.5">
            {hidden} hidden
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-4 overflow-hidden">
      <div className="max-w-[1100px] w-full">
        <div className="text-center space-y-1.5 mb-6">
          <p className="slide-kicker">Edmondson · 1996</p>
          <h1 className="slide-title">
            Best teams <span className="italic">surface</span> ~10× more errors.
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-12 items-end">
          <Bar label="Worst-led teams" color="muted" reported={lowSafety.reported} hidden={lowSafety.hidden} />
          <Bar label="Best-led teams" color="primary" reported={highSafety.reported} hidden={highSafety.hidden} />
        </div>

        <div className="mt-4 min-h-[100px] flex flex-col items-center justify-center text-center">
          {shown(2) && (
            <div className="space-y-3 animate-fade-in">
              <p className="slide-body-lg font-display text-foreground">
                Not making more.{" "}
                <span className="text-primary font-semibold">Surfacing more.</span>
              </p>
              <Citation sources={[
                "Edmondson (1996). Journal of Applied Behavioral Science, 32(1), 5–28.",
              ]} />
            </div>
          )}
        </div>

        <Dots />
      </div>
    </div>
  );
};
