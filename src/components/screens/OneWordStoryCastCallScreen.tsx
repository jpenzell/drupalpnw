import { useEffect, useState } from "react";
import { MessageSquare, Sparkles, Play } from "lucide-react";

/**
 * S3a — Cast Call (virtual / Zoom version).
 * We write a one-word story together in the chat: each person types one
 * word, and the story builds from there. If the room is quiet, skip to the
 * one-word story slide and play all the parts yourself.
 *
 * Includes a live demo animation showing how the one-word story works.
 */
const DEMO_WRITERS = ["Alex", "Jordan", "Sam"];
const DEMO_WORDS = ["Once", "upon", "a", "stage,", "three", "leaders", "started", "rehearsing", "the", "future."];

export const OneWordStoryCastCallScreen = () => {
  const [demoWords, setDemoWords] = useState<string[]>([]);

  useEffect(() => {
    if (demoWords.length >= DEMO_WORDS.length) {
      const reset = setTimeout(() => setDemoWords([]), 2200);
      return () => clearTimeout(reset);
    }
    const timer = setTimeout(() => {
      setDemoWords((prev) => [...prev, DEMO_WORDS[prev.length]]);
    }, 650);
    return () => clearTimeout(timer);
  }, [demoWords.length]);

  const currentWriterIndex = demoWords.length % DEMO_WRITERS.length;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-8 animate-fade-in select-none">
      <div className="w-full max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/30 rounded-full">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span className="text-accent font-semibold tracking-wide text-xs uppercase">
            Round 1 · One-Word Story
          </span>
        </div>

        <h1 className="slide-title font-display font-bold leading-[1.05] text-foreground">
          Let's write a story — <span className="text-primary italic">one word at a time.</span>
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-foreground">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-9 w-9 text-primary" />
            <span className="slide-body font-semibold">Type one word in the chat.</span>
          </div>
          <span className="slide-body text-muted-foreground">→</span>
          <div className="flex items-center gap-3">
            <MessageSquare className="h-9 w-9 text-primary" />
            <span className="slide-body font-semibold">We build the story, together.</span>
          </div>
        </div>

        {/* Live demo: how the one-word story works */}
        <div className="bg-gradient-to-br from-accent/10 to-secondary/10 border-2 border-accent/30 rounded-2xl p-6 max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2 text-accent">
            <Play className="h-4 w-4" />
            <span className="uppercase tracking-[0.3em] text-xs font-semibold">
              Here's how it works
            </span>
          </div>

          <div className="bg-card/80 border border-border/50 rounded-xl p-5 min-h-[80px] flex items-center justify-center">
            <p className="slide-body-lg text-foreground font-display leading-relaxed">
              {demoWords.length === 0 ? (
                <span className="text-muted-foreground italic">Story starts here…</span>
              ) : (
                <>
                  {demoWords.join(" ")}
                  <span className="animate-pulse text-primary ml-1">▌</span>
                </>
              )}
            </p>
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            {DEMO_WRITERS.map((name, i) => (
              <div
                key={name}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  i === currentWriterIndex && demoWords.length < DEMO_WORDS.length
                    ? "bg-primary text-primary-foreground scale-110"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {i + 1}. {name}
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Each person adds <span className="text-foreground font-semibold">one word</span>, then it's the next person's turn.
          </p>
        </div>
      </div>
    </div>
  );
};
