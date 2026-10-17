export const ChallengeSlide = () => {
  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in">
      <div className="max-w-4xl mx-auto text-center space-y-10 px-4">
        <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground leading-tight">
          Would everyone on your team
          <span className="block text-primary">say the same thing?</span>
        </h1>
        <p className="text-2xl md:text-3xl text-muted-foreground font-light">
          Are you even in the <span className="text-accent font-semibold italic">same show?</span>
        </p>
      </div>
    </div>
  );
};
