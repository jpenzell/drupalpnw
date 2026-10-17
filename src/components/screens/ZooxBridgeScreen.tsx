import { useState, useEffect } from "react";

export const ZooxBridgeScreen = () => {
  const [stage, setStage] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowRight") {
        if (stage < 3) {
          e.preventDefault();
          e.stopImmediatePropagation();
          setStage(s => s + 1);
        }
      } else if (e.key === "ArrowLeft" && stage > 1) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setStage(s => s - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
  }, [stage]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8">
      <div className="max-w-5xl w-full text-center space-y-8">
        
        {/* Stage 1: Zoox's approach - always visible */}
        <div className="space-y-4">
          <p className="text-xl md:text-2xl text-muted-foreground">
            Zoox asked:
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
            "If the car <span className="text-primary">drives itself</span>,
            <br />
            why put it in a vehicle built for a human driver?"
          </h1>
        </div>

        {/* Stage 2: My question - space always reserved */}
        <div 
          className={`pt-8 space-y-4 transition-opacity duration-500 ${
            stage >= 2 ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <p className="text-xl md:text-2xl text-muted-foreground">
            I asked myself:
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
            "If the goal is to <span className="text-primary">change how you think</span>,
            <br />
            why use a PowerPoint?"
          </h2>
        </div>

        {/* Stage 3: Punchline - space always reserved */}
        <div 
          className={`pt-4 transition-opacity duration-500 ${
            stage >= 3 ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <p className="text-2xl md:text-3xl text-accent font-semibold">
            So I built something different...
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-8 opacity-30">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-all ${
                s <= stage ? "bg-muted-foreground" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
