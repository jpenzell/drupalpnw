import joshHeadshot from "@/assets/josh-headshot.jpeg";

/**
 * Bio slide, played straight after the title screen.
 *
 * The one number that carries the story is rebuilt large enough to read from
 * the back row: the Attention Comparison Score from Josh's own T.O.V.A. report
 * (-2.47), sitting on the ADHD-sample side of the scale. The clinical page
 * itself stays off the projector — no name, no fine print.
 */

// The report's own scale: -10 (ADHD sample) … 0 … +10 (normative sample).
const SCALE_MIN = -10;
const SCALE_MAX = 10;
const SCORE = -2.47;

// -2.47 lands at 37.65% along a -10 → +10 track.
const MARKER_PCT = ((SCORE - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;

export const BioSlide = () => (
  <div className="flex-1 flex items-center justify-center animate-fade-in px-10 py-8">
    <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-14">
      {/* Left: the person */}
      <div className="flex-shrink-0 flex flex-col items-center gap-5 text-center">
        <div className="w-64 h-64 rounded-3xl overflow-hidden border-4 border-primary/40 shadow-2xl">
          <img
            src={joshHeadshot}
            alt="Josh Penzell"
            className="w-full h-full object-cover"
            width={256}
            height={256}
            loading="eager"
            decoding="sync"
          />
        </div>
        <div>
          <p className="slide-subtitle font-display font-bold text-foreground leading-tight">
            Josh Penzell
          </p>
          <p className="slide-caption text-muted-foreground italic mt-1">MFA · MBA</p>
        </div>
        <p className="slide-caption text-muted-foreground max-w-xs leading-snug">
          Theater director for the first part of my career.
        </p>
      </div>

      {/* Right: the diagnosis, and the measurement behind it */}
      <div className="flex-1 w-full min-w-[320px] space-y-8">
        <div className="space-y-4">
          <p className="slide-kicker font-mono uppercase tracking-[0.3em] text-secondary font-semibold">
            About the presenter
          </p>
          <p className="slide-title font-display font-bold text-foreground leading-tight">
            Diagnosed with ADD at 39.
          </p>
        </div>

        <div className="pt-2">
          <p className="slide-body-lg font-display font-semibold text-primary leading-snug">
            −2.47
          </p>
          <p className="slide-caption text-muted-foreground mt-1">
            My Attention Comparison Score
          </p>

          <div className="relative mt-14">
            <div className="h-6 w-full rounded-full border border-border bg-gradient-to-r from-primary via-muted to-muted/30" />

            {/* The zero line: the boundary between the two samples */}
            <div
              className="absolute -top-3 -bottom-3 w-px bg-foreground/40"
              style={{ left: "50%" }}
            />

            {/* The marker: where my score landed */}
            <div
              className="absolute -top-8 flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${MARKER_PCT}%` }}
            >
              <svg viewBox="0 0 24 16" className="h-5 w-7 text-primary" aria-hidden="true">
                <polygon points="12,16 0,0 24,0" fill="currentColor" />
              </svg>
            </div>

            <div className="relative mt-3 slide-chrome text-muted-foreground">
              <span className="absolute left-0">−10 · ADHD sample</span>
              <span className="absolute left-1/2 -translate-x-1/2">0</span>
              <span className="absolute right-0">Normative sample · +10</span>
            </div>
          </div>

          <p className="slide-caption text-muted-foreground mt-10 leading-snug">
            Below zero means the test read my attention the same way it reads
            people independently diagnosed with ADHD. It took 39 years to have
            a name for it.
          </p>
        </div>
      </div>
    </div>
  </div>
);
