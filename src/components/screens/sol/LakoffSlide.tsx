import { Citation } from "@/components/blocks/Citation";

export const LakoffSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6">
    <div className="max-w-5xl w-full text-center space-y-10">
      <p className="slide-title font-display font-light text-muted-foreground leading-snug">
        Metaphors aren't decoration on thought.
      </p>
      <p className="slide-title font-display text-primary leading-snug italic">
        They're the architecture of thought.
      </p>
      <Citation sources={["Lakoff & Johnson (1980/2003). Metaphors We Live By. Univ. of Chicago Press."]} />
    </div>
  </div>
);
