import { useState } from "react";
import { ScrollText, X } from "lucide-react";

const LINES: { who: "A" | "B"; text: string }[] = [
  { who: "A", text: "Hey." },
  { who: "B", text: "Hey." },
  { who: "A", text: "Can I use that?" },
  { who: "B", text: "Yeah." },
  { who: "A", text: "Do you mind?" },
  { who: "B", text: "Sorry." },
];

/**
 * Floating "Script" toggle — lets the presenter pop the six-line script
 * back up on top of any slide so the audience can re-read it while we
 * direct/act through Need / Obstacle / Action.
 */
export const ScriptOverlay = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-24 left-6 z-40 flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-mono uppercase tracking-[0.15em] text-foreground/80 backdrop-blur-md shadow-lg transition-all hover:bg-card hover:text-foreground hover:scale-105"
        aria-label={open ? "Hide script" : "Show script"}
      >
        <ScrollText className="h-4 w-4" />
        {open ? "Hide script" : "Script"}
      </button>

      {open && (
        <div
          className="fixed bottom-40 left-6 z-40 w-[min(420px,calc(100vw-3rem))] rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl animate-fade-in"
          role="dialog"
          aria-label="The Script"
        >
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-3">
            <p className="text-xs uppercase tracking-[0.3em] font-mono text-muted-foreground">
              The Script
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close script"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="px-6 py-5 space-y-2.5 font-display">
            {LINES.map((line, i) => (
              <div key={i} className="grid grid-cols-[2rem_1fr] gap-3 items-baseline">
                <span
                  className={`text-sm font-mono tracking-widest ${
                    line.who === "A" ? "text-primary" : "text-accent"
                  }`}
                >
                  {line.who}
                </span>
                <span className="text-xl text-foreground leading-snug">
                  {line.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
