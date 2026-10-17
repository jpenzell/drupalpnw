/**
 * A dramatic question slide — used for "What's the highest-grossing..." etc.
 */
interface QuestionRevealSlideProps {
  question: string;
  subtext?: string;
}

export const QuestionRevealSlide = ({ question, subtext }: QuestionRevealSlideProps) => {
  return (
    <div className="flex-1 flex items-center justify-center bg-curtain animate-fade-in">
      <div className="max-w-4xl mx-auto text-center space-y-6 px-4">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-curtain-foreground leading-tight">
          {question}
        </h1>
        {subtext && (
          <p className="text-lg text-curtain-foreground/50">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};
