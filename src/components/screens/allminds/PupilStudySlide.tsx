import { Citation } from "@/components/blocks/Citation";

/**
 * The pupil study: imagery isn't only something people report — it shows up in
 * the body. When aphantasics try to visualize, their pupils stay still, even
 * though the same pupils respond normally to real light.
 */
export const PupilStudySlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in px-8 py-6">
    <div className="max-w-5xl w-full space-y-7">
      <p className="slide-kicker font-mono uppercase tracking-[0.3em] text-secondary font-semibold">
        It goes further than the head
      </p>
      <p className="slide-title font-display font-bold text-foreground leading-tight">
        Your body keeps score.
      </p>
      <p className="slide-body-lg font-display text-foreground/85 leading-snug">
        Imagine a bright sky and your pupil shrinks. Imagine a dark room and it widens.
      </p>
      <p className="slide-body-lg font-display italic text-foreground/85 leading-snug">
        With aphantasia, the pupil never moves — while still answering real light normally.
      </p>
      <p className="slide-body-lg font-display italic font-semibold text-primary leading-snug">
        The body agrees: nothing was there.
      </p>
      <div className="pt-2">
        <Citation sources={["Kay, Keogh, Andrillon & Pearson (2022). eLife, 11:e72484."]} />
      </div>
    </div>
  </div>
);
