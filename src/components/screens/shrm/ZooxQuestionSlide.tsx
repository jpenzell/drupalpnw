import { useState, useEffect, useCallback } from "react";
import zooxVehicle from "@/assets/zoox-vehicle.jpg";
import { signalEnterAtMax } from "@/hooks/useReveal";

// Preload Zoox image at module load so it's warm in the browser cache.
if (typeof window !== "undefined") {
  const img = new Image();
  img.src = zooxVehicle;
}

export const ZooxQuestionSlide = () => {
  const [revealed, setRevealed] = useState(false);

  const advance = useCallback(() => {
    // Click only reveals — does not toggle back to hide
    setRevealed(true);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (isTyping) return;
      if (e.key === "ArrowRight" || e.key === " ") {
        if (!revealed) {
          e.preventDefault();
          e.stopImmediatePropagation();
          setRevealed(true);
        }
      } else if (e.key === "ArrowLeft") {
        if (revealed) {
          e.preventDefault();
          e.stopImmediatePropagation();
          setRevealed(false);
        } else {
          // At pre-reveal — let event bubble to previous slide and
          // signal the prior reveal slide to enter at its max stage.
          signalEnterAtMax();
        }
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [revealed]);

  return (
    <div
      className="flex-1 flex items-center justify-center animate-fade-in px-6 cursor-pointer select-none"
      onClick={advance}
    >
      {/* Hidden in-DOM preloaders — guarantee both images are decoded
          and held in cache from the moment this slide mounts. */}
      <img
        src={zooxVehicle}
        alt=""
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none"
        style={{ width: 1, height: 1 }}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />

      {!revealed ? (
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <h1 className="slide-title-lg font-display font-bold text-foreground leading-[1.0]">
            Does a self-driving car
            <span className="block text-primary">need windshield wipers?</span>
          </h1>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center gap-12 animate-fade-in">
          <div className="rounded-2xl overflow-hidden border border-border shadow-2xl w-full max-w-5xl">
            <img
              src={zooxVehicle}
              alt="The Zoox autonomous robotaxi — symmetrical, bidirectional, no windshield"
              className="w-full h-auto object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width={1920}
              height={1080}
            />
          </div>
          <h2 className="slide-title-lg font-display font-bold text-foreground text-center leading-[1.0]">
            No.
            <span className="block text-primary mt-4">It needs no windshield.</span>
          </h2>
        </div>
      )}
    </div>
  );
};
