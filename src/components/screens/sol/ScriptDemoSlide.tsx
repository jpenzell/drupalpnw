import { useReveal } from "@/hooks/useReveal";
import { ZenBackdrop } from "../ZenBackdrop";
import markedScript from "@/assets/zen/marked-script.jpg";

const LINES: { who: "A" | "B"; text: string }[] = [
  { who: "A", text: "Hey." },
  { who: "B", text: "Hey." },
  { who: "A", text: "Can I use that?" },
  { who: "B", text: "Yeah." },
  { who: "A", text: "Do you mind?" },
  { who: "B", text: "Sorry." },
];

export const ScriptDemoSlide = () => {
  const { shown, Dots } = useReveal(LINES.length + 1);

  return (
    <ZenBackdrop image={markedScript} overlay="heavy" kenBurns alt="A marked-up script with director's notes">
      <div className="max-w-4xl w-full space-y-8 px-8 py-6">
        <h1 className="slide-subtitle text-center font-display font-light text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.85)]">
          Six lines. <span className="italic text-white/85">No directions.</span>
        </h1>


        <div className="rounded-lg border border-white/15 bg-black/40 backdrop-blur-md px-8 py-8 md:px-14 md:py-10 space-y-4 font-display">
          {LINES.map((line, i) => (
            <div
              key={i}
              className={`grid grid-cols-[3rem_1fr] gap-6 items-baseline transition-all duration-500 ${
                shown(i + 1) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <span className={`slide-body font-mono tracking-widest ${line.who === "A" ? "text-primary" : "text-accent"}`}>
                {line.who}
              </span>
              <span className="slide-body-lg text-white leading-snug">{line.text}</span>
            </div>
          ))}
        </div>

        {shown(LINES.length + 1) && (
          <p className="slide-caption text-center font-mono italic text-white/95 animate-fade-in drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
            Now — what's the scene?
          </p>
        )}

        <Dots />
      </div>
    </ZenBackdrop>
  );
};

