import { BookOpen } from "lucide-react";

interface CitationProps {
  /** One or more source lines. */
  sources: string[];
  align?: "center" | "left";
}

/**
 * Brass-colored citation block. Used at the bottom of scenes that
 * reference research. Mirrors theater-program metadata: small, quiet,
 * and unmistakably credible.
 */
export const Citation = ({ sources, align = "center" }: CitationProps) => {
  return (
    <div
      className={`mt-8 inline-flex items-start gap-3 px-5 py-3 rounded-xl border-2 border-primary/40 bg-primary/10 ${
        align === "center" ? "mx-auto" : ""
      }`}
    >
      <BookOpen className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
      <div className={`text-sm font-mono text-primary font-medium leading-relaxed ${align === "center" ? "text-left" : ""}`}>
        {sources.map((s, i) => (
          <p key={i}>{s}</p>
        ))}
      </div>
    </div>
  );
};
