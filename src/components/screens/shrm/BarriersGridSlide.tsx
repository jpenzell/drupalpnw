import { Frown, Battery, Shield, EyeOff, UserX, Compass } from "lucide-react";

const barriers = [
  { icon: Frown,   name: "Fear",        line: "“If I admit I don't know it, I'm replaceable.”" },
  { icon: Battery, name: "Fatigue",     line: "“Another tool. Another rollout.”" },
  { icon: Shield,  name: "Trust gap",   line: "“Will this be used on me — or for me?”" },
  { icon: EyeOff,  name: "Performance", line: "Leaders pretending to know." },
  { icon: UserX,   name: "Identity",    line: "“What does it mean about my craft?”" },
  { icon: Compass, name: "No scene",    line: "Big strategy. No rehearsal." },
];

export const BarriersGridSlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6 py-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary font-semibold">
            People-Level Barriers
          </p>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground">
            What's quietly running the show
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {barriers.map((b, i) => (
            <div
              key={b.name}
              className="rounded-xl border border-border bg-card/60 p-5 space-y-3 hover:border-secondary/60 transition-colors animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/15 flex items-center justify-center">
                  <b.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground">{b.name}</h3>
              </div>
              <p className="text-lg text-muted-foreground italic leading-snug">{b.line}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
