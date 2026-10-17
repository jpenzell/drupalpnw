import { Citation } from "@/components/blocks/Citation";
import { UserCog } from "lucide-react";

export const CastTheAISlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-6">
      <div className="max-w-[1400px] w-full space-y-8">
        <h1 className="text-center text-4xl md:text-6xl font-display font-light text-foreground leading-tight">
          Give the model <span className="italic text-primary">a role.</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border-2 border-border rounded-2xl p-8 space-y-3 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Default</p>
            <p className="text-3xl md:text-4xl font-display italic text-primary">"Trust your gut."</p>
          </div>

          <div className="bg-primary/10 border-2 border-primary/50 rounded-2xl p-8 space-y-3 text-center">
            <p className="text-xs uppercase tracking-widest text-primary font-mono flex items-center justify-center gap-2">
              <UserCog className="h-3.5 w-3.5" />
              "You are a Chinese small-business owner."
            </p>
            <p className="text-3xl md:text-4xl font-display italic text-primary">"Talk to your parents."</p>
          </div>
        </div>

        <Citation sources={["Lu, Song & Zhang (2025). Nature Human Behaviour, 9(11)."]} />
      </div>
    </div>
  );
};
