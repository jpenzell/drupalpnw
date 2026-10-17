import { ZenBackdrop } from "../ZenBackdrop";
import emptyBench from "@/assets/zen/empty-bench.jpg";

export const StallChallengeSlide = () => {
  return (
    <ZenBackdrop image={emptyBench} overlay="heavy" kenBurns alt="An empty bench facing an open horizon">
      <div className="max-w-7xl mx-auto text-center space-y-10 px-8">
        <h1 className="slide-title-lg font-display font-bold text-white leading-[1.05] drop-shadow-[0_2px_28px_rgba(0,0,0,0.85)]">
          Not:{" "}
          <span className="text-white/60 italic font-light">
            Can AI create what we imagine
          </span>
        </h1>
        <p className="slide-title-lg font-display text-primary font-bold leading-[1.05] drop-shadow-[0_2px_28px_rgba(0,0,0,0.85)]">
          Can we{" "}
          <span className="text-accent italic">imagine</span>{" "}
          big enough for AI?
        </p>
      </div>
    </ZenBackdrop>
  );
};
