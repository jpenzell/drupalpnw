/**
 * Reusable scene opener — the "curtain" transition between scenes.
 */
interface SceneOpenerProps {
  sceneNumber: number;
  title: string;
  subtitle?: string;
}

export const SceneOpener = ({ sceneNumber, title, subtitle }: SceneOpenerProps) => {
  return (
    <div className="flex-1 flex items-center justify-center bg-curtain animate-curtain-open">
      <div className="text-center space-y-6">
        <p className="text-curtain-foreground/60 font-body text-lg tracking-[0.3em] uppercase">
          Scene {sceneNumber}
        </p>
        <h1 className="text-5xl md:text-7xl font-display font-bold text-curtain-foreground spotlight-glow leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl text-curtain-foreground/70 font-light max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
