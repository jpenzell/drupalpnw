import { useEffect, useRef, useState } from "react";
import { Captions, CaptionsOff, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const captionChannelName = (sessionId: string) => `captions:${sessionId}`;

/** Presenter side: broadcast the live caption line to every phone in the session. */
export const useBroadcastCaptions = (sessionId: string | undefined, enabled: boolean, text: string) => {
  const chanRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  useEffect(() => {
    if (!sessionId) return;
    const ch = supabase.channel(captionChannelName(sessionId));
    ch.subscribe();
    chanRef.current = ch;
    return () => { supabase.removeChannel(ch); chanRef.current = null; };
  }, [sessionId]);
  useEffect(() => {
    const t = setTimeout(() => {
      chanRef.current?.send({ type: "broadcast", event: "caption", payload: { on: enabled, text: enabled ? text : "" } });
    }, 150);
    return () => clearTimeout(t);
  }, [enabled, text]);
};

/** Phone side: CC toggle + Québécois French translation of the presenter's captions. */
export const PhoneCaptions = ({ sessionId }: { sessionId?: string }) => {
  const [show, setShow] = useState(false);
  const [french, setFrench] = useState(false);
  const [live, setLive] = useState({ on: false, text: "" });
  const [fr, setFr] = useState("");

  useEffect(() => {
    if (!sessionId) return;
    const ch = supabase
      .channel(captionChannelName(sessionId))
      .on("broadcast", { event: "caption" }, ({ payload }) => setLive({ on: !!payload?.on, text: payload?.text ?? "" }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [sessionId]);

  // Translate after a short pause in speech so we don't call the AI on every word.
  useEffect(() => {
    if (!show || !french || !live.text) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const { data } = await supabase.functions.invoke("translate-caption", { body: { text: live.text } });
      if (!cancelled && data?.translation) setFr(data.translation);
    }, 700);
    return () => { cancelled = true; clearTimeout(t); };
  }, [show, french, live.text]);

  const line = !live.on
    ? (french ? "Les sous-titres ne sont pas encore activés par le présentateur." : "Captions aren't on yet — they'll appear when the speaker starts them.")
    : french ? (fr || "Traduction…") : (live.text || "Listening…");

  return (
    <div className="shrink-0 w-full border-t border-border bg-background">
      {show && (
        <div role="status" aria-live="polite" className="bg-foreground text-background px-4 py-3 min-h-[4.5rem] max-h-40 overflow-y-auto">
          <p className="text-lg font-medium leading-snug">{line}</p>
        </div>
      )}
      <div className="flex flex-wrap gap-2 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] justify-center">
        <Button size="sm" variant={show ? "default" : "outline"} onClick={() => setShow((s) => !s)} aria-pressed={show}>
          {show ? <Captions className="h-4 w-4" /> : <CaptionsOff className="h-4 w-4" />} CC
        </Button>
          <Button size="sm" variant={french ? "default" : "outline"} onClick={() => { setShow(true); setFrench((f) => !f); }} aria-pressed={french}>
            <Languages className="h-4 w-4" /> {french ? "Français (QC)" : "Traduire en français"}
          </Button>
      </div>
    </div>
  );
};
