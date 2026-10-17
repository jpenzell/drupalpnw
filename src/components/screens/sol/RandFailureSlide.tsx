import { ZenBackdrop } from "../ZenBackdrop";
import { Citation } from "@/components/blocks/Citation";
import runnerMirage from "@/assets/zen/runner-mirage.jpg";

export const RandFailureSlide = () => (
  <ZenBackdrop image={runnerMirage} overlay="heavy" kenBurns alt="A lone runner dissolving into mirage haze">
    <div className="max-w-5xl w-full text-center px-8 space-y-8">
      <h1 className="slide-title-lg md:text-[14rem] font-display font-bold text-spotlight spotlight-glow leading-none drop-shadow-[0_4px_40px_rgba(0,0,0,0.9)]">
        80%
      </h1>
      <p className="slide-body-lg font-display text-white leading-snug drop-shadow-[0_2px_24px_rgba(0,0,0,0.85)]">
        of AI projects fail.{" "}
        <span className="slide-body-lg text-white/70 italic">2× the rate of regular IT.</span>
      </p>
      <div className="pt-2">
        <Citation sources={[
          "Ryseff, De Bruhl & Newberry (2024). The Root Causes of Failure for",
          "Artificial Intelligence Projects. RAND Corporation, RR-A2680-1.",
        ]} />
      </div>
    </div>
  </ZenBackdrop>
);
