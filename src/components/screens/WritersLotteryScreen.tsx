import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Shuffle, ChevronRight, Sparkles, RotateCcw } from "lucide-react";

const POOL_OFFSET = 1000;
const DISCARDED_OFFSET = 10000;
const PICK_COUNT = 3;

interface Volunteer {
  id: string;
  participant_id: string;
  participant_name: string;
  position: number;
}

/**
 * Slide S3a-pick — the magical lottery moment.
 * Pulls candidates volunteered on the previous slide and animates the
 * random selection of {PICK_COUNT} writers.
 */
export const WritersLotteryScreen = () => {
  const { session, isPresenter, isSoloMode, participantId } = useSession();
  const canControl = isPresenter || isSoloMode;

  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [eliminating, setEliminating] = useState(false);
  const [eliminatedIds, setEliminatedIds] = useState<string[]>([]);
  const [spotlightId, setSpotlightId] = useState<string | null>(null);
  const [survivorIds, setSurvivorIds] = useState<string[]>([]);
  const [shuffleTick, setShuffleTick] = useState(0);

  const candidates = volunteers.filter(
    (v) => v.position >= POOL_OFFSET && v.position < DISCARDED_OFFSET,
  );
  const pickedVolunteers = volunteers
    .filter((v) => v.position > 0 && v.position < POOL_OFFSET)
    .sort((a, b) => a.position - b.position);

  const myCandidacy = candidates.find((v) => v.participant_id === participantId);
  const myPick = pickedVolunteers.find((v) => v.participant_id === participantId);

  // Load volunteers + subscribe
  useEffect(() => {
    if (!session?.id) return;

    const load = async () => {
      const { data } = await supabase
        .from("story_volunteers")
        .select("*")
        .eq("session_id", session.id)
        .order("position", { ascending: true });
      if (data) setVolunteers(data);
    };
    load();

    const channel = supabase
      .channel(`writers-lottery:${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "story_volunteers",
          filter: `session_id=eq.${session.id}`,
        },
        load,
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [session?.id]);

  // Subtle shuffle animation while idle to hint at randomness
  useEffect(() => {
    if (eliminating || pickedVolunteers.length > 0) return;
    if (candidates.length < 2) return;
    const t = setInterval(() => setShuffleTick((n) => n + 1), 1200);
    return () => clearInterval(t);
  }, [eliminating, pickedVolunteers.length, candidates.length]);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const goToNextSlide = () => {
    window.dispatchEvent(
      new CustomEvent("presentation:navigate", { detail: "next" }),
    );
  };

  const commitPick = async (
    survivors: Volunteer[],
    eliminated: Volunteer[],
  ) => {
    if (!session?.id) return;

    await Promise.all(
      survivors.map((vol, idx) =>
        supabase
          .from("story_volunteers")
          .update({ position: idx + 1 })
          .eq("id", vol.id),
      ),
    );

    const discardedCount = volunteers.filter(
      (v) => v.position >= DISCARDED_OFFSET,
    ).length;

    await Promise.all(
      eliminated.map((vol, idx) =>
        supabase
          .from("story_volunteers")
          .update({
            position: DISCARDED_OFFSET + discardedCount + idx + 1,
          })
          .eq("id", vol.id),
      ),
    );

    await supabase
      .from("story_game_state")
      .update({ max_volunteers: survivors.length })
      .eq("session_id", session.id);
  };

  const pickRandom = async () => {
    if (!session?.id || !canControl) return;
    if (candidates.length === 0 || eliminating) return;

    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const targetSurvivorCount = Math.min(PICK_COUNT, shuffled.length);
    const survivors = shuffled.slice(0, targetSurvivorCount);
    const toEliminate = shuffled.slice(targetSurvivorCount);

    if (toEliminate.length === 0) {
      setSurvivorIds(survivors.map((v) => v.id));
      await sleep(900);
      await commitPick(survivors, []);
      return;
    }

    setEliminating(true);
    setEliminatedIds([]);
    setSpotlightId(null);
    setSurvivorIds([]);

    const eliminated: Volunteer[] = [];

    for (let i = 0; i < toEliminate.length; i++) {
      const victim = toEliminate[i];
      const suspenseMs = Math.max(650, 1500 - i * 200);
      setSpotlightId(victim.id);
      await sleep(suspenseMs);
      eliminated.push(victim);
      setEliminatedIds(eliminated.map((v) => v.id));
      setSpotlightId(null);
      await sleep(400);
    }

    setSurvivorIds(survivors.map((v) => v.id));
    await sleep(1100);

    await commitPick(survivors, eliminated);
    setEliminating(false);
  };

  const repool = async () => {
    if (!session?.id || !canControl) return;
    await Promise.all(
      pickedVolunteers.map((v, idx) =>
        supabase
          .from("story_volunteers")
          .update({ position: POOL_OFFSET + candidates.length + idx + 1 })
          .eq("id", v.id),
      ),
    );
    setSurvivorIds([]);
    setEliminatedIds([]);
    setSpotlightId(null);
  };

  // Solo / no session — just show a soft empty state
  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 animate-fade-in">
        <Sparkles className="h-10 w-10 text-secondary mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
          And the writers are…
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          (Solo demo — start a live session on the previous slide to run the
          random pick.)
        </p>
        <Button size="lg" className="mt-6" onClick={goToNextSlide}>
          Continue <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    );
  }

  const picked = pickedVolunteers.length > 0;

  return (
    <div className="flex-1 flex flex-col animate-fade-in p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 border border-secondary/30 rounded-full mb-3">
          <Sparkles className="h-3.5 w-3.5 text-secondary" />
          <span className="text-secondary font-semibold tracking-wide text-xs uppercase">
            Round 1 · The Pick
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground font-display">
          {picked ? "🎭 Our Writers!" : "And the writers are…"}
        </h1>
        {!picked && (
          <p className="text-base md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            {eliminating
              ? "The lottery is live. No takebacks."
              : `${candidates.length} ${
                  candidates.length === 1 ? "person" : "people"
                } volunteered. We'll pick ${PICK_COUNT} at random.`}
          </p>
        )}
      </div>

      {/* Stage */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {candidates.length === 0 && !picked ? (
          <div className="text-center text-muted-foreground italic max-w-md">
            <p className="text-lg">No volunteers yet.</p>
            <p className="text-sm mt-2">
              Head back a slide and let folks tap "I'm in!" — or just skip ahead.
            </p>
          </div>
        ) : (
          <>
            {/* Eliminating banner */}
            {eliminating && (
              <p className="text-center text-2xl md:text-3xl font-display italic text-secondary animate-pulse">
                {spotlightId
                  ? "And the next to leave us is…"
                  : survivorIds.length > 0
                    ? "🎭 Our writers!"
                    : "Choosing…"}
              </p>
            )}

            {/* Picked roster (winners only, after pick) */}
            {picked ? (
              <div className="flex flex-wrap gap-4 justify-center">
                {pickedVolunteers.map((vol) => (
                  <div
                    key={vol.id}
                    className="px-8 py-5 rounded-full bg-primary text-primary-foreground font-bold text-2xl md:text-3xl shadow-2xl shadow-primary/40 ring-4 ring-primary/60 animate-fade-in"
                  >
                    🌟 {vol.position}. {vol.participant_name}
                  </div>
                ))}
              </div>
            ) : (
              /* Candidate pool with elimination drama */
              <div
                key={shuffleTick}
                className="flex flex-wrap gap-3 justify-center max-w-5xl"
              >
                {(eliminating ? candidates : [...candidates].sort(() => Math.random() - 0.5)).map((vol) => {
                  const isSpotlight = spotlightId === vol.id;
                  const isEliminated = eliminatedIds.includes(vol.id);
                  const isSurvivor = survivorIds.includes(vol.id);
                  const dim =
                    eliminating && !isSpotlight && !isEliminated && !isSurvivor;
                  return (
                    <div
                      key={vol.id}
                      className={[
                        "px-5 py-2.5 rounded-full text-lg md:text-xl font-semibold transition-all duration-500",
                        isSpotlight
                          ? "bg-secondary text-secondary-foreground shadow-2xl shadow-secondary/60 ring-4 ring-secondary animate-spotlight-pulse"
                          : isEliminated
                            ? "bg-destructive/30 text-destructive-foreground line-through animate-eliminate-out pointer-events-none"
                            : isSurvivor
                              ? "bg-primary text-primary-foreground scale-125 shadow-2xl shadow-primary/60 ring-4 ring-primary animate-survivor-reveal"
                              : dim
                                ? "bg-secondary/20 text-foreground/60 scale-95 opacity-70"
                                : "bg-secondary/30 text-foreground animate-pop-in",
                      ].join(" ")}
                    >
                      {isSurvivor ? "🌟 " : isEliminated ? "💀 " : "✋ "}
                      {vol.participant_name}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Participant feedback */}
            {!canControl && (
              <div className="text-center mt-2">
                {myPick ? (
                  <p className="text-xl font-bold text-primary">
                    🎉 You're Writer #{myPick.position}!
                  </p>
                ) : myCandidacy && !picked ? (
                  <p className="text-base text-muted-foreground">
                    You're in the lottery, {myCandidacy.participant_name} —
                    fingers crossed!
                  </p>
                ) : picked ? (
                  <p className="text-base text-muted-foreground">
                    Watch the main screen — your turn to cheer.
                  </p>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>

      {/* Presenter / solo controls */}
      {canControl && (
        <div className="flex items-center justify-center gap-3 pt-8 flex-wrap">
          {!picked ? (
            <>
              <Button
                onClick={pickRandom}
                disabled={candidates.length === 0 || eliminating}
                size="lg"
                className="h-16 px-10 text-xl font-bold shadow-xl"
              >
                <Shuffle className="h-5 w-5 mr-2" />
                {eliminating
                  ? "Choosing…"
                  : `🎲 Pick ${Math.min(PICK_COUNT, Math.max(candidates.length, 1))} at random`}
              </Button>
              <Button
                onClick={goToNextSlide}
                variant="outline"
                size="lg"
                className="h-16 px-6 text-base"
                disabled={eliminating}
              >
                Skip & Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={goToNextSlide}
                size="lg"
                className="h-16 px-10 text-xl font-bold shadow-xl"
              >
                Continue
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                onClick={repool}
                variant="outline"
                size="lg"
                className="h-16 px-6 text-base"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Re-pick
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
