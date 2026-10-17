import { useReveal } from "@/hooks/useReveal";
import { ZenBackdrop } from "../ZenBackdrop";
import marqueeNight from "@/assets/zen/marquee-night.jpg";

// Workplace vocabulary we borrowed straight from the theater.
const VOCAB = [
  "Job Role",
  "Performance Review",
  "Dry run",
  "Script",
  "Audience",
  "Showtime",
];

export const AlreadySpeakingSlide = () => {
  const { shown } = useReveal(VOCAB.length + 2, { autoIntervalMs: 900 });

  return (
    <ZenBackdrop image={marqueeNight} overlay="heavy" kenBurns alt="A glowing theater marquee at night">
      <div className="w-full max-w-6xl px-8 space-y-10 text-center">
        <p
          className={`slide-kicker text-spotlight drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)] transition-opacity duration-500 ${
            shown(0) ? "opacity-100" : "opacity-0"
          }`}
        >
          You already speak theater at work.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-5">
          {VOCAB.map((word, i) => (
            <span
              key={word}
              className={`slide-subtitle font-display font-light text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.7)] transition-all duration-700 inline-flex items-center ${ shown(i + 1) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3" }`}
            >
              {word}
              {i < VOCAB.length - 1 && <span className="text-primary/80 ml-6">·</span>}
            </span>
          ))}
        </div>

        {shown(VOCAB.length + 1) && (
          <div className="space-y-2 pt-6 animate-fade-in">
            <p className="slide-body text-white/75 italic drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)]">
              You borrowed the vocabulary.
            </p>
            <p className="slide-body-lg text-spotlight italic font-display drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)]">
              You stopped using the methodology.
            </p>
          </div>
        )}
      </div>
    </ZenBackdrop>
  );
};
