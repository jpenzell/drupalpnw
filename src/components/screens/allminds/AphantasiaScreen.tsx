/** Imagery spectrum: what "picture a ball" looks like inside four different minds. */
const LEVELS = [
  { label: "Vivid", note: "Color, texture, light — maybe it bounces" },
  { label: "Clear", note: "A shape, but flat" },
  { label: "Faint", note: "A blur you have to hold onto" },
  { label: "Aphantasia", note: "Nothing to see — you just know “ball”" },
];

export const AphantasiaScreen = () => (
  <div className="flex-1 flex flex-col justify-center gap-12 px-16 animate-fade-in">
    <div className="space-y-4">
      <p className="slide-kicker text-secondary font-semibold">Aphantasia</p>
      <h1 className="slide-title font-display font-bold text-foreground">No mind's eye — and most people never know.</h1>
      <p className="slide-body-lg text-foreground/75">Little or no voluntary mental imagery. Same word, four different inner screens.</p>
    </div>
    <div className="grid grid-cols-4 gap-8">
      {LEVELS.map((l, i) => (
        <div key={l.label} className={`rounded-3xl border-2 ${i === 3 ? "border-primary" : "border-border"} bg-card p-6 flex flex-col items-center gap-5`}>
          <div className="w-full aspect-square rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
            {i === 0 && (
              <div className="w-3/5 aspect-square rounded-full shadow-2xl animate-bounce"
                style={{ background: "radial-gradient(circle at 32% 28%, hsl(var(--background)) 0%, hsl(var(--primary)) 28%, hsl(var(--primary) / 0.75) 70%, hsl(var(--foreground)) 100%)" }} />
            )}
            {i === 1 && <div className="w-3/5 aspect-square rounded-full bg-primary/60" />}
            {i === 2 && <div className="w-3/5 aspect-square rounded-full bg-primary/25 blur-xl" />}
            {i === 3 && <span className="slide-body font-serif italic text-muted-foreground">“ball”</span>}
          </div>
          <p className="slide-body font-display font-bold text-foreground">{l.label}</p>
          <p className="slide-caption text-muted-foreground text-center">{l.note}</p>
        </div>
      ))}
    </div>
  </div>
);
