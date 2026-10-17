import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { RotateCcw } from "lucide-react";

export const ManualOneWordStoryScreen = () => {
  const [words, setWords] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus the input on mount and after each lock-in
  useEffect(() => {
    inputRef.current?.focus();
  }, [words.length]);

  const lockWord = () => {
    const word = draft.trim();
    if (!word) return;
    setWords((prev) => [...prev, word]);
    setDraft("");
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    // Stop space/enter from being captured by the deck navigator
    if (e.key === " " || e.key === "Enter") {
      e.stopPropagation();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      lockWord();
    }
    if (e.key === "Backspace" && draft === "" && words.length > 0) {
      e.preventDefault();
      setWords((prev) => prev.slice(0, -1));
    }
  };

  const reset = () => {
    setWords([]);
    setDraft("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 animate-fade-in">
      <div className="max-w-7xl w-full space-y-10">
        {/* Story display */}
        <div className="min-h-[420px] bg-card/60 border-2 border-border rounded-3xl p-12 shadow-xl flex flex-wrap items-center justify-center gap-x-5 gap-y-4">
          {words.length === 0 && !draft && (
            <p className="slide-body-lg text-muted-foreground/50 italic">…</p>
          )}
          {words.map((w, i) => (
            <span
              key={i}
              className="slide-title font-display text-foreground animate-fade-in"
            >
              {w}
            </span>
          ))}
          {draft && (
            <span className="slide-title font-display text-primary/60 italic">
              {draft}
            </span>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center gap-4">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            autoFocus
            className="slide-body-lg flex-1 px-6 py-5 rounded-2xl border-2 border-primary/40 bg-background text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
          />
          <button
            onClick={reset}
            className="px-5 py-5 rounded-2xl border-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
            aria-label="Reset story"
            title="Reset"
          >
            <RotateCcw className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};
