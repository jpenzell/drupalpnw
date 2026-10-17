interface Panel {
  label: string;
  prompt: string;
  cached: string;
}

interface StaticAIResultProps {
  variant: "split" | "single";
  panelA: Panel;
  panelB?: Panel;
}

const PanelCard = ({ panel }: { panel: Panel }) => (
  <div className="flex-1 flex flex-col gap-4 p-6 rounded-2xl bg-card border-2 border-border min-h-[280px]">
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm uppercase tracking-[0.2em] text-secondary font-bold">
        {panel.label}
      </span>
    </div>
    <div className="text-sm font-mono text-muted-foreground italic border-l-2 border-secondary/40 pl-3">
      {panel.prompt}
    </div>
    <div className="flex-1 flex items-center justify-center">
      <p className="text-xl md:text-2xl font-display text-foreground leading-snug">
        "{panel.cached}"
      </p>
    </div>
  </div>
);

export const StaticAIResult = ({ variant, panelA, panelB }: StaticAIResultProps) => (
  <div className="w-full max-w-6xl mx-auto">
    <div className={`flex gap-6 ${variant === "split" ? "flex-col md:flex-row" : "flex-col"}`}>
      <PanelCard panel={panelA} />
      {variant === "split" && panelB && <PanelCard panel={panelB} />}
    </div>
  </div>
);
