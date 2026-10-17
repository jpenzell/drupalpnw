import { Citation } from "@/components/blocks/Citation";
import { Shield } from "lucide-react";

/** A3-2-1b — Psychological safety as measured precondition. */
export const PsychSafetyResearchSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-6">
    <div className="max-w-[1100px] w-full space-y-10 text-center">
      <p className="slide-kicker">What the research calls it</p>
      <h1 className="slide-title font-display font-light text-foreground leading-tight">
        <span className="italic text-primary">Psychological safety.</span>
      </h1>

      <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 border-2 border-primary/40 rounded-full">
        <Shield className="h-5 w-5 text-primary" />
        <p className="slide-caption text-base font-display text-foreground">
          <span className="font-bold text-primary">Project Aristotle</span> · 180+ Google teams · #1 predictor of performance.
        </p>
      </div>

      <Citation sources={[
        "Edmondson (1999). Psychological Safety and Learning Behavior in Work Teams.",
        "Duhigg (2016) reporting on Google's Project Aristotle. NYT Magazine.",
      ]} />
    </div>
  </div>
);
