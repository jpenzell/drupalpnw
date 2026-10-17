import { useState, useEffect } from "react";
import { useSceneCanvas } from "@/contexts/SceneCanvasContext";
import { Plus, X, ChevronDown, ChevronRight } from "lucide-react";

interface Beat {
  id: number;
  want: string;
  action: string;
  obstacle: string;
}

interface Character {
  id: number;
  name: string;
  overallWant: string;
  beats: Beat[];
}

interface Scene {
  id: number;
  name: string;
  characters: Character[];
}

const makeCharacter = (): Character => ({
  id: Date.now() + Math.random(),
  name: "",
  overallWant: "",
  beats: [{ id: 1, want: "", action: "", obstacle: "" }],
});

const makeScene = (): Scene => ({
  id: Date.now(),
  name: "",
  characters: [makeCharacter()],
});

export const SceneSprintCanvasSlide = () => {
  const { setCanvas: setSharedCanvas } = useSceneCanvas();
  const [play, setPlay] = useState("");
  const [show, setShow] = useState("");
  const [scenes, setScenes] = useState<Scene[]>([makeScene()]);
  const [expandedScene, setExpandedScene] = useState<number | null>(null);

  // Sync to shared context whenever canvas changes
  useEffect(() => {
    const hasContent = play.trim() || show.trim() || scenes.some(s => s.name.trim() || s.characters.some(c => c.name.trim()));
    if (hasContent) {
      setSharedCanvas({
        play,
        show,
        scenes: scenes.map(s => ({
          name: s.name,
          characters: s.characters.map(c => ({
            name: c.name,
            overallWant: c.overallWant,
            beats: c.beats.map(b => ({ want: b.want, action: b.action, obstacle: b.obstacle })),
          })),
        })),
      });
    }
  }, [play, show, scenes, setSharedCanvas]);

  const inputClass =
    "w-full bg-transparent border-b border-border focus:border-secondary outline-none text-foreground placeholder:text-muted-foreground/50 py-1 text-sm";

  const update = (fn: (s: Scene[]) => Scene[]) => setScenes(fn);

  const addScene = () => update((prev) => [...prev, makeScene()]);
  const removeScene = (id: number) => {
    if (scenes.length > 1) update((prev) => prev.filter((s) => s.id !== id));
  };

  const addCharacter = (sceneId: number) =>
    update((prev) =>
      prev.map((s) =>
        s.id === sceneId ? { ...s, characters: [...s.characters, makeCharacter()] } : s
      )
    );

  const removeCharacter = (sceneId: number, charId: number) =>
    update((prev) =>
      prev.map((s) =>
        s.id === sceneId && s.characters.length > 1
          ? { ...s, characters: s.characters.filter((c) => c.id !== charId) }
          : s
      )
    );

  const updateCharField = (sceneId: number, charId: number, field: "name" | "overallWant", value: string) =>
    update((prev) =>
      prev.map((s) =>
        s.id === sceneId
          ? { ...s, characters: s.characters.map((c) => (c.id === charId ? { ...c, [field]: value } : c)) }
          : s
      )
    );

  const addBeat = (sceneId: number, charId: number) =>
    update((prev) =>
      prev.map((s) =>
        s.id === sceneId
          ? {
              ...s,
              characters: s.characters.map((c) =>
                c.id === charId
                  ? { ...c, beats: [...c.beats, { id: Date.now(), want: "", action: "", obstacle: "" }] }
                  : c
              ),
            }
          : s
      )
    );

  const updateBeat = (sceneId: number, charId: number, beatId: number, field: keyof Beat, value: string) =>
    update((prev) =>
      prev.map((s) =>
        s.id === sceneId
          ? {
              ...s,
              characters: s.characters.map((c) =>
                c.id === charId
                  ? { ...c, beats: c.beats.map((b) => (b.id === beatId ? { ...b, [field]: value } : b)) }
                  : c
              ),
            }
          : s
      )
    );

  return (
    <div className="flex-1 flex flex-col animate-fade-in px-4 py-4 overflow-hidden">
      <h2 className="text-xl font-display font-bold text-foreground text-center mb-3">
        Scene Sprint Canvas
      </h2>

      {/* Top row: Play / Show */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">The Play</label>
          <input className={inputClass} placeholder="The initiative as written…" value={play} onChange={(e) => setPlay(e.target.value)} />
        </div>
        <div className="rounded-lg border border-secondary/40 bg-secondary/5 p-3">
          <label className="text-xs uppercase tracking-widest text-secondary">The Show</label>
          <input className={inputClass} placeholder="The pattern people are living…" value={show} onChange={(e) => setShow(e.target.value)} />
        </div>
      </div>

      {/* Scenes */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {scenes.map((scene, si) => (
          <div key={scene.id} className="rounded-lg border border-border bg-card/60">
            {/* Scene header */}
            <div className="flex items-center gap-2 p-3 cursor-pointer" onClick={() => setExpandedScene(expandedScene === scene.id ? null : scene.id)}>
              {expandedScene === scene.id ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Scene {si + 1}</span>
              <input
                className={`${inputClass} flex-1`}
                placeholder="Scene name…"
                value={scene.name}
                onChange={(e) => update((prev) => prev.map((s) => (s.id === scene.id ? { ...s, name: e.target.value } : s)))}
                onClick={(e) => e.stopPropagation()}
              />
              {scenes.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); removeScene(scene.id); }} className="text-muted-foreground hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Expanded: Characters */}
            {(expandedScene === scene.id || scenes.length === 1) && (
              <div className="px-3 pb-3 space-y-3">
                {scene.characters.map((char) => (
                  <div key={char.id} className="rounded-md border border-border/60 bg-background/40 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input className={inputClass} placeholder="Character name" value={char.name} onChange={(e) => updateCharField(scene.id, char.id, "name", e.target.value)} />
                        <input className={inputClass} placeholder="Overall want / need" value={char.overallWant} onChange={(e) => updateCharField(scene.id, char.id, "overallWant", e.target.value)} />
                      </div>
                      {scene.characters.length > 1 && (
                        <button onClick={() => removeCharacter(scene.id, char.id)} className="text-muted-foreground hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Beats */}
                    <div className="space-y-1">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">Beats</span>
                      {char.beats.map((beat, bi) => (
                        <div key={beat.id} className="grid grid-cols-3 gap-2 pl-2 border-l-2 border-secondary/30">
                          <input className={inputClass} placeholder={`Beat ${bi + 1} want…`} value={beat.want} onChange={(e) => updateBeat(scene.id, char.id, beat.id, "want", e.target.value)} />
                          <input className={inputClass} placeholder="Action / tactic…" value={beat.action} onChange={(e) => updateBeat(scene.id, char.id, beat.id, "action", e.target.value)} />
                          <input className={inputClass} placeholder="Obstacle…" value={beat.obstacle} onChange={(e) => updateBeat(scene.id, char.id, beat.id, "obstacle", e.target.value)} />
                        </div>
                      ))}
                      <button onClick={() => addBeat(scene.id, char.id)} className="text-xs text-secondary hover:underline">+ beat</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => addCharacter(scene.id)} className="text-xs text-secondary hover:underline">+ character</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add scene */}
      <button
        onClick={addScene}
        className="mt-2 w-full rounded-lg border border-dashed border-border py-2 flex items-center justify-center gap-2 text-muted-foreground hover:text-secondary hover:border-secondary transition-colors text-sm"
      >
        <Plus className="w-4 h-4" /> Add Scene
      </button>
    </div>
  );
};
