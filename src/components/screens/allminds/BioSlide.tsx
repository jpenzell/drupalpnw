import joshHeadshot from "@/assets/josh-headshot.jpeg";

/**
 * Bio slide, played straight after the title screen.
 *
 * The one number that carries the story is rebuilt large enough to read from
 * the back row: the Attention Comparison Score from Josh's own T.O.V.A. report
 * (-2.47), sitting on the ADHD-sample side of the scale. The clinical page
 * itself stays off the projector — no name, no fine print.
 *
 * Layout: full stage width (no max-width cap), one flush-left axis per column,
 * a hairline divider between them, both columns vertically centred. The score
 * sits directly above the arrow that points at its place on the scale, so the
 * number and the marker can't be read as two separate facts.
 */

// The report's own scale: -10 (ADHD sample) … 0 … +10 (normative sample).
const SCALE_MIN = -10;
const SCALE_MAX = 10;
const SCORE = -2.47;

// -2.47 lands at 37.65% along a -10 → +10 track.
const MARKER_PCT = ((SCORE - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;

export const BioSlide = () => (
  <div className="flex-1 flex items-center justify-center animate-fade-in px-20 py-16">
    <div className="w-full grid grid-cols-[480px_minmax(0,1fr)] gap-x-20 items-center">
      {/* Left: the person */}
      <div className="flex flex-col gap-8">
        <div className="w-[480px] h-[480px] rounded-3xl overflow-hidden border-4 border-primary/40 shadow-2xl">
          <img
            src={joshHeadshot}
            alt="Josh Penzell"
            className="w-full h-full object-cover"
            width={480}
            height={480}
            loading="eager"
            decoding="sync"
          />
        </div>
        <div>
          <p className="slide-subtitle font-display font-bold text-foreground leading-tight">
            Josh Penzell
          </p>
          <p className="slide-body text-muted-foreground italic mt-2">MFA · MBA</p>
        </div>
        <p className="slide-body text-muted-foreground leading-snug">
          Theater director for the first part of my career.
        </p>
      </div>

      {/* Right: the diagnosis, then the measurement behind it */}
      <div className="border-l border-border/70 pl-20 flex flex-col gap-12">
        <div className="space-y-4">
          <p className="slide-kicker font-mono uppercase tracking-[0.3em] text-secondary font-semibold">
            About the presenter
          </p>
          <p className="slide-title font-display font-bold text-foreground leading-[1.05]">
            <span className="block">Diagnosed with ADD</span>
            <span className="block">at 39.</span>
          </p>
        </div>

        <div className="space-y-9">
          <p className="slide-body text-muted-foreground">My Attention Comparison Score</p>

          <div className="relative pt-44">
            {/* The score, standing directly over the arrow that marks it */}
            <div
              className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${MARKER_PCT}%` }}
            >
              <p className="slide-title-lg font-display font-bold text-primary leading-none whitespace-nowrap">
                −2.47
              </p>
              <svg
                viewBox="0 0 24 16"
                className="mt-3 h-9 w-12 text-primary"
                aria-hidden="true"
              >
                <polygon points="12,16 0,0 24,0" fill="currentColor" />
              </svg>
            </div>

            <div className="relative">
              <div className="h-8 w-full rounded-full border border-border bg-gradient-to-r from-primary via-muted to-muted/30" />
              {/* The zero line: the boundary between the two samples */}
              <div
                className="absolute -top-3 -bottom-3 w-[3px] rounded-full bg-foreground/60"
                style={{ left: "50%" }}
              />
            </div>

            <div className="relative mt-6 h-12">
              <span className="absolute left-0 slide-body text-muted-foreground whitespace-nowrap">
                −10 · ADHD sample
              </span>
              <span
                className="absolute left-1/2 -translate-x-1/2 slide-body text-muted-foreground"
                style={{ top: 0 }}
              >
                0
              </span>
              <span className="absolute right-0 slide-body text-muted-foreground whitespace-nowrap">
                Normative sample · +10
              </span>
            </div>
          </div>

          <p className="slide-body-lg text-muted-foreground leading-snug max-w-[1050px]">
            Below zero means it read my attention the way it reads people
            independently diagnosed with ADHD. It took 39 years to have a name
            for it.
          </p>
        </div>
      </div>
    </div>
  </div>
);
