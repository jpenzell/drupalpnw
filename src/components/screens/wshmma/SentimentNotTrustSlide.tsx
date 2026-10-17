import { Citation } from "@/components/blocks/Citation";

const ROWS = [
  { label: "Sentiment", value: 42.6, highlight: true },
  { label: "Learning", value: 16.3 },
  { label: "Agents", value: 13.6 },
  { label: "Complexity", value: 10.1 },
  { label: "Trust", value: 9.2, inverse: true },
  { label: "Experience", value: 4.0 },
];

export const SentimentNotTrustSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-12 py-8">
    <div className="w-full max-w-[1400px] space-y-8">
      <div className="text-center space-y-2">
        <p className="slide-caption text-secondary font-bold uppercase tracking-[0.2em]">
          203,812 survey responses, 2023–2025
        </p>
        <h1
          className="font-display font-bold text-foreground leading-tight"
          style={{ fontSize: "clamp(2rem, 3.4cqw, 3.25rem)" }}
        >
          What actually predicts daily AI use
        </h1>
      </div>

      <div className="space-y-4">
        {ROWS.map((r) => (
          <div key={r.label} className="flex items-center gap-6">
            <span
              className={`w-64 shrink-0 text-right font-display whitespace-nowrap ${
                r.highlight
                  ? "text-primary font-bold"
                  : r.inverse
                  ? "text-destructive font-bold"
                  : "text-foreground/70"
              }`}
              style={{ fontSize: "clamp(1.1rem, 1.6cqw, 1.75rem)" }}
            >
              {r.label}
            </span>
            <div className="flex-1 min-w-0 h-9 bg-muted/50 rounded-lg overflow-hidden">
              <div
                className={`h-full rounded-lg ${
                  r.highlight ? "bg-primary" : r.inverse ? "bg-destructive/70" : "bg-secondary/60"
                }`}
                style={{ width: `${(r.value / 50) * 100}%` }}
              />
            </div>
            <span
              className={`w-28 shrink-0 font-display font-bold text-left whitespace-nowrap ${
                r.highlight
                  ? "text-primary"
                  : r.inverse
                  ? "text-destructive"
                  : "text-foreground/70"
              }`}
              style={{ fontSize: "clamp(1.1rem, 1.7cqw, 1.9rem)" }}
            >
              {r.inverse ? "−" : ""}
              {r.value}%
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card border-2 border-border rounded-2xl px-8 py-6 flex items-center justify-center text-center">
          <p
            className="font-display italic text-foreground leading-snug"
            style={{ fontSize: "clamp(1.15rem, 1.7cqw, 1.9rem)" }}
          >
            How people <span className="text-primary not-italic font-bold">feel</span> predicts use{" "}
            <span className="text-primary not-italic font-bold">4.6×</span> more than how much they{" "}
            <span className="not-italic font-bold">trust</span> it.
          </p>
        </div>

        <div className="bg-destructive/10 border-2 border-destructive/40 rounded-2xl px-8 py-6 text-center space-y-1 flex flex-col justify-center">
          <p
            className="font-bold text-foreground leading-snug"
            style={{ fontSize: "clamp(1.05rem, 1.5cqw, 1.6rem)" }}
          >
            And trust runs <span className="text-destructive">the wrong way</span>:
          </p>
          <p
            className="font-bold text-destructive leading-snug"
            style={{ fontSize: "clamp(1.15rem, 1.7cqw, 1.9rem)" }}
          >
            the less people trust the output, the more they use it.
          </p>
        </div>
      </div>

      <div className="text-center">
        <Citation
          sources={[
            "Imagination Applied — analysis of 203,812 Stack Overflow Developer Survey responses (2023–2025).",
            "github.com/jpenzell/ai-adoption-paradox",
          ]}
        />
      </div>
    </div>
  </div>
);

