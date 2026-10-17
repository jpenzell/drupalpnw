import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLivePoll } from "./useLivePoll";
import { JoinQRCard } from "./JoinQRCard";

const DURATION = 30; // seconds for the stage to ramp from calm to busy
const WORDS = ["notification", "ping", "reply-all", "deadline", "meeting", "Slack", "urgent", "FYI", "quick q", "standup", "badge", "alert"];

/**
 * Sensory load ramp. The stage slowly gets busier (no flashing); phones tap
 * "That's my limit" and we record how many seconds in that was.
 */
export const SensoryExperiment = () => {
  const { poll, responses, mine, active, submit, isPresenter, isParticipant } = useLivePoll("am-sensory", "slider", {});
  const startedAt = (poll?.poll_config as { started_at?: number } | null)?.started_at ?? null;
  const [now, setNow] = useState(Date.now());
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!startedAt) return;
    const t = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(t);
  }, [startedAt]);

  const elapsed = startedAt ? Math.max(0, (now - startedAt) / 1000) : 0;
  const level = Math.min(1, elapsed / DURATION);

  const values = responses
    .map((r) => Number((r.value as { seconds?: number } | null)?.seconds))
    .filter((n) => Number.isFinite(n) && n >= 0);
  const buckets = [0, 0, 0, 0, 0, 0]; // 5s buckets, last = 25s+
  values.forEach((v) => buckets[Math.min(5, Math.floor(v / 5))]++);
  const maxBucket = Math.max(1, ...buckets);

  const start = async () => {
    if (!poll) return;
    await supabase.from("responses").delete().eq("poll_id", poll.id);
    await supabase
      .from("polls")
      .update({ poll_config: { started_at: Date.now() }, is_open: true })
      .eq("id", poll.id);
  };

  if (isParticipant) {
    const done = sent || !!mine;
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 text-center animate-fade-in">
        <h2 className="text-2xl font-display font-bold text-foreground">Watch the screen.</h2>
        <p className="text-muted-foreground">It's going to get busier. Tap when it becomes too much for you. Look away any time.</p>
        {done ? (
          <p className="text-xl text-foreground">Got it. Everyone's limit is different.</p>
        ) : (
          <button
            disabled={!active || !startedAt}
            onClick={async () => { if (await submit({ seconds: Math.round(elapsed) })) setSent(true); }}
            className="w-56 h-56 rounded-full text-2xl font-display font-bold bg-primary text-primary-foreground disabled:opacity-40"
          >
            That's my limit
          </button>
        )}
        {!startedAt && <p className="text-sm text-muted-foreground">Waiting for the presenter to start…</p>}
      </div>
    );
  }

  const count = Math.round(level * 40);
  return (
    <div className="flex-1 relative overflow-hidden animate-fade-in">
      <div className="absolute inset-0 pointer-events-none motion-reduce:hidden" aria-hidden>
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className={`absolute font-display font-bold ${i % 3 === 0 ? "text-primary" : i % 3 === 1 ? "text-spotlight" : "text-secondary"}`}
            style={{
              left: `${(i * 37) % 95}%`,
              top: `${(i * 53) % 90}%`,
              fontSize: `${18 + ((i * 7) % 30)}px`,
              opacity: 0.25 + level * 0.6,
              transform: `translate(${Math.sin(elapsed * (0.6 + (i % 5) * 0.2) + i) * 40 * level}px, ${Math.cos(elapsed * 0.5 + i) * 30 * level}px) rotate(${(i % 7) * 8 - 24}deg)`,
              transition: "transform 200ms linear",
            }}
          >
            {WORDS[i % WORDS.length]}
          </span>
        ))}
      </div>
      <div className="relative z-10 h-full flex flex-col justify-center gap-8 px-20">
        <div className="flex items-start justify-between gap-12">
          <div className="space-y-4">
            <p className="slide-kicker text-secondary font-semibold">Experiment · Sensory load</p>
            <h1 className="slide-title font-display font-bold text-foreground bg-background/80 self-start px-4 rounded-xl">When does it become too much?</h1>
            {!startedAt && isPresenter && (
              <button onClick={start} disabled={!poll} className="rounded-full bg-primary text-primary-foreground px-8 py-4 slide-body font-semibold disabled:opacity-50">
                Start the ramp
              </button>
            )}
          </div>
          <JoinQRCard size={200} />
        </div>
        {startedAt && (
          <div className="bg-background/85 rounded-2xl p-6 self-start space-y-4">
            <div className="flex items-end gap-4 h-40">
              {buckets.map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-20">
                  <div className="w-full bg-primary/70 rounded-t-md transition-all duration-500" style={{ height: `${(b / maxBucket) * 120}px` }} />
                  <span className="slide-chrome text-muted-foreground">{i === 5 ? "25s+" : `${i * 5}s`}</span>
                </div>
              ))}
            </div>
            <p className="slide-caption text-foreground/80 flex items-center gap-2">
              <Users className="h-5 w-5" /> {values.length} limits reached · {Math.round(elapsed)}s in
            </p>
          </div>
        )}
        <p className="slide-caption text-muted-foreground bg-background/80 self-start px-3 rounded">No flashing. Look away any time.</p>
      </div>
    </div>
  );
};
