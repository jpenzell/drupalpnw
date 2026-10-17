import { ReactNode } from "react";

interface ZenBackdropProps {
  /** Full-bleed background image URL. */
  image: string;
  /** Overlay strength. "heavy" = readable big type on any photo; "medium" = lets photo breathe; "light" = barely there. */
  overlay?: "heavy" | "medium" | "light" | "vignette" | "gradient-bottom" | "gradient-side";
  /** Optional Ken Burns slow zoom for cinematic feel. */
  kenBurns?: boolean;
  /** Optional alt text for screen readers. */
  alt?: string;
  children: ReactNode;
}

const OVERLAY_MAP: Record<NonNullable<ZenBackdropProps["overlay"]>, string> = {
  // Bumped alphas for projector legibility — text-white now reads on any photo.
  heavy:
    "bg-[radial-gradient(ellipse_at_center,_hsl(270_30%_3%/0.72)_0%,_hsl(270_30%_3%/0.92)_100%)]",
  medium:
    "bg-[radial-gradient(ellipse_at_center,_hsl(270_30%_3%/0.5)_0%,_hsl(270_30%_3%/0.8)_100%)]",
  light:
    "bg-[radial-gradient(ellipse_at_center,_hsl(270_30%_3%/0.25)_0%,_hsl(270_30%_3%/0.55)_100%)]",
  vignette:
    "bg-[radial-gradient(ellipse_at_center,_hsl(270_30%_3%/0.25)_30%,_hsl(270_30%_3%/0.9)_100%)]",
  "gradient-bottom":
    "bg-gradient-to-t from-background via-background/90 to-background/20",
  "gradient-side":
    "bg-gradient-to-r from-background via-background/85 to-background/10",
};

/**
 * Full-bleed cinematic backdrop wrapper for "Presentation Zen" style slides.
 * Pairs a photographic background with a tunable dark overlay so overlaid type
 * stays readable while the image carries the emotional weight.
 */
export const ZenBackdrop = ({
  image,
  overlay = "medium",
  kenBurns = false,
  alt = "",
  children,
}: ZenBackdropProps) => (
  <div
    className={`flex-1 relative overflow-hidden flex items-center justify-center animate-fade-in min-h-0 ${
      overlay === "gradient-bottom" || overlay === "gradient-side" ? "" : "zen-dark"
    }`}
  >
    <img
      src={image}
      alt={alt}
      aria-hidden={alt === ""}
      className={`absolute inset-0 w-full h-full object-cover ${
        kenBurns ? "animate-zen-kenburns" : ""
      }`}
      loading="eager"
      decoding="sync"
      // @ts-expect-error fetchpriority is a valid HTML attribute
      fetchpriority="high"
      width={1920}
      height={1080}
    />

    <div className={`absolute inset-0 ${OVERLAY_MAP[overlay]}`} aria-hidden />
    <div className="relative z-10 w-full h-full flex items-center justify-center">
      {children}
    </div>
  </div>
);
