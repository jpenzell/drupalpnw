import { BookOpen } from "lucide-react";

export const CulturalTendenciesSlide = () => {
  return (
    <div className="flex-1 min-h-0 w-full max-w-full flex flex-col items-center justify-center animate-fade-in px-8 py-5 overflow-hidden">
      <div className="w-full max-w-[min(56rem,calc(100%-4rem))] space-y-5">
        <div className="text-center">
          <h1 className="font-display font-bold text-[clamp(2.25rem,4.2cqw,5.25rem)] leading-none [overflow-wrap:normal]">
            <span className="block">Same model.</span>
            <span className="block italic text-primary">Different language.</span>
          </h1>
        </div>

        <div className="text-center animate-fade-in">
          <p className="font-display italic text-foreground/90 text-[clamp(1.45rem,2.7cqw,3.25rem)] leading-tight [overflow-wrap:normal]">
            "Should I take the job in another city?"
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 animate-fade-in w-full">
          <div className="min-w-0 bg-card border-2 border-border rounded-2xl px-5 py-5 text-center space-y-3 overflow-hidden">
            <div className="slide-kicker text-secondary font-bold">English</div>
            <p className="font-display italic font-bold text-primary text-[clamp(1.4rem,1.95cqw,2.5rem)] leading-tight text-balance [overflow-wrap:normal]">"Follow the opportunity."</p>
          </div>
          <div className="min-w-0 bg-card border-2 border-border rounded-2xl px-5 py-5 text-center space-y-3 overflow-hidden">
            <div className="slide-kicker text-secondary font-bold">Chinese</div>
            <p className="font-display italic font-bold text-primary text-[clamp(1.4rem,1.95cqw,2.5rem)] leading-tight text-balance [overflow-wrap:normal]">"Talk to your parents."</p>
          </div>
        </div>

        <div className="w-full rounded-xl border-2 border-primary/40 bg-primary/10 px-5 py-3 text-left text-primary">
          <div className="flex min-w-0 items-start gap-3">
            <BookOpen className="mt-1 h-4 w-4 flex-shrink-0" />
            <p className="min-w-0 break-words font-mono text-[clamp(0.9rem,1.35cqw,1.5rem)] font-medium leading-relaxed">
              Lu, Y., Song, D. & Zhang, Y. (2025). Cultural tendencies in large language models. Nature Human Behaviour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
