import { Citation } from "@/components/blocks/Citation";

export const RandRootCauseSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6">
    <div className="max-w-5xl w-full text-center space-y-12">
      <p className="text-sm uppercase tracking-[0.3em] text-secondary font-bold">
        The root cause
      </p>

      <h1 className="slide-title font-display font-light text-foreground leading-tight">
        Not the tech.<br />
        Not the data.<br />
        <span className="text-primary italic">The hairstyle problem.</span>
      </h1>

      <p className="slide-body-lg font-display italic text-muted-foreground max-w-3xl mx-auto">
        Stakeholders couldn't agree on the problem they were solving.
      </p>

      <Citation sources={[
        "Ryseff, De Bruhl & Newberry (2024). The Root Causes of Failure for",
        "Artificial Intelligence Projects. RAND Corporation, RR-A2680-1.",
      ]} />
    </div>
  </div>
);

