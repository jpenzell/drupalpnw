import { Drama, Users, Mic, RefreshCw } from "lucide-react";

const roles = [
  {
    icon: Drama,
    name: "Director",
    body: "L&D sets the intent. Not performing the work — shaping it.",
  },
  {
    icon: Users,
    name: "Ensemble",
    body: "Legal, IT, business — everyone on stage knows their cue.",
  },
  {
    icon: Mic,
    name: "Coach in the Wings",
    body: "Notes in real time. Not after the show.",
  },
  {
    icon: RefreshCw,
    name: "Iterate the Script",
    body: "Small rehearsals beat one big launch.",
  },
];

export const PitCrewSlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6 py-8">
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary font-semibold">
            L&amp;D as the Director
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            The cast takes the bow.
            <span className="block text-primary text-2xl md:text-3xl font-display italic font-normal mt-2">
              The director makes the show.
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((r, i) => (
            <div
              key={r.name}
              className="rounded-xl border border-border bg-card/60 p-5 space-y-3 hover:border-secondary/60 transition-colors animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center">
                <r.icon className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground">{r.name}</h3>
              <p className="text-lg text-muted-foreground leading-snug">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
