import { ZenBackdrop } from "../ZenBackdrop";

interface SimpleTextSlideProps {
  eyebrow?: string;
  primary: string;
  secondary?: string;
  tertiary?: string;
  /** Optional full-bleed photographic backdrop. */
  backdropImage?: string;
  backdropOverlay?: "heavy" | "medium" | "light" | "vignette" | "gradient-bottom" | "gradient-side";
}

/** Compact pure-typography scene for the many "spoken-line" slides in the deck. */
export const SimpleTextSlide = ({
  eyebrow,
  primary,
  secondary,
  tertiary,
  backdropImage,
  backdropOverlay = "heavy",
}: SimpleTextSlideProps) => {
  const content = (
    <div className="max-w-5xl w-full text-center space-y-8 px-6">
      {eyebrow && (
        <p className="text-sm md:text-base font-mono uppercase tracking-[0.3em] text-secondary font-semibold">
          {eyebrow}
        </p>
      )}
      <p
        className={`slide-title font-display font-semibold leading-tight ${ backdropImage ? "text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.65)]" : "text-foreground" }`}
      >
        {primary}
      </p>
      {secondary && (
        <p
          className={`slide-body-lg font-display italic leading-snug ${ backdropImage ? "text-white/95 drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)]" : "text-foreground/85" }`}
        >
          {secondary}
        </p>
      )}
      {tertiary && (
        <p className={`slide-body-lg font-display italic leading-snug drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)] ${ backdropImage ? "text-white" : "text-primary" }`}>
          {tertiary}
        </p>
      )}
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
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6">
      {content}
    </div>
  );
};
