import { Sparkles } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { usePresentationMode } from "@/contexts/PresentationModeContext";

export const TitleSlide = () => {
  const { isParticipant } = useSession();
  const { presenterName, presenterCompany, eventName } = usePresentationMode();

  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in relative overflow-hidden min-h-0 bg-iqa-hero">
      <div className="absolute top-8 right-8 md:top-12 md:right-14 z-20 text-right leading-tight">
        <p className="slide-body font-display font-black text-primary tracking-[0.14em]">
          ISPI
        </p>
        <p className="slide-chrome font-display text-foreground/70 tracking-[0.12em] uppercase">
          Minnesota Chapter
        </p>
      </div>

      <div
        className="relative z-10 w-full mx-auto px-12 md:px-20 flex flex-col items-center justify-center text-center gap-7 pt-14"
        style={{ WebkitFontSmoothing: "antialiased" }}
      >
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-primary/5 rounded-full border border-primary/20">
          <Sparkles className="h-5 w-5 text-spotlight" />
          <span className="slide-caption text-primary font-body tracking-[0.12em] uppercase">
            {eventName}
          </span>
        </div>

        <h1 className="font-display font-bold leading-none max-w-7xl">
          <span className="slide-title-lg block text-primary">
            Rehearsing the Future
          </span>
          <span className="slide-subtitle block mt-5 text-foreground font-medium">
            Directing the Future of Training<br />in the Age of AI
          </span>
        </h1>

        <p className="slide-caption text-foreground/65 uppercase tracking-[0.12em]">
          Online program · September 25, 2026 · 12:00–1:00 p.m. CST
        </p>

        <div className="flex flex-col items-center gap-1 pt-2">
          <span className="slide-chrome uppercase tracking-[0.3em] text-foreground/50">Director</span>
          <span className="slide-body text-foreground font-semibold font-display">{presenterName}</span>
          <span className="slide-caption text-foreground/60">{presenterCompany}</span>
        </div>

        {isParticipant && (
          <div className="bg-foreground/10 rounded-2xl px-6 py-4 border border-spotlight/40 text-center mt-2 backdrop-blur-md">
            <div className="flex items-center justify-center gap-2 text-foreground mb-1">
              <Sparkles className="h-5 w-5 text-spotlight" />
              <span className="slide-caption font-semibold">You're in the cast!</span>
            </div>
            <p className="slide-chrome text-foreground/60">
              Keep this screen handy — we'll use it for interactive moments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
