import { useState } from "react";
import { Eye, EyeOff, Users } from "lucide-react";
import { useLivePoll } from "./useLivePoll";
import { JoinQRCard } from "./JoinQRCard";

const QUESTION = "Where might you be designing for your own brain?";

/** Free-text reflection. Answers stay hidden on stage until the presenter reveals them. */
export const ReflectionWall = () => {
  const { responses, mine, active, submit, isParticipant } = useLivePoll("am-reflect", "text", { question: QUESTION });
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [show, setShow] = useState(false);

  const answers = responses
    .map((r) => String((r.value as { text?: string } | null)?.text ?? "").trim())
    .filter(Boolean);

  if (isParticipant) {
    const done = sent || !!mine;
    return (
      <div className="flex-1 flex flex-col gap-4 p-6 animate-fade-in">
        <h2 className="text-2xl font-display font-bold text-foreground">{QUESTION}</h2>
        <p className="text-muted-foreground text-sm">Optional. No names are shown. Keep it to a sentence.</p>
        {done ? (
          <p className="text-foreground">Thank you — watch the screen.</p>
        ) : (
          <>
            <textarea
              value={text}
              maxLength={160}
              onChange={(e) => setText(e.target.value)}
              className="min-h-32 rounded-xl border-2 border-border bg-card p-3 text-foreground"
              placeholder="e.g. I assume everyone reads the long email."
            />
            <button
              disabled={!active || !text.trim()}
              onClick={async () => { if (await submit({ text: text.trim() })) setSent(true); }}
              className="rounded-xl bg-primary text-primary-foreground font-semibold py-3 disabled:opacity-50"
            >
              Send
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center gap-10 px-20 animate-fade-in">
      <div className="flex items-start justify-between gap-8">
        <div className="space-y-4">
          <p className="slide-kicker text-secondary font-semibold">Reflection</p>
          <h1 className="slide-title font-display font-bold text-foreground">{QUESTION}</h1>
        </div>
        <button
          onClick={() => setShow((s) => !s)}
          className="shrink-0 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 slide-chrome text-foreground/70 hover:text-foreground"
          aria-label={show ? "Hide answers" : "Show answers"}
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />} {show ? "Hide" : "Show"} answers
        </button>
      </div>
      {show ? (
        <div className="grid grid-cols-3 gap-5 max-h-[55vh] overflow-hidden">
          {answers.slice(-9).map((a, i) => (
            <p key={i} className="rounded-2xl border-2 border-border bg-card p-6 slide-body text-foreground">{a}</p>
          ))}
        </div>
      ) : (
        <p className="slide-body text-foreground/70 flex items-center gap-3">
          <Users className="h-7 w-7" /> {answers.length ? `${answers.length} reflections in — reveal when ready.` : "Answer on your phone, or just think about it."}
        </p>
      )}
    </div>
  );
};
