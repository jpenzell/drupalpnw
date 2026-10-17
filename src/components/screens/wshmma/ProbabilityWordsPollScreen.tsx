import { useState } from "react";
import { CheckCircle, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { JoinQRCard } from "@/components/screens/allminds/JoinQRCard";
import { useLivePoll } from "@/components/screens/allminds/useLivePoll";
import { PROBABILITY_PHRASES, percentageSummary } from "./probabilityPercentages";

export const ProbabilityWordsPollScreen = () => {
  const { poll, responses, mine, submit, isParticipant } = useLivePoll("probability-words-percentages", "slider", {
    phrases: PROBABILITY_PHRASES, min: 0, max: 100,
  });
  const [answers, setAnswers] = useState([50, 50]);
  const [touched, setTouched] = useState([false, false]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const saved = mine?.value as Record<string, number> | undefined;
  const complete = sent || !!mine;

  if (isParticipant) return (
    <div className="flex-1 flex flex-col gap-8 px-5 py-8">
      <h1 className="text-3xl font-display font-bold text-foreground">What % chance do they mean?</h1>
      {PROBABILITY_PHRASES.map((phrase, index) => (
        <div key={phrase} className="space-y-5">
          <div className="flex justify-between items-center gap-3">
            <h2 className="text-2xl font-display font-semibold text-primary">“{phrase}”</h2>
            <output className="text-3xl font-display font-bold text-foreground">{saved?.[phrase] ?? answers[index]}%</output>
          </div>
          <Slider aria-label={`${phrase} percentage`} min={0} max={100} step={1}
            value={[saved?.[phrase] ?? answers[index]]} disabled={!poll?.is_open || sending || complete}
            onValueChange={([value]) => {
              setAnswers(previous => previous.map((answer, i) => i === index ? value : answer));
              setTouched(previous => previous.map((answer, i) => i === index ? true : answer));
            }} />
          <div className="flex justify-between text-sm text-muted-foreground"><span>0%</span><span>100%</span></div>
        </div>
      ))}
      <Button disabled={!poll?.is_open || !touched.every(Boolean) || sending || complete} onClick={async () => {
        setSending(true);
        setError(false);
        const ok = await submit(Object.fromEntries(PROBABILITY_PHRASES.map((phrase, i) => [phrase, answers[i]])));
        setSent(ok);
        setError(!ok);
        setSending(false);
      }}><Send className="mr-2 h-4 w-4" />{sending ? "Sending…" : complete ? "Submitted" : "Submit percentages"}</Button>
      <p role="status" className="text-center text-muted-foreground">
        {error ? "Could not send — please try again." : complete ? <><CheckCircle className="inline h-4 w-4 mr-1 text-primary" />Thanks — watch the screen.</> : !poll ? "Waiting for the poll to open…" : !poll.is_open ? "This poll is closed." : ""}
      </p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col justify-center gap-10 px-16 py-12 animate-fade-in">
      <div>
        <p className="slide-kicker font-semibold text-secondary mb-4">What does that even mean?</p>
        <h1 className="slide-title font-display font-bold text-foreground">What % chance do they mean?</h1>
      </div>
      <div className="flex items-center gap-12">
        <div className="grid grid-cols-2 gap-12 flex-1 min-w-0">
          {PROBABILITY_PHRASES.map(phrase => {
            const summary = percentageSummary(responses.map(response =>
              (response.value as Record<string, unknown> | null)?.[phrase]
            ));
            return <div key={phrase} className="space-y-5">
              <h2 className="slide-subtitle font-display font-bold text-primary">“{phrase}”</h2>
              <p className="slide-title-lg font-display font-bold text-foreground">{summary.average === null ? "—" : `${summary.average}%`}</p>
              <p className="slide-caption text-muted-foreground">{summary.count ? "Room average" : "Awaiting answers"}</p>
              <div className="relative h-24 border-b-2 border-border bg-muted/40">
                {summary.values.map((value, index) => <div key={index} title={`${value}%`}
                  className="absolute bottom-0 w-1 h-16 bg-primary/70"
                  style={{ left: `calc(${value}% - ${value === 100 ? 4 : 0}px)` }} />)}
              </div>
              <div className="flex justify-between slide-caption text-muted-foreground"><span>0%</span><span>100%</span></div>
              <p className="slide-body font-semibold text-foreground">{summary.count ? `Range: ${summary.min}%–${summary.max}%` : ""}</p>
              <p className="slide-caption text-muted-foreground flex items-center gap-2"><Users className="h-6 w-6" />{summary.count} responses</p>
            </div>;
          })}
        </div>
        <JoinQRCard size={220} />
      </div>
    </div>
  );
};
