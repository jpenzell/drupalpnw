import { ZenBackdrop } from "../ZenBackdrop";

/**
 * Simple transition / bridge slide with a short statement.
 */
interface TransitionSlideProps {
  lines: string[];
  /** Indices of lines to emphasize (larger + primary color). */
  emphasizeIndices?: number[];
  /** Optional full-bleed photographic backdrop. */
  backdropImage?: string;
  backdropOverlay?: "heavy" | "medium" | "light" | "vignette" | "gradient-bottom" | "gradient-side";
}

export const TransitionSlide = ({
  lines,
  emphasizeIndices = [],
  backdropImage,
  backdropOverlay = "heavy",
}: TransitionSlideProps) => {
  const onBackdrop = !!backdropImage;
  const content = (
    <div className="max-w-4xl mx-auto text-center space-y-5 px-4">
      {lines.map((line, i) => {
        const isLast = i === lines.length - 1;
        const isEmphasized = emphasizeIndices.includes(i);

        let className = "font-display leading-relaxed ";
        if (isLast) {
          className += onBackdrop
            ? "text-2xl md:text-4xl text-spotlight font-bold spotlight-glow drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)]"
            : "text-2xl md:text-4xl text-secondary font-bold spotlight-glow";
        } else if (isEmphasized) {
          className += onBackdrop
            ? "text-3xl md:text-5xl text-primary font-semibold drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)]"
            : "text-3xl md:text-5xl text-primary font-semibold";
        } else {
          className += onBackdrop
            ? "text-2xl md:text-4xl text-white/85 font-light drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)]"
            : "text-2xl md:text-4xl text-muted-foreground font-light";
        }

        return (
          <p key={i} className={className}>
            {line}
          </p>
        );
      })}
    </div>
  );

  if (backdropImage) {
    return (
      <ZenBackdrop image={backdropImage} overlay={backdropOverlay} kenBurns>
        {content}
      </ZenBackdrop>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in">
      {content}
    </div>
  );
};
