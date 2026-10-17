/** Imagery spectrum: what "picture a ball" looks like inside four different minds. */
const LEVELS = [
  { label: "Vivid", note: "Color, texture, light — maybe it bounces" },
  { label: "Clear", note: "A shape, but flat" },
  { label: "Faint", note: "A blur you have to hold onto" },
  { label: "Aphantasia", note: "Nothing to see — you just know “ball”" },
];

export const AphantasiaScreen = () => (
  <div className="flex-1 min-h-0 flex flex-col justify-center gap-6 px-16 py-10 animate-fade-in">
    <div className="space-y-3">
      <p className="slide-kicker text-secondary font-semibold">Aphantasia</p>
      <h1 className="slide-title font-display font-bold text-foreground leading-tight">No mind's eye — and most people never know.</h1>
      <p className="slide-body-lg text-foreground/75">Little or no voluntary mental imagery. Same word, four different inner screens.</p>
    </div>
    <div className="grid grid-cols-4 gap-8 flex-1 min-h-0">
      {LEVELS.map((l, i) => (
        <div key={l.label} className={`rounded-3xl border-2 ${i === 3 ? "border-primary" : "border-border"} bg-card p-5 flex flex-col items-center gap-4 min-h-0`}>
          <div className="w-full flex-1 min-h-0 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
            {i === 0 && (
              <div className="w-3/5 aspect-square max-h-full rounded-full shadow-2xl animate-bounce"
                style={{ background: "radial-gradient(circle at 32% 28%, hsl(var(--background)) 0%, hsl(var(--primary)) 28%, hsl(var(--primary) / 0.75) 70%, hsl(var(--foreground)) 100%)" }} />
            )}
            {i === 1 && <div className="w-3/5 aspect-square max-h-full rounded-full bg-primary/60" />}
            {i === 2 && <div className="w-3/5 aspect-square max-h-full rounded-full bg-primary/25 blur-xl" />}
            {i === 3 && <span className="slide-body font-serif italic text-muted-foreground">“ball”</span>}
          </div>
          <p className="slide-body font-display font-bold text-foreground">{l.label}</p>
          <p className="slide-caption text-muted-foreground text-center">{l.note}</p>
        </div>
      ))}
    </div>
  </div>
);

const PHRASES = ["“Visualize the end state…”", "“Picture this…”", "“Write out a mind map.”", "“Count sheep.”", "“In your mind's eye…”", "“Imagine the customer…”", "“See the big picture.”", "“Close your eyes and imagine…”"];

/** Everyday instructions that quietly assume a mind's eye. */
export const VisualizePhrasesScreen = () => (
  <div className="flex-1 flex flex-col justify-center gap-12 px-16 animate-fade-in">
    <h1 className="slide-title font-display font-bold text-foreground">How often do we say…</h1>
    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
      {PHRASES.map((p) => (
        <p key={p} className="slide-body-lg font-serif italic text-foreground/85 border-l-4 border-primary pl-6">{p}</p>
      ))}
    </div>
    <p className="slide-body text-muted-foreground">Every one assumes a picture in your head.</p>
  </div>
);
