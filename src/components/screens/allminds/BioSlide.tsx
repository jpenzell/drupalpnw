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
 * a hairline divider between them, and both columns vertically centred so
 * neither ends in a dead zone.
 */

// The report's own scale: -10 (ADHD sample) … 0 … +10 (normative sample).
const SCALE_MIN = -10;
const SCALE_MAX = 10;
const SCORE = -2.47;

// -2.47 lands at 37.65% along a -10 → +10 track.
const MARKER_PCT = ((SCORE - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;

export const BioSlide = () => (
  <div className="flex-1 flex items-center justify-center animate-fade-in px-24 py-16">
    <div className="w-full grid grid-cols-[420px_minmax(0,1fr)] gap-x-24 items-center">
      {/* Left: the person */}
      <div className="flex flex-col gap-7">
        <div className="w-[420px] h-[420px] rounded-3xl overflow-hidden border-4 border-primary/40 shadow-2xl">
          <img
            src={joshHeadshot}
            alt="Josh Penzell"
            className="w-full h-full object-cover"
            width={420}
            height={420}
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
      <div className="border-l border-border/70 pl-24 flex flex-col gap-12">
        <div className="space-y-4">
          <p className="slide-kicker font-mono uppercase tracking-[0.3em] text-secondary font-semibold">
            About the presenter
          </p>
          <p className="slide-title font-display font-bold text-foreground leading-[1.05]">
            <span className="block">Diagnosed with ADD</span>
            <span className="block">at 39.</span>
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex items-baseline gap-7">
            <p className="slide-title-lg font-display font-bold text-primary leading-none">
              −2.47
            </p>
            <p className="slide-body text-muted-foreground">
              My Attention Comparison Score
            </p>
          </div>

          <div className="relative pt-14">
            {/* The marker: where my score landed */}
            <div
              className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${MARKER_PCT}%` }}
            >
              <svg viewBox="0 0 24 16" className="h-8 w-11 text-primary" aria-hidden="true">
                <polygon points="12,16 0,0 24,0" fill="currentColor" />
              </svg>
            </div>

            <div className="h-8 w-full rounded-full border border-border bg-gradient-to-r from-primary via-muted to-muted/30" />

            {/* The zero line: the boundary between the two samples */}
            <div
              className="absolute top-14 bottom-6 w-px bg-foreground/40"
              style={{ left: "50%" }}
            />

            <div className="mt-5 grid grid-cols-3 slide-body text-muted-foreground">
              <span className="justify-self-start whitespace-nowrap">−10 · ADHD sample</span>
              <span className="justify-self-center whitespace-nowrap">0</span>
              <span className="justify-self-end whitespace-nowrap">Normative sample · +10</span>
            </div>
          </div>

          <p className="slide-body-lg text-muted-foreground leading-snug max-w-[1000px]">
            Below zero means it read my attention the way it reads people
            independently diagnosed with ADHD. It took 39 years to have a name
            for it.
          </p>
        </div>
      </div>
    </div>
  </div>
);
