import { Users, Music, Eye } from "lucide-react";

const pillars = [
  { icon: Users, label: "Cast",    headline: "Cast the ensemble.",     tone: "primary"   as const },
  { icon: Music, label: "Rehearse",headline: "Make it safe to fail.",  tone: "secondary" as const },
  { icon: Eye,   label: "Direct",  headline: "Suggest, don't prompt.", tone: "accent"    as const },
];

const toneClasses = {
  primary:   { ring: "ring-primary/30",   bg: "bg-primary/10",  text: "text-primary" },
  secondary: { ring: "ring-secondary/40", bg: "bg-secondary/20",text: "text-secondary" },
  accent:    { ring: "ring-accent/40",    bg: "bg-accent/15",   text: "text-accent" },
};

export const PracticeSummarySlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-12">
      <div className="w-full max-w-7xl space-y-16">
        <h1 className="slide-title text-center font-display font-light text-foreground">
          Starting <span className="italic text-primary">tomorrow…</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((p) => {
            const Icon = p.icon;
            const tones = toneClasses[p.tone];
            return (
              <div
                key={p.label}
                className={`relative flex flex-col items-center text-center gap-6 p-8 rounded-2xl bg-card/60 backdrop-blur ring-1 ${tones.ring} transition-all duration-700 opacity-100 translate-y-0`}
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${tones.bg}`}>
                  <Icon className={`w-12 h-12 ${tones.text}`} strokeWidth={1.5} />
                </div>
                <div>
                  <p className={`text-xs font-mono uppercase tracking-[0.3em] mb-2 ${tones.text}`}>{p.label}</p>
                  <h2 className="slide-body-lg font-display text-foreground leading-tight">{p.headline}</h2>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
