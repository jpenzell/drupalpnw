import { useReveal } from "@/hooks/useReveal";
import { ScriptOverlay } from "@/components/blocks/ScriptOverlay";
import { ZenBackdrop } from "../ZenBackdrop";
import markedScript from "@/assets/zen/marked-script.jpg";

const ACTIONS = ["to ask", "to beg", "to charm", "to demand", "to lie"];

export const CopyMachineExampleSlide = () => {
  const { shown, Dots } = useReveal(5);

  const Row = ({
    label, color, children, visible,
  }: { label: string; color: string; children: React.ReactNode; visible: boolean }) => (
    <div className={`grid grid-cols-[minmax(240px,340px)_1fr] gap-8 items-baseline transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
      <p className={`slide-body-lg font-display font-medium tracking-[0.05em] text-right whitespace-nowrap ${color}`}>{label}</p>
      <div className="border-l border-border pl-6">{children}</div>
    </div>
  );

  return (
    <ZenBackdrop image={markedScript} overlay="paper" kenBurns alt="A marked-up script with director's notes">
      <div className="max-w-6xl w-full space-y-6 px-8 py-6">
        <div className="space-y-5">
          <Row label="NEED" color="text-secondary" visible={shown(2)}>
            <p className="slide-body-lg font-display text-foreground leading-snug">
              "I <span className="italic">need</span> to get these copies made before the meeting."
            </p>
          </Row>

          <Row label="OBSTACLE" color="text-foreground" visible={shown(3)}>
            <p className="slide-body-lg font-display text-foreground leading-snug">
              Someone is already at the copier.
            </p>
          </Row>

          <Row label="ACTION" color="text-primary" visible={shown(4)}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
              {ACTIONS.map((a, i) => (
                <span
                  key={a}
                  className="slide-body-lg font-display italic text-primary transition-all duration-500"
                  style={{ transitionDelay: `${i * 120}ms`, opacity: shown(4) ? 1 : 0 }}
                >
                  {a}
                  {i < ACTIONS.length - 1 && <span className="text-foreground/35 not-italic ml-3">·</span>}
                </span>
              ))}
            </div>
          </Row>
        </div>

        {shown(5) && (
          <p className="slide-body-lg text-center font-display text-foreground animate-fade-in pt-2">
            The <span className="text-primary italic">action</span> is the choice that makes a prompt a <span className="italic">scene</span>.
          </p>
        )}

        <Dots />
        <ScriptOverlay />
      </div>
    </ZenBackdrop>
  );
};
