import { MessageCircle, ShieldAlert, Lightbulb } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

export const DisclosureEffectScreen = () => {
  const { shown, Dots } = useReveal(4);
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-hidden animate-fade-in">
      <div className="max-w-5xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary/10 border border-primary/30 rounded-full">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="slide-kicker text-primary">The Disclosure Gap</span>
          </div>
          <h1 className="slide-title text-foreground">
            People tell AI <span className="text-primary">what they won't tell you.</span>
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div className={`bg-card border-2 border-secondary/30 rounded-2xl p-6 h-full text-center transition-all duration-500 ${shown(1) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <ShieldAlert className="h-8 w-8 text-secondary mx-auto mb-4" />
            <p className="slide-subtitle font-black text-secondary mb-2">68%</p>
            <p className="slide-body text-foreground">would rather confide in AI than their manager.</p>
            <p className="slide-caption text-muted-foreground mt-3">Oracle, 2025</p>
          </div>
          <div className={`bg-card border-2 border-primary/30 rounded-2xl p-6 h-full text-center transition-all duration-500 ${shown(2) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <MessageCircle className="h-8 w-8 text-primary mx-auto mb-4" />
            <p className="slide-subtitle font-black text-primary mb-2">More open</p>
            <p className="slide-body text-foreground">Less judgment → deeper honesty.</p>
            <p className="slide-caption text-muted-foreground mt-3">Lucas et al., 2014</p>
          </div>
          <div className={`bg-card border-2 border-primary/30 rounded-2xl p-6 h-full text-center transition-all duration-500 ${shown(3) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <Lightbulb className="h-8 w-8 text-primary mx-auto mb-4" />
            <p className="slide-subtitle font-black text-primary mb-2">HR gold</p>
            <p className="slide-body text-foreground">What 1:1s miss, AI surfaces.</p>
          </div>
        </div>
        {shown(4) && (
          <p className="slide-body text-center font-display italic text-foreground animate-fade-in">
            You can't coach what you can't see.
          </p>
        )}

        <Dots />
      </div>
    </div>
  );
};
