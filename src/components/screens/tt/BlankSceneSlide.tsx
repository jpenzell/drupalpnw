export const BlankSceneSlide = () => {
  const lines = [
    { speaker: "A", line: "Hey, do you have a minute?" },
    { speaker: "B", line: "Yeah, what's going on?" },
    { speaker: "A", line: "I've been thinking about how things are going." },
    { speaker: "B", line: "OK." },
    { speaker: "A", line: "I think we should talk about it." },
    { speaker: "B", line: "Sure. Let's talk." },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-4">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center">
          The Blank Scene
        </h2>
        <p className="text-center text-muted-foreground text-sm uppercase tracking-widest">
          Live Exercise — 2 Volunteers
        </p>

        <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6 space-y-4 font-mono">
          {lines.map((l, i) => (
            <p key={i} className="text-lg text-foreground">
              <span className="text-secondary font-bold mr-3">{l.speaker}:</span>
              {l.line}
            </p>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground italic">
          Same words. Different wants. Different scene.
        </p>
      </div>
    </div>
  );
};
