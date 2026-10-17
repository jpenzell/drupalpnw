import { useRef, useState } from "react";
import { Users } from "lucide-react";
import { useLivePoll } from "./useLivePoll";

const TARGET = 10;
const MAX = 20;

/** Count 10 seconds in your head. Phones time it; the stage plots the spread. */
export const TimePerceptionExperiment = () => {
  const { responses, mine, active, submit, isParticipant } = useLivePoll("am-time", "slider", { target: TARGET });
  const startRef = useRef<number | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const values = responses
    .map((r) => Number((r.value as { seconds?: number } | null)?.seconds))
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 60);
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;

  if (isParticipant) {
    const done = mine || result !== null;
    const myValue = result ?? (mine?.value as { seconds?: number } | null)?.seconds;
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 text-center animate-fade-in">
        <h2 className="text-2xl font-display font-bold text-foreground">Count 10 seconds — in your head</h2>
        <p className="text-muted-foreground">No clock, no counting out loud. Tap Start, then Stop when you think 10 seconds have passed.</p>
        {!done && (
          <button
            disabled={!active}
            onClick={async () => {
              if (!running) {
                startRef.current = performance.now();
                setRunning(true);
              } else if (startRef.current) {
                const secs = Math.round(((performance.now() - startRef.current) / 1000) * 10) / 10;
                setRunning(false);
                setResult(secs);
                await submit({ seconds: secs });
              }
            }}
            className={`w-48 h-48 rounded-full text-3xl font-display font-bold border-4 transition-colors disabled:opacity-50 ${running ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-primary"}`}
          >
            {running ? "Stop" : "Start"}
          </button>
        )}
        {done && myValue != null && (
          <p className="text-xl text-foreground">You stopped at <strong className="text-primary">{myValue}s</strong>. Watch the screen.</p>
        )}
        {!active && <p className="text-sm text-muted-foreground">Waiting for the experiment to open…</p>}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center gap-12 px-20 animate-fade-in">
      <div className="space-y-4">
        <p className="slide-kicker text-secondary font-semibold">Experiment · Time</p>
        <h1 className="slide-title font-display font-bold text-foreground">Count 10 seconds. In your head.</h1>
        <p className="slide-body-lg text-foreground/75">Phones: tap Start, then Stop when you think it's been 10. No clock.</p>
      </div>
      <div className="relative h-40 border-b-4 border-foreground/40">
        <div className="absolute inset-y-0 border-l-4 border-dashed border-primary" style={{ left: `${(TARGET / MAX) * 100}%` }}>
          <span className="absolute -top-10 -translate-x-1/2 slide-caption font-bold text-primary">10s</span>
        </div>
        {values.map((v, i) => (
          <span
            key={i}
            className="absolute w-6 h-6 rounded-full bg-secondary/80 border-2 border-background -translate-x-1/2 transition-all duration-700"
            style={{ left: `${(Math.min(v, MAX) / MAX) * 100}%`, bottom: `${12 + (i % 5) * 26}px` }}
          />
        ))}
        {[0, 5, 15, 20].map((t) => (
          <span key={t} className="absolute -bottom-10 -translate-x-1/2 slide-caption text-muted-foreground" style={{ left: `${(t / MAX) * 100}%` }}>
            {t}{t === MAX ? "s+" : "s"}
          </span>
        ))}
      </div>
      <p className="slide-body text-foreground/80 flex items-center gap-3 pt-6">
        <Users className="h-7 w-7" />
        {values.length === 0
          ? "Waiting for the room…"
          : `${values.length} people · fastest ${sorted[0]}s · slowest ${sorted[sorted.length - 1]}s · middle ${median}s`}
      </p>
    </div>
  );
};
