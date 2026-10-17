import { useReveal } from "@/hooks/useReveal";
import { Users, Repeat, Compass } from "lucide-react";

const PILLARS = [
  {
    Icon: Users,
    label: "Casting",
    aside: "Who's in the room — and who isn't.",
  },
  {
    Icon: Repeat,
    label: "Rehearsing",
    aside: "Create space for exploration.",
  },
  {
    Icon: Compass,
    label: "Directing",
    aside: "Keep everyone aligned.",
  },
];

export const ThreeBorrowsSlide = () => {
  const { shown, Dots } = useReveal(PILLARS.length);

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6 py-8">
      <div className="max-w-6xl w-full space-y-14">
        <h1 className="slide-subtitle font-display font-light text-foreground leading-tight text-center">
          Three things to <span className="italic text-primary">borrow from theater.</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map((p, i) => {
            const visible = shown(i + 1);
            return (
              <div
                key={p.label}
                className={`flex flex-col items-center text-center gap-5 transition-all duration-700 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                }`}
              >
                <div className="w-28 h-28 rounded-3xl bg-primary/10 border-2 border-primary/40 flex items-center justify-center">
                  <p.Icon className="h-14 w-14 text-primary" strokeWidth={1.5} />
                </div>
                <p className="slide-subtitle font-display font-light text-foreground">
                  {p.label}
                </p>
                <p className="slide-body text-muted-foreground italic">
                  {p.aside}
                </p>
              </div>
            );
          })}
        </div>

        <Dots />
      </div>
    </div>
  );
};
