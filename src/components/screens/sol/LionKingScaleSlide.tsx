import { Citation } from "@/components/blocks/Citation";
import { useReveal } from "@/hooks/useReveal";
import { Film, Theater as TheaterIcon } from "lucide-react";

export const LionKingScaleSlide = () => {
  const { shown, Dots } = useReveal(4);
  const max = 12_000;

  const bars = [
    {
      stage: 1,
      label: "Lion King — the film",
      sublabel: "1994 · worldwide box office",
      value: 987,
      display: "$987M",
      Icon: Film,
      color: "bg-muted-foreground/40",
      text: "text-foreground",
    },
    {
      stage: 2,
      label: "Top 3 films of all time — combined",
      sublabel: "Avatar · Endgame · Way of Water",
      value: 8_040,
      display: "$8.04B",
      Icon: Film,
      color: "bg-secondary/70",
      text: "text-foreground",
    },
    {
      stage: 3,
      label: "Lion King — the Broadway musical",
      sublabel: "1997–present · all productions",
      value: 11_500,
      display: "$11.5B+",
      Icon: TheaterIcon,
      color: "bg-primary",
      text: "text-primary",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6 py-8">
      <div className="max-w-6xl w-full space-y-8">
        <h1 className="slide-subtitle font-display font-light text-foreground leading-tight text-center">
          One stage show outgrosses the{" "}
          <span className="italic text-primary">three biggest films ever</span> — combined.
        </h1>

        <div className="space-y-5 pt-4">
          {bars.map((b) => {
            const visible = shown(b.stage);
            const widthPct = (b.value / max) * 100;
            return (
              <div
                key={b.label}
                className={`transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
              >
                <div className="flex items-baseline justify-between mb-2 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <b.Icon className={`h-5 w-5 flex-shrink-0 ${b.text}`} />
                    <div className="min-w-0">
                      <p className={`slide-caption font-display font-semibold ${b.text}`}>
                        {b.label}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground italic truncate">
                        {b.sublabel}
                      </p>
                    </div>
                  </div>
                  <p className={`slide-body-lg font-display font-bold ${b.text} flex-shrink-0`}>
                    {b.display}
                  </p>
                </div>
                <div className="h-6 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${b.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: visible ? `${widthPct}%` : "0%" }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {shown(4) && (
          <div className="text-center space-y-4 pt-4 animate-fade-in">
            <p className="slide-body-lg font-display italic text-secondary leading-snug">
              A product has a shelf life.{" "}
              <span className="text-primary not-italic font-semibold">A performance has a life.</span>
            </p>
            <Citation sources={[
              "Guinness World Records · Highest-grossing entertainment product (The Lion King, musical).",
              "Box Office Mojo · lifetime worldwide grosses (2025).",
              "Disney Theatrical Productions · The Lion King lifetime gross.",
            ]} />
          </div>
        )}

        <Dots />
      </div>
    </div>
  );
};
