import { Users } from "lucide-react";
import { Citation } from "@/components/blocks/Citation";

export const ThinkingMachinesSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center px-16 animate-fade-in bg-iqa-hero">
    <div className="max-w-6xl w-full space-y-10">
      <p className="slide-kicker text-secondary font-semibold tracking-[0.25em]">
        Same prompt · Same model · Temperature 0
      </p>

      <h1 className="slide-title-lg font-display font-bold text-foreground leading-[0.95]">
        Who's <span className="italic text-primary">in the room</span>
        <br />
        changes the answer.
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8 space-y-3">
          <p className="slide-subtitle font-display font-bold text-foreground">1,000</p>
          <p className="slide-body text-muted-foreground">identical runs</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 space-y-3">
          <p className="slide-subtitle font-display font-bold text-primary">80</p>
          <p className="slide-body text-muted-foreground">different answers</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 space-y-3">
          <p className="slide-subtitle font-display font-bold text-spotlight">1</p>
          <p className="slide-body text-muted-foreground">thing changed: the GPU batch</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-foreground/80 max-w-4xl mx-auto">
        <Users className="h-8 w-8 text-primary flex-shrink-0" />
        <p className="slide-body-lg font-display leading-snug text-left">
          The only difference was what else was running alongside it —
          <span className="font-semibold text-foreground"> who else was in the room.</span>
        </p>
      </div>

      <div className="pt-4">
        <Citation sources={["He et al. (2025). Defeating Nondeterminism in LLM Inference. Thinking Machines Lab."]} />
      </div>
    </div>
  </div>
);
