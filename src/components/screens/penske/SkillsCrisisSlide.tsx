import { Citation } from "@/components/blocks/Citation";

/**
 * The L&D-specific stake: the field is under skills-crisis pressure,
 * which is exactly what makes "just use AI to make it faster" so seductive.
 */
export const SkillsCrisisSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-10 py-8">
    <div className="w-full max-w-6xl space-y-7 text-center">
      <div className="slide-kicker text-secondary font-bold tracking-[0.25em]">
        The pressure on your function
      </div>
      <h1 className="slide-subtitle font-display font-bold text-foreground">
        Half of L&amp;D is being asked to close a gap that keeps moving.
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border-2 border-border rounded-2xl p-8 space-y-3">
          <div
            className="font-display font-bold text-primary leading-none"
            style={{ fontSize: "clamp(3.5rem, 7cqw, 6rem)" }}
          >
            49%
          </div>
          <p className="slide-caption text-foreground/80">
            of L&amp;D professionals say executives worry employees lack the skills to execute the
            business strategy
          </p>
        </div>
        <div className="bg-card border-2 border-border rounded-2xl p-8 space-y-3">
          <div
            className="font-display font-bold text-spotlight leading-none"
            style={{ fontSize: "clamp(3.5rem, 7cqw, 6rem)" }}
          >
            36%
          </div>
          <p className="slide-caption text-foreground/80">
            of organizations actually qualify as career development champions
          </p>
        </div>
      </div>

      <p className="slide-body text-foreground/85 max-w-5xl mx-auto">
        Under that pressure, AI looks like a speed problem. It isn't. Producing more of the same
        course, faster, closes nothing. The gap closes when the work changes — and that is a
        direction problem.
      </p>

      <Citation sources={["LinkedIn Learning (2025). Workplace Learning Report."]} />
    </div>
  </div>
);
