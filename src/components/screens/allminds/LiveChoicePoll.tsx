import { useEffect, useMemo, useState } from "react";
import { Users, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getPublicOrigin } from "@/lib/publicUrl";
import { useSession } from "@/contexts/SessionContext";
import { usePoll } from "@/contexts/PollContext";

interface LiveChoicePollProps {
  /** Stable poll key — one poll per key per session. */
  pollKey: string;
  kicker?: string;
  question: string;
  prompt?: string;
  options: string[];
  image?: string;
  imageAlt?: string;
  /** Show the join QR beside the question (first poll of the talk). */
  showJoinQR?: boolean;
}

/**
 * One-question live poll. Presenter opens it on mount and sees live bars;
 * participants tap an option on their phones. Works with zero responses —
 * the question still reads as a "raise your hand" prompt.
 */
export const LiveChoicePoll = ({ pollKey, kicker, question, prompt, options, image, imageAlt, showJoinQR }: LiveChoicePollProps) => {
  const { session, isPresenter, isParticipant } = useSession();
  const { currentPoll, responses, myResponse, createPoll, getPollForSlide, submitResponse } = usePoll();
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    if (isPresenter) {
      createPoll(pollKey, "multiple_choice", { options, question });
      return;
    }
    let cancelled = false;
    const find = async () => {
      const p = await getPollForSlide(pollKey);
      if (!p && !cancelled) timer = window.setTimeout(find, 2000);
    };
    let timer = window.setTimeout(find, 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, isPresenter, pollKey]);

  const active = currentPoll?.slide_id === pollKey;
  const counts = useMemo(() => {
    const c: Record<string, number> = Object.fromEntries(options.map((o) => [o, 0]));
    if (!active) return c;
    responses.forEach((r) => {
      const a = (r.value as { answer?: string } | null)?.answer;
      if (a && a in c) c[a]++;
    });
    return c;
  }, [responses, options, active]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const mine = active ? ((myResponse?.value as { answer?: string } | null)?.answer ?? picked) : picked;

  if (isParticipant) {
    return (
      <div className="flex-1 flex flex-col gap-4 p-5 animate-fade-in">
        <h2 className="text-2xl font-display font-bold text-foreground text-center">{question}</h2>
        {image && <img src={image} alt={imageAlt ?? ""} className="max-h-56 object-contain mx-auto" />}
        <div className="grid gap-3">
          {options.map((o) => (
            <button
              key={o}
              disabled={!active || !!mine}
              onClick={async () => { setPicked(o); await submitResponse({ answer: o }); }}
              className={`p-4 rounded-xl border-2 text-left font-semibold transition-colors ${mine === o ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-foreground"} disabled:opacity-70`}
            >
              {o}
            </button>
          ))}
        </div>
        <p className="text-center text-muted-foreground text-sm">
          {!active ? "Waiting for the poll to open…" : mine ? (<><CheckCircle className="inline h-4 w-4 mr-1 text-primary" />Thanks — watch the screen.</>) : "Tap one. Or pass — that's fine too."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-16 animate-fade-in">
      <div className={`w-full max-w-7xl grid gap-16 items-center ${image ? "grid-cols-2" : showJoinQR && session ? "grid-cols-[1fr_auto]" : "grid-cols-1"}`}>
        {image && <img src={image} alt={imageAlt ?? ""} className="w-full max-h-[70vh] object-contain" />}
        <div className="space-y-8">
          {kicker && <p className="slide-kicker text-secondary font-semibold">{kicker}</p>}
          <h1 className="slide-title font-display font-bold text-foreground">{question}</h1>
          {prompt && <p className="slide-body-lg text-foreground/75">{prompt}</p>}
          <div className="space-y-4">
            {options.map((o) => {
              const pct = total ? Math.round((counts[o] / total) * 100) : 0;
              return (
                <div key={o} className="relative overflow-hidden rounded-xl border-2 border-border bg-card px-6 py-4">
                  <div className="absolute inset-y-0 left-0 bg-primary/15 transition-all duration-700" style={{ width: `${pct}%` }} />
                  <div className="relative flex items-center justify-between gap-6">
                    <span className="slide-body font-semibold text-foreground">{o}</span>
                    {total > 0 && <span className="slide-body font-display font-bold text-primary">{pct}%</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="slide-caption text-muted-foreground flex items-center gap-2">
            <Users className="h-6 w-6" /> {total > 0 ? `${total} ${total === 1 ? "response" : "responses"}` : "Answer on your phone — or just raise a hand."}
          </p>
        </div>
        {showJoinQR && session && !image && (
          <div className="flex flex-col items-center gap-4 p-6 rounded-3xl border-2 border-border bg-card">
            <p className="slide-chrome uppercase tracking-widest font-semibold text-secondary">Scan to join</p>
            <div className="bg-white p-4 rounded-2xl">
              <QRCodeSVG value={`${getPublicOrigin()}/?join=${session.code}`} size={280} level="M" />
            </div>
            <p className="text-4xl font-mono font-bold tracking-widest text-primary">{session.code}</p>
          </div>
        )}
      </div>
    </div>
  );
};
