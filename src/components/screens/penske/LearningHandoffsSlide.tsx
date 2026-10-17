/**
 * Learning outcome 3: which parts of a learning-design workflow belong to
 * humans, which to AI, and where the handoff line sits.
 */
const CAST = [
  {
    role: "AI plays",
    tone: "muted" as const,
    items: ["First drafts & branches", "Plain-language rewrites", "Audience variants", "Job aids & question banks"],
  },
  {
    role: "Humans hold",
    tone: "primary" as const,
    items: ["The performance goal", "What good looks like", "Voice & judgment", "The final yes"],
  },
];

export const LearningHandoffsSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-16 py-10">
    <div className="w-full max-w-[1600px] space-y-10">
      <div className="text-center space-y-3">
        <div className="slide-kicker text-secondary font-bold tracking-[0.25em]">
          Casting the learning workflow
        </div>
        <h1 className="slide-title font-display font-bold text-foreground">
          Cast AI in roles it can play.
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-10">
        {CAST.map((col) => (
          <div
            key={col.role}
            className={`rounded-3xl p-10 space-y-6 border-2 ${
              col.tone === "primary" ? "bg-primary/5 border-primary" : "bg-card border-border"
            }`}
          >
            <div
              className={`slide-body font-bold uppercase tracking-[0.2em] ${
                col.tone === "primary" ? "text-primary" : "text-foreground/60"
              }`}
            >
              {col.role}
            </div>
            <ul className="space-y-4 text-left">
              {col.items.map((i) => (
                <li key={i} className="slide-body text-foreground flex gap-4">
                  <span className={col.tone === "primary" ? "text-primary" : "text-foreground/40"}>▸</span>
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="slide-subtitle font-display text-center text-foreground">
        AI drafts <span className="italic text-secondary">volume</span>. Humans own{" "}
        <span className="italic text-primary">intent</span>.
      </p>
    </div>
  </div>
);
