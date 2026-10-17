import { Citation } from "@/components/blocks/Citation";

const ROWS = [
  { label: "Same model, every role", score: 59, range: "50–59%", tone: "muted" as const },
  { label: "Cast at random", score: 57, range: "54–60%", tone: "muted" as const },
  { label: "Auditioned for the role", score: 66, tone: "primary" as const },
];

const MAX = 70;

/**
 * The AI-side evidence for "cast for role fit, not for the biggest name."
 * Amazon AGI / NYU multi-model debate study.
 */
export const CastingRoleFitSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-16 py-10">
    <div className="w-full max-w-[1600px] space-y-10">
      <div className="text-center space-y-3">
        <div className="slide-kicker text-secondary font-bold tracking-[0.25em]">
          Casting · the evidence
        </div>
        <h1 className="slide-title font-display font-bold text-foreground">
          Same AIs. <span className="text-primary italic">Different casting.</span>
        </h1>
      </div>

      <div className="space-y-8">
        {ROWS.map((row) => (
          <div key={row.label} className="flex items-center gap-8">
            <div
              className={`w-[34%] text-right slide-subtitle font-display font-bold ${
                row.tone === "primary" ? "text-primary" : "text-foreground"
              }`}
            >
              {row.label}
            </div>
            <div className="flex-1 flex items-center gap-6">
              <div className="flex-1 h-14 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${row.tone === "primary" ? "bg-primary" : "bg-secondary/40"}`}
                  style={{ width: `${(row.score / MAX) * 100}%` }}
                />
              </div>
              <div
                className={`font-display font-bold leading-none w-64 whitespace-nowrap ${
                  row.tone === "primary" ? "text-primary" : "text-foreground/70"
                }`}
                style={{ fontSize: "4.5cqw" }}
              >
                {row.range ?? `${row.score}%`}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="slide-subtitle font-display text-center text-foreground">
        The strongest solo model <span className="font-bold text-primary">wasn't</span> best in every role.
      </p>

      <Citation sources={["Zhang et al. (2026), arXiv:2601.17152 — Amazon AGI / NYU."]} />
    </div>
  </div>
);
