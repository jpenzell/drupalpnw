import { Users } from "lucide-react";

export const AILeadersScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-12 animate-slide-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full mb-4">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-primary font-semibold text-lg">Leadership Identity</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
          You Are AI Educators
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
          Not because you use AI tools, but because of how you teach with them
        </p>
      </div>

      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20 rounded-2xl p-12 max-w-6xl mx-auto">
        <p className="text-2xl text-foreground mb-12 text-center leading-relaxed max-w-4xl mx-auto">
          You{" "}
          <strong className="text-primary text-3xl">coach students</strong>,{" "}
          <strong className="text-secondary text-3xl">protect learning</strong>, and{" "}
          <strong className="text-accent text-3xl">redesign instruction</strong>{" "}
          to unlock student potential.
        </p>
        
        <div className="grid md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="text-6xl font-bold text-primary mb-4">Coach</div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Develop prompts, activities, and patterns that amplify student thinking and creativity
            </p>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold text-secondary mb-4">Protect</div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Academic integrity, equity, privacy, and developmentally appropriate use safeguard students
            </p>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold text-accent mb-4">Redesign</div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Pedagogical change and reimagination unlock AI's true educational value
            </p>
          </div>
        </div>
      </div>

      <div className="text-center max-w-4xl mx-auto">
        <p className="text-2xl text-foreground leading-relaxed">
          Teaching in the age of AI isn't about technical expertise—
          <strong className="text-primary"> it's about pedagogical judgment, ethical clarity, and the courage to reimagine learning</strong>.
        </p>
      </div>
    </div>
  );
};
