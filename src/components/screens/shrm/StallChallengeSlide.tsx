import { ZenBackdrop } from "../ZenBackdrop";
import emptyBench from "@/assets/zen/empty-bench.jpg";

export const StallChallengeSlide = () => {
  return (
    <ZenBackdrop
      image={emptyBench}
      overlay="paper"
      kenBurns
      alt="An empty bench facing an open horizon"
    >
      <div className="max-w-7xl mx-auto text-center space-y-10 px-8">
        <h1 className="slide-title-lg font-display font-light text-muted-foreground leading-[1.05]">
          Not:{" "}
          <span className="italic">Can AI create what we imagine</span>
        </h1>
        <p className="slide-title-lg font-display font-bold text-foreground leading-[1.05]">
          Can we <span className="text-primary italic">imagine</span> big enough
          for AI?
        </p>
      </div>
    </ZenBackdrop>
  );
};
