import { Citation } from "@/components/blocks/Citation";

const BARS = [
  { label: "Work that splits", value: "+81%", tone: "primary" as const, width: 100 },
  { label: "Work in sequence", value: "−70%", tone: "down" as const, width: 86 },
];

/**
 * Casting, part two: ensemble SIZE. Google Research, 180 agent configurations.
 */
export const EnsembleSizeSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-16 py-10">
    <div className="w-full max-w-[1600px] space-y-10">
      <div className="text-center space-y-3">
        <div className="slide-kicker text-secondary font-bold tracking-[0.25em]">
          Casting · the evidence
        </div>
        <h1 className="slide-title font-display font-bold text-foreground">
          Bigger cast ≠ <span className="text-primary italic">better cast.</span>
        </h1>
      </div>

      <div className="space-y-8">
        {BARS.map((bar) => (
          <div key={bar.label} className="flex items-center gap-8">
            <div
              className={`w-[30%] text-right slide-subtitle font-display font-bold ${
                bar.tone === "primary" ? "text-primary" : "text-foreground"
              }`}
            >
              {bar.label}
            </div>
            <div className="flex-1 flex items-center gap-6">
              <div className="flex-1 h-14 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${bar.tone === "primary" ? "bg-primary" : "bg-secondary/40"}`}
                  style={{ width: `${bar.width}%` }}
                />
              </div>
              <div
                className={`font-display font-bold leading-none w-56 ${
                  bar.tone === "primary" ? "text-primary" : "text-foreground/70"
                }`}
                style={{ fontSize: "4.5cqw" }}
              >
                {bar.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-10">
        <div className="bg-card border-2 border-border rounded-3xl p-8 text-center space-y-2">
          <div className="font-display font-bold text-foreground/70 leading-none" style={{ fontSize: "6cqw" }}>
            17×
          </div>
          <p className="slide-body text-muted-foreground">errors, no director</p>
        </div>
        <div className="bg-card border-2 border-primary/40 rounded-3xl p-8 text-center space-y-2">
          <div className="font-display font-bold text-primary leading-none" style={{ fontSize: "6cqw" }}>
            4×
          </div>
          <p className="slide-body text-muted-foreground">errors, with a director</p>
        </div>
      </div>

      <Citation sources={["Kim, Liu et al. (2026), Google Research, arXiv:2512.08296."]} />
    </div>
  </div>
);
