import { Citation } from "@/components/blocks/Citation";

/**
 * Opening acknowledgment: this room already knows how to build a learning culture.
 * Uses Penske Transportation Solutions' own published L&D record.
 */
export const PenskeLearningCultureSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-10 py-8">
    <div className="w-full max-w-6xl space-y-7 text-center">
      <div className="slide-kicker text-secondary font-bold tracking-[0.25em]">
        Why this room, specifically
      </div>
      <h1 className="slide-title font-display font-bold text-foreground leading-tight">
        You already run one of the most respected learning cultures in the country.
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { n: "95%", label: "of 5,200 frontline leaders complete leadership development" },
          { n: "~100%", label: "completion at director level and above" },
          { n: "2022", label: "CLO Learning in Practice Award — Business Partnership, Gold" },
        ].map((x) => (
          <div key={x.label} className="bg-card border-2 border-border rounded-2xl p-6 space-y-2">
            <div
              className="font-display font-bold text-primary leading-none"
              style={{ fontSize: "clamp(2.5rem, 5cqw, 4rem)" }}
            >
              {x.n}
            </div>
            <div className="slide-caption text-foreground/75">{x.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 border-l-4 border-l-primary rounded-2xl p-7 text-left">
        <p className="font-display italic text-foreground leading-snug slide-body-lg">
          "We didn't just digitize an experience, which was the temptation."
        </p>
        <div className="slide-caption text-foreground/70 mt-3">
          — Laura Heaton, VP Talent Development, Penske Transportation Solutions
        </div>
      </div>

      <p className="slide-body text-foreground/85 max-w-4xl mx-auto">
        That instinct is exactly the one AI is about to test again. The temptation now isn't to
        digitize — it's to <span className="italic">automate</span> the craft out of the work.
      </p>

      <Citation
        sources={[
          "Kruse, K. (2023). How Penske Paves the Way to a Legendary Culture of Learning. Forbes.",
          "Chief Learning Officer (2022). Learning in Practice Awards.",
        ]}
      />
    </div>
  </div>
);
