/**
 * S3a2b — Everything is a Hallucination
 * Sits between the live cars estimation (S3a2) and Annie Duke (S3a3).
 * Single-beat slide: the research quote does the work.
 */
export const HallucinationRevealScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 animate-fade-in">
      <figure className="w-full max-w-6xl mx-auto border-l-4 border-secondary pl-8 md:pl-12">
        <blockquote className="slide-title font-display italic text-foreground leading-[1.15]">
          "Hallucination is not an occasional error but an{" "}
          <span className="text-secondary not-italic font-semibold">
            inevitable feature
          </span>{" "}
          of how these systems work."
        </blockquote>
        <figcaption className="slide-caption text-base text-muted-foreground mt-8">
          — Banerjee, Agarwal &amp; Singla, <em>LLMs Will Always Hallucinate</em> (2024)
        </figcaption>
      </figure>
    </div>
  );
};
