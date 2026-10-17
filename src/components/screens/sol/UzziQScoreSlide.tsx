import { Citation } from "@/components/blocks/Citation";

/** A3-1-2 — The question + the curve. */
export const UzziQScoreSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-6">
    <div className="max-w-[1400px] w-full space-y-4">
      <div className="text-center space-y-2">
        <p className="slide-kicker">Brian Uzzi · Northwestern Kellogg</p>
        <h1 className="slide-title-lg">
          What makes an ensemble <span className="italic text-primary">work?</span>
        </h1>
      </div>

      <div className="w-full">
        <svg viewBox="0 0 900 320" className="w-full">
          <line x1="40" y1="270" x2="860" y2="270" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
          <text x="450" y="310" textAnchor="middle" className="fill-muted-foreground font-mono" fontSize="18">
            Q-score (team familiarity) →
          </text>
          <path
            d="M 70 255 Q 450 -30 830 255"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="450" cy="50" r="11" fill="hsl(var(--primary))" />
          <line x1="450" y1="50" x2="450" y2="270" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.4" />
          <text x="450" y="30" textAnchor="middle" className="fill-primary font-display" fontSize="32" fontStyle="italic">
            The bliss point
          </text>
          <text x="450" y="78" textAnchor="middle" className="fill-foreground font-mono font-bold" fontSize="20">
            Q ≈ 2.6 · 3× more likely to succeed
          </text>
          <text x="450" y="288" textAnchor="middle" className="fill-primary font-mono font-bold" fontSize="14">
            Q ≈ 2.6
          </text>
          <text x="90" y="295" textAnchor="middle" className="fill-foreground font-mono font-bold" fontSize="18">
            All strangers
          </text>
          <text x="810" y="295" textAnchor="middle" className="fill-foreground font-mono font-bold" fontSize="18">
            All old friends
          </text>
        </svg>
      </div>

      <Citation sources={["Uzzi & Spiro (2005). Collaboration and Creativity. AJS, 111(2)."]} />
    </div>
  </div>
);

/** A3-1-2b — How he measured it + West Side Story. */
export const UzziHowMeasuredSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-6">
    <div className="max-w-[1400px] w-full space-y-8">
      <div className="text-center space-y-2">
        <p className="slide-kicker">How Uzzi measured it</p>
        <h1 className="slide-title">
          A team isn't a list of names.<br />
          It's a <span className="italic text-primary">graph of prior ties.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-7 rounded-2xl border-2 border-primary/40 bg-primary/5 text-center">
          <p className="text-sm uppercase tracking-widest text-primary font-bold mb-3">The data</p>
          <p className="slide-subtitle font-display text-foreground">
            <span className="font-bold text-primary">474</span> Broadway musicals.
          </p>
          <p className="slide-caption text-base text-foreground/85 italic mt-2">1945–1989.</p>
        </div>
        <div className="p-7 rounded-2xl border-2 border-secondary/50 bg-secondary/10 text-center">
          <p className="text-sm uppercase tracking-widest text-primary font-bold mb-3">The peak</p>
          <p className="slide-subtitle font-display italic text-foreground font-bold">
            West Side Story.
          </p>
          <p className="slide-caption text-base text-foreground/85 italic mt-2">
            Bernstein + Robbins + a 25-year-old Sondheim.
          </p>
        </div>
      </div>
    </div>
  </div>
);

/** A3-1-2c — Replication across 17.9M scientific papers. */
export const UzziReplicationSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-6">
    <div className="max-w-[1200px] w-full text-center space-y-8">
      <p className="slide-kicker">Then he ran it again</p>
      <h1 className="slide-title font-display font-light text-foreground leading-tight">
        <span className="font-bold text-primary">17.9 million</span><br />
        scientific papers.
      </h1>
      <p className="slide-body-lg font-display italic text-foreground/85">
        Same curve. Same peak.
      </p>
      <Citation sources={[
        "Uzzi, Mukherjee, Stringer & Jones (2013). Atypical combinations and",
        "scientific impact. Science, 342(6157), 468–472.",
      ]} />
    </div>
  </div>
);
