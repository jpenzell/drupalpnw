import { useReveal } from "@/hooks/useReveal";
import { Camera, Smartphone } from "lucide-react";

export const PhotographySmartphoneSlide = () => {
  const { shown, Dots } = useReveal(4);

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-16">
      <div className="max-w-6xl w-full space-y-8 text-center">
        <p className="slide-kicker text-secondary">Rehearsal is cheap because failure is cheap</p>

        <h1 className="slide-subtitle font-display font-light text-foreground leading-tight">
          You didn't learn photography
          <br />
          to use a <span className="text-primary italic">smartphone camera.</span>
        </h1>

        <div
          className={`grid md:grid-cols-2 gap-6 transition-all duration-700 ${
            shown(1) ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="p-6 rounded-2xl border border-border bg-muted/20 text-left">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-full bg-muted">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="slide-body-lg font-display text-muted-foreground">Film</p>
            </div>
            <p className="slide-body text-muted-foreground leading-snug">
              Every shot cost money. You learned the craft first.
            </p>
          </div>

          <div className="p-6 rounded-2xl border-2 border-primary/40 bg-primary/5 text-left">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <p className="slide-body-lg font-display text-foreground">Smartphone</p>
            </div>
            <p className="slide-body text-foreground leading-snug">
              $0 per photo. The craft moved into the tool.
            </p>
          </div>
        </div>

        {shown(2) && (
          <p className="slide-body-lg font-display text-foreground animate-fade-in leading-snug max-w-4xl mx-auto">
            Imagine demanding aperture lessons before anyone took a photo in 2007.
            <br />
            <span className="italic text-secondary font-semibold">Ridiculous then. Ridiculous for AI now.</span>
          </p>
        )}

        {shown(3) && (
          <p className="slide-subtitle font-display text-foreground animate-fade-in leading-tight">
            Shoot 200. Keep 5.
            <br />
            <span className="text-primary font-semibold">Experiment freely.</span>
          </p>
        )}

        <div className="mt-4">
          <Dots />
        </div>
      </div>
    </div>
  );
};
