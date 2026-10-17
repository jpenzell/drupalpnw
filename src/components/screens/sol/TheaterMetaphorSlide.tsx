import { ZenBackdrop } from "../ZenBackdrop";
import stageSpotlight from "@/assets/zen/stage-spotlight.jpg";

export const TheaterMetaphorSlide = () => (
  <ZenBackdrop image={stageSpotlight} overlay="medium" kenBurns alt="An empty theater stage lit by a single warm spotlight">
    <div className="max-w-5xl w-full text-center px-6">
      <p className="text-5xl md:text-7xl font-display font-light text-white leading-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.7)]">
        The metaphor for this moment is{" "}
        <span className="text-spotlight italic spotlight-glow">theater.</span>
      </p>
    </div>
  </ZenBackdrop>
);
