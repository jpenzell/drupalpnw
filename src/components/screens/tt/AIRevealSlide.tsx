import { useState } from "react";
import { Loader2, Sparkles, RotateCcw, MessageSquareQuote, X, Plus, FileInput, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { useSceneCanvas } from "@/contexts/SceneCanvasContext";

interface Beat {
  want: string;
  action: string;
  obstacle: string;
}

interface Character {
  name: string;
  overallWant: string;
  beats: Beat[];
}

interface DialogueLine {
  speaker: string;
  line: string;
}

interface Scene {
  name: string;
  characters: Character[];
  dialogue: DialogueLine[];
}

interface CanvasData {
  play: string;
  show: string;
  scenes: Scene[];
}

interface TakeShift {
  element: string; // e.g. "Want", "Tactic", "Obstacle"
  from: string;
  to: string;
}

interface Take {
  title: string;
  change: string;
  direction: string;
  prediction: string;
  shifts: TakeShift[];
  dialogue: DialogueLine[];
}

const EXAMPLE_SCENARIOS = [
  "We just rolled out an AI writing assistant to all managers. Six weeks in, only 12% are using it. Senior leaders publicly praise it but privately admit they don't touch it. Mid-managers are afraid to look incompetent. HR is being asked why adoption is 'so low.'",
  "A recruiter quietly used ChatGPT to screen résumés and a candidate found out. Legal is panicking, the recruiter feels scapegoated, and the CHRO needs a defensible policy by next week — without killing the productivity gains people have already discovered.",
  "L&D wants to use AI to personalize learning paths. The CIO is worried about data. The CFO wants ROI. Employees say 'just give us the prompts.' Nobody can agree on what 'success' even looks like, and the project has been re-scoped four times.",
];

const EditableField = ({
  value,
  onChange,
  className = "",
  tag = "span",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  tag?: "span" | "p";
}) => {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <input
        autoFocus
        className={`bg-transparent border-b border-secondary outline-none ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
      />
    );
  }

  const Tag = tag;
  return (
    <Tag
      className={`cursor-pointer hover:text-secondary transition-colors ${className}`}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value}
    </Tag>
  );
};
const TakeCard = ({ take, index }: { take: Take; index: number }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-lg border border-secondary/30 bg-secondary/5 p-4 space-y-2 animate-fade-in cursor-pointer"
      style={{ animationDelay: `${index * 150}ms` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-mono text-secondary">TAKE {index + 1}</span>
          <span className="text-sm font-display font-bold text-foreground">{take.title}</span>
        </div>
        <span className={`text-xs transition-colors ${expanded ? "text-secondary" : "text-muted-foreground/40"}`}>
          {expanded ? "▾" : "▸"} details
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        <span className="text-secondary font-semibold">Shift:</span> {take.change}
      </div>
      <p className="text-sm text-foreground leading-relaxed">{take.direction}</p>
      <div className="text-xs text-muted-foreground italic border-t border-border/40 pt-2 mt-2">
        → {take.prediction}
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 animate-fade-in">
          {/* Structured shifts */}
          {take.shifts && take.shifts.length > 0 && (
            <div className="rounded-lg border border-border bg-background/60 p-3 space-y-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">What changes</span>
              {take.shifts.map((shift, si) => (
                <div key={si} className="flex items-start gap-2 text-xs">
                  <span className="text-secondary font-semibold shrink-0 uppercase tracking-wide">{shift.element}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground line-through">{shift.from}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-foreground font-medium">{shift.to}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dialogue */}
          {take.dialogue && take.dialogue.length > 0 && (
            <div className="rounded-lg border border-secondary/20 bg-background/60 p-3 space-y-1.5">
              <span className="text-xs uppercase tracking-widest text-secondary">How it sounds now</span>
              {take.dialogue.map((dl, di) => (
                <div key={di} className="flex items-start gap-2">
                  <span className="text-xs font-semibold text-foreground shrink-0">{dl.speaker}:</span>
                  <span className="text-xs text-foreground italic">{dl.line}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const AIRevealSlide = () => {
  const { canvas: sharedCanvas } = useSceneCanvas();
  const [scenario, setScenario] = useState("");
  const [canvas, setCanvas] = useState<CanvasData | null>(null);
  const [takes, setTakes] = useState<Take[] | null>(null);
  const [loading, setLoading] = useState<"analyze" | "rehearse" | null>(null);
  const [step, setStep] = useState<"input" | "canvas" | "takes">("input");
  const [dialogueScene, setDialogueScene] = useState<number | null>(null);

  const useExistingCanvas = async () => {
    if (!sharedCanvas) return;
    // Convert shared canvas to scenario text, then analyze to get dialogue
    const text = `Play: ${sharedCanvas.play}\nShow: ${sharedCanvas.show}\n\nScenes:\n${sharedCanvas.scenes
      .map(
        (s) =>
          `- ${s.name}: ${s.characters
            .map(
              (c) =>
                `${c.name} wants "${c.overallWant}" — beats: ${c.beats
                  .map((b) => `want="${b.want}" action="${b.action}" obstacle="${b.obstacle}"`)
                  .join("; ")}`
            )
            .join(" | ")}`
      )
      .join("\n")}`;
    setScenario(text);
    setLoading("analyze");
    try {
      const { data, error } = await supabase.functions.invoke("scene-rehearsal", {
        body: { scenario: text, mode: "analyze" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCanvas(data.result);
      setStep("canvas");
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze canvas");
    } finally {
      setLoading(null);
    }
  };

  const updateCanvas = (fn: (c: CanvasData) => CanvasData) => {
    setCanvas((prev) => (prev ? fn(prev) : prev));
  };

  const updateBeat = (si: number, ci: number, bi: number, field: keyof Beat, value: string) => {
    updateCanvas((c) => ({
      ...c,
      scenes: c.scenes.map((s, si2) =>
        si2 === si
          ? {
              ...s,
              characters: s.characters.map((ch, ci2) =>
                ci2 === ci
                  ? { ...ch, beats: ch.beats.map((b, bi2) => (bi2 === bi ? { ...b, [field]: value } : b)) }
                  : ch
              ),
            }
          : s
      ),
    }));
  };

  const updateDialogueLine = (si: number, di: number, field: "speaker" | "line", value: string) => {
    updateCanvas((c) => ({
      ...c,
      scenes: c.scenes.map((s, i) =>
        i === si
          ? { ...s, dialogue: s.dialogue.map((d, j) => (j === di ? { ...d, [field]: value } : d)) }
          : s
      ),
    }));
  };

  const addDialogueLine = (si: number) => {
    updateCanvas((c) => ({
      ...c,
      scenes: c.scenes.map((s, i) =>
        i === si ? { ...s, dialogue: [...s.dialogue, { speaker: "", line: "" }] } : s
      ),
    }));
  };

  const removeDialogueLine = (si: number, di: number) => {
    updateCanvas((c) => ({
      ...c,
      scenes: c.scenes.map((s, i) =>
        i === si && s.dialogue.length > 1
          ? { ...s, dialogue: s.dialogue.filter((_, j) => j !== di) }
          : s
      ),
    }));
  };

  const analyze = async () => {
    if (!scenario.trim()) return;
    setLoading("analyze");
    try {
      const { data, error } = await supabase.functions.invoke("scene-rehearsal", {
        body: { scenario: scenario.trim(), mode: "analyze" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCanvas(data.result);
      setStep("canvas");
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze scenario");
    } finally {
      setLoading(null);
    }
  };

  const rehearse = async () => {
    if (!canvas) return;
    setLoading("rehearse");
    try {
      const summary = `Play: ${canvas.play}\nShow: ${canvas.show}\n\nScenes:\n${canvas.scenes
        .map(
          (s) =>
            `- ${s.name}: ${s.characters
              .map(
                (c) =>
                  `${c.name} wants "${c.overallWant}" — beats: ${c.beats
                    .map((b) => `want="${b.want}" action="${b.action}" obstacle="${b.obstacle}"`)
                    .join("; ")}`
              )
              .join(" | ")}`
        )
        .join("\n")}`;
      const { data, error } = await supabase.functions.invoke("scene-rehearsal", {
        body: { scenario: summary, mode: "rehearse" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTakes(data.result.takes);
      setStep("takes");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate takes");
    } finally {
      setLoading(null);
    }
  };

  const reset = () => {
    setCanvas(null);
    setTakes(null);
    setStep("input");
    setScenario("");
    setDialogueScene(null);
  };

  // Step 1: Input
  if (step === "input") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-4">
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xl text-muted-foreground">Let me introduce my rehearsal partner.</p>
            <p className="text-sm text-muted-foreground">
              Describe an AI change scenario from your org and the AI will map the people-dynamics, then rehearse alternative takes.
            </p>
          </div>

          {/* QR Code for audience */}
          <div className="flex items-center gap-4 rounded-lg border border-secondary/30 bg-secondary/5 p-4">
            <div className="bg-white p-2 rounded-lg shrink-0">
              <QRCodeSVG value={`${window.location.origin}/rehearsal`} size={80} level="M" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <QrCode className="w-4 h-4 text-secondary" /> Try it yourself
              </p>
              <p className="text-xs text-muted-foreground">
                Scan the QR code to open the rehearsal tool on your phone.
              </p>
            </div>
          </div>

          <textarea
            className="w-full rounded-lg border border-border bg-card/60 p-4 text-foreground placeholder:text-muted-foreground/50 text-sm resize-none focus:border-secondary outline-none"
            rows={4}
            placeholder="Describe an AI change scenario — a stalled rollout, a tense leadership conversation, a fairness concern…"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
           />

          {sharedCanvas && (
            <button
              onClick={useExistingCanvas}
              disabled={loading === "analyze"}
              className="w-full rounded-lg border border-secondary bg-secondary/10 text-foreground py-3 font-display font-semibold text-sm hover:bg-secondary/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === "analyze" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing your canvas…
                </>
              ) : (
                <>
                  <FileInput className="w-4 h-4 text-secondary" /> Use Your Scene Sprint Canvas
                </>
              )}
            </button>
          )}

          <div className="flex items-center gap-3 text-muted-foreground/40">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs uppercase tracking-widest">or describe a new one</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <button
            onClick={analyze}
            disabled={!scenario.trim() || loading === "analyze"}
            className="w-full rounded-lg bg-secondary text-secondary-foreground py-3 font-display font-semibold text-sm hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === "analyze" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing the scene…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Run the Scene
              </>
            )}
          </button>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground text-center">Or try an example</p>
            <div className="grid gap-2">
              {EXAMPLE_SCENARIOS.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setScenario(ex)}
                  className="text-left text-xs text-muted-foreground hover:text-foreground border border-border rounded-md p-2 hover:border-secondary/40 transition-colors"
                >
                  {ex.slice(0, 100)}…
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Canvas (editable)
  if (step === "canvas" && canvas) {
    return (
      <div className="flex-1 flex flex-col animate-fade-in px-4 py-4 overflow-hidden relative">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-bold text-foreground">AI Scene Analysis</h2>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground/60 italic">click any field to edit</span>
            <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> New
            </button>
          </div>
        </div>

        {/* Play / Show */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-lg border border-border bg-card/60 p-3">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">The Play</label>
            <EditableField
              value={canvas.play}
              onChange={(v) => updateCanvas((c) => ({ ...c, play: v }))}
              className="text-sm text-foreground mt-1 block w-full"
              tag="p"
            />
          </div>
          <div className="rounded-lg border border-secondary/40 bg-secondary/5 p-3">
            <label className="text-xs uppercase tracking-widest text-secondary">The Show</label>
            <EditableField
              value={canvas.show}
              onChange={(v) => updateCanvas((c) => ({ ...c, show: v }))}
              className="text-sm text-foreground mt-1 block w-full"
              tag="p"
            />
          </div>
        </div>

        {/* Scenes */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
          {canvas.scenes.map((scene, si) => (
            <div key={si} className="rounded-lg border border-border bg-card/60 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground shrink-0">Scene {si + 1}:</span>
                  <EditableField
                    value={scene.name}
                    onChange={(v) =>
                      updateCanvas((c) => ({
                        ...c,
                        scenes: c.scenes.map((s, i) => (i === si ? { ...s, name: v } : s)),
                      }))
                    }
                    className="text-xs font-semibold text-foreground"
                  />
                </div>
                <button
                  onClick={() => setDialogueScene(dialogueScene === si ? null : si)}
                  className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                    dialogueScene === si
                      ? "bg-secondary/20 text-secondary"
                      : "text-muted-foreground hover:text-secondary"
                  }`}
                >
                  <MessageSquareQuote className="w-3.5 h-3.5" />
                  Dialogue
                </button>
              </div>

              {/* Characters + beats */}
              <div className="space-y-2">
                {scene.characters.map((char, ci) => (
                  <div key={ci} className="rounded-md border border-border/60 bg-background/40 p-3 space-y-2">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <EditableField
                        value={char.name}
                        onChange={(v) =>
                          updateCanvas((c) => ({
                            ...c,
                            scenes: c.scenes.map((s, i) =>
                              i === si
                                ? { ...s, characters: s.characters.map((ch, j) => (j === ci ? { ...ch, name: v } : ch)) }
                                : s
                            ),
                          }))
                        }
                        className="text-sm font-semibold text-foreground"
                      />
                      <span className="text-xs text-muted-foreground shrink-0">wants:</span>
                      <EditableField
                        value={char.overallWant}
                        onChange={(v) =>
                          updateCanvas((c) => ({
                            ...c,
                            scenes: c.scenes.map((s, i) =>
                              i === si
                                ? { ...s, characters: s.characters.map((ch, j) => (j === ci ? { ...ch, overallWant: v } : ch)) }
                                : s
                            ),
                          }))
                        }
                        className="text-xs text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      {char.beats.map((beat, bi) => (
                        <div key={bi} className="flex-1 grid grid-cols-3 gap-2 pl-2 border-l-2 border-secondary/30 text-xs">
                          <div>
                            <span className="text-muted-foreground">Want: </span>
                            <EditableField value={beat.want} onChange={(v) => updateBeat(si, ci, bi, "want", v)} className="text-foreground" />
                          </div>
                          <div>
                            <span className="text-muted-foreground">Action: </span>
                            <EditableField value={beat.action} onChange={(v) => updateBeat(si, ci, bi, "action", v)} className="text-foreground" />
                          </div>
                          <div>
                            <span className="text-muted-foreground">Obstacle: </span>
                            <EditableField value={beat.obstacle} onChange={(v) => updateBeat(si, ci, bi, "obstacle", v)} className="text-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dialogue panel (inline, toggled) */}
              {dialogueScene === si && (
                <div className="mt-3 rounded-lg border border-secondary/30 bg-secondary/5 p-3 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-secondary">Scene Dialogue</span>
                    <button
                      onClick={() => addDialogueLine(si)}
                      className="text-xs text-secondary hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> line
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {scene.dialogue.map((dl, di) => (
                      <div key={di} className="flex items-start gap-2 group">
                        <EditableField
                          value={dl.speaker}
                          onChange={(v) => updateDialogueLine(si, di, "speaker", v)}
                          className="text-xs font-semibold text-foreground shrink-0 min-w-[60px]"
                        />
                        <span className="text-xs text-muted-foreground shrink-0">:</span>
                        <EditableField
                          value={dl.line}
                          onChange={(v) => updateDialogueLine(si, di, "line", v)}
                          className="text-xs text-foreground italic flex-1"
                        />
                        {scene.dialogue.length > 1 && (
                          <button
                            onClick={() => removeDialogueLine(si, di)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rehearse button */}
        <button
          onClick={rehearse}
          disabled={loading === "rehearse"}
          className="w-full rounded-lg bg-secondary text-secondary-foreground py-3 font-display font-semibold text-sm hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading === "rehearse" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Running takes…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Rehearse — Up to 5 Takes
            </>
          )}
        </button>
      </div>
    );
  }

  // Step 3: Takes
  if (step === "takes" && takes) {
    return (
      <div className="flex-1 flex flex-col animate-fade-in px-4 py-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-foreground">Rehearsal Takes</h2>
          <div className="flex gap-2">
            <button onClick={() => setStep("canvas")} className="text-xs text-muted-foreground hover:text-foreground">
              ← Back to canvas
            </button>
            <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> New
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {takes.map((take, i) => (
            <TakeCard key={i} take={take} index={i} />
          ))}
        </div>
      </div>
    );
  }

  return null;
};
