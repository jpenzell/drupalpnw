import { useCallback, useEffect, useState } from "react";

/**
 * Sequenced reveal — Space / → advances, ← steps back.
 *
 * Symmetric slide navigation: pressing → on the final stage advances to the
 * next slide (event bubbles to PresentationLayout). Pressing ← on stage 1
 * goes to the previous slide AND signals the next reveal slide to mount at
 * its final stage, so back-stepping continues to feel natural.
 */

// Module-level flag: set when leaving a reveal slide backwards so the
// previous reveal slide initializes at its max stage on mount.
let enterAtMax = false;

// Any forward navigation invalidates a stale enterAtMax flag — otherwise
// a back-then-forward sequence could cause the next reveal slide to mount
// at its final stage, skipping its build.
if (typeof window !== "undefined") {
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "ArrowRight" || e.key === " ") enterAtMax = false;
    },
    true
  );
}

/**
 * Custom-handler slides (not using useReveal) call this right before
 * letting an ArrowLeft event bubble to PresentationLayout from their
 * first stage, so the previous reveal slide enters at its max stage.
 */
export function signalEnterAtMax() {
  enterAtMax = true;
}


export function useReveal(maxStage: number, opts?: { autoIntervalMs?: number }) {
  const [stage, setStage] = useState(() => {
    if (enterAtMax) {
      enterAtMax = false;
      return maxStage;
    }
    return 1;
  });

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowRight") {
        if (stage < maxStage) {
          e.preventDefault();
          e.stopImmediatePropagation();
          setStage((s) => s + 1);
        }
      } else if (e.key === "ArrowLeft") {
        if (stage > 1) {
          e.preventDefault();
          e.stopImmediatePropagation();
          setStage((s) => s - 1);
        } else {
          // At stage 1: let the event bubble to navigate to the previous
          // slide, but tell the next reveal slide to enter at its max stage.
          enterAtMax = true;
        }
      }
    },
    [stage, maxStage]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true } as any);
  }, [onKey]);

  // Auto-advance stages at a fixed interval
  useEffect(() => {
    if (!opts?.autoIntervalMs) return;
    if (stage >= maxStage) return;
    const id = setInterval(() => {
      setStage((s) => {
        if (s >= maxStage) return s;
        return s + 1;
      });
    }, opts.autoIntervalMs);
    return () => clearInterval(id);
  }, [stage, maxStage, opts?.autoIntervalMs]);

  return {
    stage,
    shown: (n: number) => stage >= n,
    Dots: () => (
      <div className="flex justify-center gap-2 mt-10">
        {Array.from({ length: maxStage }).map((_, i) => {
          const s = i + 1;
          return (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                s === stage
                  ? "bg-primary scale-125"
                  : s < stage
                  ? "bg-primary/50"
                  : "bg-muted-foreground/30"
              }`}
            />
          );
        })}
      </div>
    ),
  };
}
