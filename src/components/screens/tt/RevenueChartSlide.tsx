import { useEffect, useState } from "react";

const data = [
  { label: "Titanic", value: 2.3, color: "hsl(var(--muted-foreground))" },
  { label: "Endgame", value: 2.8, color: "hsl(var(--muted-foreground))" },
  { label: "Avatar", value: 2.9, color: "hsl(var(--muted-foreground))" },
  { label: "Top 3 Films Combined", value: 8.0, color: "hsl(var(--muted-foreground) / 0.6)", dashed: true },
  { label: "Star Wars (entire franchise)", value: 10.3, color: "hsl(var(--muted-foreground))" },
  { label: "The Lion King (musical)", value: 11.5, color: "hsl(var(--secondary))" },
];

const maxValue = 11.5;

export const RevenueChartSlide = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
      <div className="max-w-5xl mx-auto w-full space-y-8 px-4">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center">
          Revenue Comparison ($B)
        </h2>

        <div className="space-y-4">
          {data.map((item, i) => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground w-44 text-right shrink-0">
                {item.label}
              </span>
              <div className="flex-1 h-10 bg-muted/30 rounded-lg overflow-hidden">
                <div
                  className={`h-full rounded-lg transition-all duration-1000 ease-out flex items-center justify-end pr-3 ${(item as any).dashed ? 'border-2 border-dashed border-muted-foreground/50' : ''}`}
                  style={{
                    width: animate ? `${(item.value / maxValue) * 100}%` : "0%",
                    backgroundColor: item.color,
                    transitionDelay: `${i * 150}ms`,
                  }}
                >
                  <span className="text-sm font-bold text-white">${item.value}B</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-lg text-muted-foreground pt-4">
          One musical. At Disney — <span className="text-accent font-semibold">where we're sitting right now.</span>
        </p>
        <p className="text-center text-xs text-muted-foreground/50 pt-1">
          Source:{" "}
          <a
            href="https://www.guinnessworldrecords.com/world-records/611346-highest-grossing-entertainment-title"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-muted-foreground transition-colors"
          >
            Guinness World Records — Highest Grossing Entertainment Title
          </a>
        </p>
      </div>
    </div>
  );
};
