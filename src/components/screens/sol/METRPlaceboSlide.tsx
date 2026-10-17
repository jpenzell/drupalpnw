import { ZenBackdrop } from "../ZenBackdrop";
import { Citation } from "@/components/blocks/Citation";
import runnerMirage from "@/assets/zen/runner-mirage.jpg";

export const METRPlaceboSlide = () => (
  <ZenBackdrop image={runnerMirage} overlay="medium" kenBurns alt="A lone runner silhouetted against a magenta dusk sky">
    <div className="max-w-6xl w-full px-8 space-y-10 text-center">
      <p className="slide-kicker text-sm uppercase tracking-[0.3em] text-spotlight font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
        METR · RCT · July 2025
      </p>

      <div className="grid grid-cols-2 gap-10 items-center">
        <div className="space-y-2">
          <p className="text-7xl md:text-8xl font-display font-bold text-primary leading-none spotlight-glow">
            −19%
          </p>
          <p className="text-base md:text-lg font-mono uppercase tracking-widest text-white/85 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            actually slower
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-7xl md:text-8xl font-display font-bold text-white/85 leading-none drop-shadow-[0_2px_24px_rgba(0,0,0,0.8)]">
            +20%
          </p>
          <p className="text-base md:text-lg font-mono uppercase tracking-widest text-white/85 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            felt faster
          </p>
        </div>
      </div>

      <p className="text-2xl md:text-3xl font-display italic text-white leading-snug max-w-3xl mx-auto drop-shadow-[0_2px_24px_rgba(0,0,0,0.8)]">
        Performance gets <span className="text-spotlight not-italic font-semibold">worse</span>.
        The feeling gets <span className="text-spotlight not-italic font-semibold">better</span>.
      </p>

      <Citation sources={["METR (2025). Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity. RCT, n=16."]} />
    </div>
  </ZenBackdrop>
);
