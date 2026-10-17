import { GraduationCap, ShieldCheck, Lightbulb, Drama, Heart } from "lucide-react";

const Card = ({ icon: Icon, children }: { icon: any; children: React.ReactNode }) => (
  <div className="bg-primary/15 border-2 border-primary rounded-3xl p-6 shadow-2xl text-center h-full flex flex-col items-center justify-center">
    <Icon className="h-12 w-12 text-primary mx-auto mb-3" />
    <p className="slide-body-lg font-bold text-foreground leading-tight">
      {children}
    </p>
  </div>
);

export const NextStepsSlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-in px-12">
      <div className="w-full max-w-7xl space-y-8">
        {/* Headline */}
        <div className="text-center space-y-3">
          <p className="slide-body-lg font-semibold text-primary uppercase tracking-widest">
            Monday Morning
          </p>
          <h1 className="slide-title font-bold text-foreground leading-tight">
            Lead the change.
          </h1>
        </div>

        {/* Top row — 3 cards */}
        <div className="grid grid-cols-6 gap-5 auto-rows-fr">
          <div className="col-span-2"><Card icon={Heart}>
            Lead with <span className="text-primary">feelings</span>,<br />not features.
          </Card></div>
          <div className="col-span-2"><Card icon={GraduationCap}>
            Train <span className="text-primary">coaching</span>,<br />not prompting.
          </Card></div>
          <div className="col-span-2"><Card icon={ShieldCheck}>
            Reward <span className="text-primary">creativity</span> &amp; <span className="text-primary">verification</span>.
          </Card></div>
        </div>

        {/* Bottom row — 2 cards centered, same width as top */}
        <div className="grid grid-cols-6 gap-5 auto-rows-fr">
          <div className="col-start-2 col-span-2"><Card icon={Lightbulb}>
            Ask AI for <span className="text-primary">ideas</span>,<br />not answers.
          </Card></div>
          <div className="col-span-2"><Card icon={Drama}>
            Encourage <span className="text-primary">rehearsing</span><br />— and failure.
          </Card></div>
        </div>
      </div>
    </div>
  );
};
