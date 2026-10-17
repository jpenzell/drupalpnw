import { useReveal } from "@/hooks/useReveal";

export const DirectorTitleSlide = () => {
  const { shown, Dots } = useReveal(3);
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in bg-curtain px-6">
      <div className="max-w-5xl w-full text-center space-y-12">
        <p className="text-2xl md:text-3xl font-display italic text-curtain-foreground/80 leading-snug">
          Every one of you was promoted into a role<br />nobody named.
        </p>

        {shown(2) && (
          <p className="text-2xl md:text-3xl font-display text-curtain-foreground/90 animate-fade-in">
            Today you got the title.
          </p>
        )}

        {shown(3) && (
          <div className="space-y-10 animate-fade-in">
            <h1 className="text-8xl md:text-[12rem] font-display font-bold text-spotlight spotlight-glow tracking-tight">
              DIRECTOR.
            </h1>
            <div className="space-y-3 pt-4">
              <p className="text-3xl md:text-4xl font-display text-curtain-foreground">
                Cast. <span className="italic">Rehearse.</span> Direct.
              </p>
              <p className="text-lg md:text-xl font-mono text-secondary italic">
                Theater's been waiting for you for four hundred years.
              </p>
            </div>
          </div>
        )}

        <Dots />
      </div>
    </div>
  );
};
