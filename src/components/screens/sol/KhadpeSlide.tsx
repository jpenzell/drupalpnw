import { useReveal } from "@/hooks/useReveal";
import { Citation } from "@/components/blocks/Citation";
import { Star, EyeOff, Sliders } from "lucide-react";

export const KhadpeSlide = () => {
  const { shown, Dots } = useReveal(3);

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-6">
      <div className="max-w-[1400px] w-full space-y-6">
        <div className="text-center space-y-2">
          <p className="slide-kicker">Stanford · Khadpe et al. · 2020</p>
          <h1 className="slide-title">
            One word changed. Different AI. Same human.
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { label: "a wry teenager", stars: 4, hi: true },
            { label: "an experienced butler", stars: 2, hi: false },
          ].map((p) => (
            <div
              key={p.label}
              className="p-7 rounded-2xl bg-card border-2 border-border space-y-4"
            >
              <p className="text-sm uppercase tracking-widest text-muted-foreground font-mono">
                "You're chatting with…"
              </p>
              <p className="slide-body-lg font-display italic text-foreground">
                {p.label}
              </p>
              <div
                className={`flex justify-center gap-2 transition-opacity duration-700 ${
                  shown(2) ? "opacity-100" : "opacity-0"
                }`}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-9 w-9 ${
                      i <= p.stars
                        ? p.hi
                          ? "fill-primary text-primary"
                          : "fill-muted-foreground/40 text-muted-foreground/40"
                        : "text-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {shown(2) && (
          <p className="slide-body text-center text-muted-foreground italic animate-fade-in">
            Identical performance. The wry teenager wins by{" "}
            <span className="text-primary font-semibold not-italic">2 stars.</span>
          </p>
        )}

        {shown(3) && (
          <div className="bg-secondary/10 border-2 border-secondary/40 rounded-2xl px-6 py-5 animate-fade-in">
            <div className="flex items-center gap-4">
              <EyeOff className="h-7 w-7 text-primary flex-shrink-0" />
              <p className="slide-body font-display text-foreground leading-snug">
                The "AI" was a{" "}
                <span className="text-primary font-semibold">human</span> — same answers, no idea which metaphor the user received.
              </p>
            </div>
          </div>
        )}

        <Dots />
      </div>
    </div>
  );
};

export const MetaphorIsControlStickSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8">
    <div className="max-w-4xl w-full text-center space-y-8">
      <div className="flex justify-center">
        <Sliders className="h-16 w-16 text-primary" />
      </div>
      <p className="slide-title font-display text-foreground leading-tight">
        The metaphor isn't description.
      </p>
      <p className="slide-title font-display italic text-primary leading-tight">
        It's the control stick.
      </p>
      <Citation sources={[
        "Khadpe et al. (2020). Conceptual Metaphors Impact Perceptions of",
        "Human-AI Collaboration. Proc. ACM HCI, 4(CSCW2), Article 163.",
      ]} />
    </div>
  </div>
);
