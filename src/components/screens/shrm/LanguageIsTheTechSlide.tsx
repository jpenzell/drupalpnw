/**
 * S3a3b — Bridge between Annie Duke and Hidden Bias.
 * "The new programming language is your language."
 * "And language is highly subjective… and easily misunderstood."
 */
export const LanguageIsTheTechSlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 py-10 animate-fade-in select-none">
      <div className="w-full max-w-6xl mx-auto text-center space-y-8">
        <h1 className="slide-title font-display font-bold leading-[1.05] text-foreground">
          &ldquo;The new programming language is{" "}
          <span className="text-primary italic">your language.</span>&rdquo;
        </h1>

        <p className="slide-subtitle font-display text-foreground leading-snug animate-fade-in max-w-5xl mx-auto">
          And <span className="text-primary italic font-bold">language</span> is highly{" "}
          <span className="text-primary italic font-bold">subjective</span>
          <span className="text-muted-foreground"> … and easily </span>
          <span className="text-primary italic font-bold">misunderstood.</span>
        </p>
      </div>
    </div>
  );
};
