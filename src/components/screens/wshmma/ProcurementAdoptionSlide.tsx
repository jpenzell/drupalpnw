import { Citation } from "@/components/blocks/Citation";
import { useReveal } from "@/hooks/useReveal";
import { ScriptOverlay } from "@/components/blocks/ScriptOverlay";

const STATS = [
  { n: "74%", label: "use AI in at least one procurement area" },
  { n: "32%", label: "have fully integrated it across all areas" },
  { n: "66%", label: "say contract negotiation should stay manual" },
];

export const ProcurementAdoptionSlide = () => {
  const { shown, Dots } = useReveal(3);

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-10">
      <div className="max-w-6xl w-full space-y-7">
        <div className="text-center space-y-3">
          <p className="slide-kicker text-secondary">Healthcare procurement leaders</p>
          <h1 className="slide-subtitle font-display font-light text-foreground leading-tight">
            The tool is already in the building.
          </h1>
        </div>

        {shown(2) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in">
            {STATS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-border/60 bg-card/60 px-7 py-6 min-h-[190px] flex flex-col justify-center gap-4 text-center"
              >
                <p className="slide-title-lg font-display font-bold text-primary leading-none">
                  {s.n}
                </p>
                <p className="slide-caption text-foreground/85 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {shown(3) && (
          <p className="slide-body text-center font-display italic text-muted-foreground animate-fade-in max-w-4xl mx-auto leading-snug">
            You've already decided what the machine gets. The open question is what you do
            with the part you kept.
          </p>
        )}

        <div className="text-center">
          <Citation
            sources={[
              "Staples Business Advantage / Healthcare Purchasing News (2024). Healthcare Procurement and AI · 170+ senior procurement leaders.",
            ]}
          />
        </div>

        <Dots />
      </div>
      <ScriptOverlay />
    </div>
  );
};
