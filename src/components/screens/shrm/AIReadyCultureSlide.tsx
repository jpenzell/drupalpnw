import { Heart, Lightbulb, Users, RefreshCw } from "lucide-react";

const pillars = [
  { icon: Heart,     name: "Humanity first",   body: "The model is the supporting actor." },
  { icon: Lightbulb, name: "Imagination",      body: "Reward better questions, not faster output." },
  { icon: Users,     name: "Rehearse in public", body: "Small experiments. Shared openly." },
  { icon: RefreshCw, name: "Iterate the script", body: "Policies and prompts are living." },
];

export const AIReadyCultureSlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6 py-8">
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary font-semibold">
            What it actually looks like
          </p>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground">
            An AI-Ready Culture
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground italic">
            Grounded in humanity. Powered by imagination.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p, i) => (
            <div
              key={p.name}
              className="rounded-xl border border-border bg-card/60 p-5 space-y-3 hover:border-secondary/60 transition-colors animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center">
                <p.icon className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground">{p.name}</h3>
              <p className="text-lg text-muted-foreground leading-snug">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
