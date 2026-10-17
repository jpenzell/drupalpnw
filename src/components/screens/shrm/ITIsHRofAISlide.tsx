import { Sparkles } from "lucide-react";
import jensenHuang from "@/assets/jensen-huang-ces-2025.jpg";

/**
 * S3a3c — Jensen Huang quote bridge.
 * "IT will become the HR of AI agents" — flips the frame for HR leaders.
 */
export const ITIsHRofAISlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 animate-fade-in select-none">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="order-2 lg:order-1 space-y-10 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2 text-secondary">
            <Sparkles className="h-4 w-4" />
            <span className="uppercase tracking-[0.3em] text-xs font-semibold">
              Jensen Huang · Nvidia · CES 2025
            </span>
          </div>

          <blockquote className="slide-title-lg font-display font-bold leading-[1.05] text-foreground">
            <span className="slide-title-lg text-primary leading-none">“</span>
            <span className="text-primary italic">IT</span> will become the{" "}
            <span className="text-primary italic">HR of AI agents.</span>
            <span className="slide-title-lg text-primary leading-none">”</span>
          </blockquote>
        </div>

        <div className="order-1 lg:order-2 flex justify-center">
          <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10">
            <img
              src={jensenHuang}
              alt="Jensen Huang, CEO of NVIDIA, delivering the CES 2025 keynote"
              loading="lazy"
              width={1024}
              height={1024}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
