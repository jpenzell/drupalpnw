import { ZenBackdrop } from "../ZenBackdrop";
import { Citation } from "@/components/blocks/Citation";
import markedScript from "@/assets/zen/marked-script.jpg";

export const HamelHusainSlide = () => (
  <ZenBackdrop image={markedScript} overlay="gradient-side" kenBurns alt="A theater script covered in red-pen director's notes">
    <div className="w-full max-w-6xl px-12 space-y-8">
      <p className="slide-title font-display font-light text-white leading-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.85)]">
        If you're passing{" "}
        <span className="text-spotlight font-semibold">100%</span>{" "}
        of your evals,<br />
        you're not <span className="italic">challenging</span> the system.
      </p>

      <p className="slide-body-lg font-display italic text-white/95 leading-snug max-w-3xl drop-shadow-[0_2px_24px_rgba(0,0,0,0.85)]">
        <span className="text-spotlight not-italic font-semibold">70%</span> might be the more meaningful number.
      </p>

      <p className="slide-caption text-base font-mono text-white/90 uppercase tracking-widest drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
        — Hamel Husain
      </p>

      <Citation sources={["Husain & Shankar (2025). AI Evals for Engineers & PMs."]} />
    </div>
  </ZenBackdrop>
);
