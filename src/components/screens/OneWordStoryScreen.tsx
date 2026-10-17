import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Hand,
  PenTool,
  CheckCircle2,
  Plus,
  RotateCcw,
  Users,
  ChevronRight,
  Sparkles,
  Play,
  Shuffle,
} from "lucide-react";

const POOL_OFFSET = 1000; // positions >= 1000 are "in the lottery pool", not yet picked
const DISCARDED_OFFSET = 10000; // positions >= 10000 are hidden discarded lottery entries
const PICK_COUNT = 3;


type GameStage = 'volunteering' | 'writing' | 'complete';

interface Volunteer {
  id: string;
  participant_id: string;
  participant_name: string;
  position: number;
}

interface StoryWord {
  id: string;
  word: string;
  added_by: string;
  position: number;
}

interface GameState {
  stage: GameStage;
  max_volunteers: number;
  current_writer_position: number;
}

export const OneWordStoryScreen = () => {
  const { session, isPresenter, participantId, isSoloMode } = useSession();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    stage: 'volunteering',
    max_volunteers: 3,
    current_writer_position: 1
  });
  
  // Treat solo mode as presenter for controls
  const canControl = isPresenter || isSoloMode;
  
  // Data
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [words, setWords] = useState<StoryWord[]>([]);
  
  // Input state
  const [newWord, setNewWord] = useState("");
  const [volunteerName, setVolunteerName] = useState("");
  const [maxVolunteers, setMaxVolunteers] = useState(5);
  const [showReconnect, setShowReconnect] = useState(false);
  const [reconnectName, setReconnectName] = useState("");
  // Lottery mode (default ON for QR-based audience picks)
  const [lotteryMode, setLotteryMode] = useState(true);
  const [justPicked, setJustPicked] = useState(false);
  // Elimination animation state
  const [eliminating, setEliminating] = useState(false);
  const [eliminatedIds, setEliminatedIds] = useState<string[]>([]);
  const [spotlightId, setSpotlightId] = useState<string | null>(null); // currently being eliminated
  const [survivorIds, setSurvivorIds] = useState<string[]>([]);

  // Derived: candidates (in pool) vs picked (positions 1..N)
  const pickedVolunteers = volunteers.filter((v) => v.position > 0 && v.position < POOL_OFFSET);
  const candidates = volunteers.filter((v) => v.position >= POOL_OFFSET && v.position < DISCARDED_OFFSET);
  const myCandidacy = candidates.find((v) => v.participant_id === participantId);

  
  // Demo preview state (always runs during volunteering)
  const [demoWords, setDemoWords] = useState<string[]>([]);
  const [demoWriterIndex, setDemoWriterIndex] = useState(0);
  
  const demoWriters = ["Alex", "Jordan", "Sam", "Taylor", "Casey"];
  const demoStoryWords = ["Once", "upon", "a", "time", "there", "lived", "a", "curious", "robot", "who", "loved", "dancing"];

  // Local words for when no session is active (presenter demo mode)
  const [localWords, setLocalWords] = useState<string[]>([]);

  // Run demo animation during volunteering stage (loops continuously)
  useEffect(() => {
    if (gameState.stage !== 'volunteering') {
      setDemoWords([]);
      setDemoWriterIndex(0);
      return;
    }

    if (demoWords.length >= demoStoryWords.length) {
      const resetTimer = setTimeout(() => {
        setDemoWords([]);
        setDemoWriterIndex(0);
      }, 2200);
      return () => clearTimeout(resetTimer);
    }

    const timer = setTimeout(() => {
      setDemoWords(prev => [...prev, demoStoryWords[prev.length]]);
      setDemoWriterIndex(prev => (prev + 1) % demoWriters.length);
    }, 800);

    return () => clearTimeout(timer);
  }, [gameState.stage, demoWords.length]);

  // Check if current user is a volunteer and if it's their turn
  const myVolunteer = volunteers.find(v => v.participant_id === participantId && v.position < POOL_OFFSET);
  const isMyTurn = myVolunteer && myVolunteer.position === gameState.current_writer_position;
  const currentWriter = volunteers.find(v => v.position === gameState.current_writer_position);

  // Initialize/load game state
  useEffect(() => {
    if (!session?.id) return;

    const loadGameState = async () => {
      // Try to get existing game state
      const { data: existing } = await supabase
        .from('story_game_state')
        .select('*')
        .eq('session_id', session.id)
        .single();

      if (existing) {
        // Map old story-building stages to the simplified live-only volunteer screen.
        let stage = existing.stage as string;
        if (stage !== 'volunteering') {
          stage = 'volunteering';
        }
        setGameState({
          stage: stage as GameStage,
          max_volunteers: existing.max_volunteers || 3,
          current_writer_position: existing.current_writer_position || 1
        });
        setMaxVolunteers(existing.max_volunteers || 3);
      } else if (canControl) {
        // Create new game state
        await supabase
          .from('story_game_state')
          .insert({
            session_id: session.id,
            stage: 'volunteering',
            max_volunteers: 3
          });
      }

      // Load volunteers
      const { data: volunteersData } = await supabase
        .from('story_volunteers')
        .select('*')
        .eq('session_id', session.id)
        .order('position', { ascending: true });
      if (volunteersData) setVolunteers(volunteersData);

      // Load words
      const { data: wordsData } = await supabase
        .from('story_words')
        .select('*')
        .eq('session_id', session.id)
        .order('position', { ascending: true });
      if (wordsData) setWords(wordsData);
    };

    loadGameState();
  }, [session?.id, canControl, participantId]);

  // Real-time subscriptions
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`story:${session.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'story_game_state',
        filter: `session_id=eq.${session.id}`
      }, (payload) => {
        if (payload.new) {
          const newState = payload.new as any;
          let stage = newState.stage as string;
          if (stage !== 'volunteering') {
            stage = 'volunteering';
          }
          setGameState({
            stage: stage as GameStage,
            max_volunteers: newState.max_volunteers || 3,
            current_writer_position: newState.current_writer_position || 1
          });
          setMaxVolunteers(newState.max_volunteers || 3);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'story_volunteers',
        filter: `session_id=eq.${session.id}`
      }, async () => {
        const { data } = await supabase
          .from('story_volunteers')
          .select('*')
          .eq('session_id', session.id)
          .order('position', { ascending: true });
        if (data) setVolunteers(data);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'story_words',
        filter: `session_id=eq.${session.id}`
      }, async () => {
        const { data } = await supabase
          .from('story_words')
          .select('*')
          .eq('session_id', session.id)
          .order('position', { ascending: true });
        if (data) setWords(data);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [session?.id]);

  // Actions
  const volunteer = async () => {
    if (!session?.id || !volunteerName.trim()) return;
    
    const nextPosition = volunteers.length + 1;
    if (nextPosition > gameState.max_volunteers) return;
    
    await supabase.from('story_volunteers').insert({
      session_id: session.id,
      participant_id: participantId,
      participant_name: volunteerName.trim(),
      position: nextPosition
    });
    setVolunteerName("");
  };

  // Lottery: participant joins the candidate pool (no slot cap)
  const joinLottery = async () => {
    if (!session?.id || !volunteerName.trim()) return;
    if (myCandidacy) return; // already in
    // Pool position = POOL_OFFSET + current candidate count, just to keep them unique-ordered
    const poolPosition = POOL_OFFSET + candidates.length + 1;
    await supabase.from("story_volunteers").insert({
      session_id: session.id,
      participant_id: participantId,
      participant_name: volunteerName.trim(),
      position: poolPosition,
    });
    setVolunteerName("");
  };

  // Lottery: presenter randomly picks N from candidate pool, deletes the rest
  const pickRandom = async () => {
    if (!session?.id || !canControl) return;
    if (candidates.length === 0 || eliminating) return;

    // Decide survivors up front
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const targetSurvivorCount = Math.min(PICK_COUNT, shuffled.length);
    const survivors = shuffled.slice(0, targetSurvivorCount);
    const toEliminate = shuffled.slice(targetSurvivorCount);

    // If nobody to eliminate, jump straight to commit
    if (toEliminate.length === 0) {
      await commitPick(survivors, []);
      return;
    }

    setEliminating(true);
    setEliminatedIds([]);
    setSpotlightId(null);
    setSurvivorIds([]);

    // Eliminate one at a time, with quickening pace + dramatic spotlight
    const eliminated: typeof toEliminate = [];
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    for (let i = 0; i < toEliminate.length; i++) {
      const victim = toEliminate[i];
      // Spotlight builds suspense: longer pause for first eliminations, faster as it tightens
      const suspenseMs = Math.max(700, 1600 - i * 250);
      setSpotlightId(victim.id);
      await sleep(suspenseMs);
      // Strike them
      eliminated.push(victim);
      setEliminatedIds(eliminated.map((v) => v.id));
      setSpotlightId(null);
      // Brief beat between eliminations
      await sleep(450);
    }

    // Final reveal: spotlight survivors
    setSurvivorIds(survivors.map((v) => v.id));
    await sleep(1100);

    await commitPick(survivors, toEliminate);
    setEliminating(false);
  };

  const goToNextSlide = () => {
    window.dispatchEvent(new CustomEvent("presentation:navigate", { detail: "next" }));
  };

  // Commit lottery results to DB (assign positions, hide eliminated)
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

    const discardedCount = volunteers.filter((v) => v.position >= DISCARDED_OFFSET).length;
    await Promise.all(
      eliminated.map((vol, idx) =>
        supabase
          .from("story_volunteers")
          .update({ position: DISCARDED_OFFSET + discardedCount + idx + 1 })
          .eq("id", vol.id),
      ),
    );

    await supabase
      .from("story_game_state")
      .update({ max_volunteers: survivors.length })
      .eq("session_id", session.id);

    setJustPicked(true);
    setTimeout(() => {
      setJustPicked(false);
      setEliminatedIds([]);
      setSurvivorIds([]);
      setSpotlightId(null);
    }, 2500);
  };



  // Reconnect to existing volunteer slot by name
  const reconnectAsVolunteer = async () => {
    if (!session?.id || !reconnectName.trim()) return;
    
    const matchingVolunteer = volunteers.find(
      v => v.participant_name.toLowerCase() === reconnectName.trim().toLowerCase()
    );
    
    if (matchingVolunteer) {
      await supabase
        .from('story_volunteers')
        .update({ participant_id: participantId })
        .eq('id', matchingVolunteer.id);
      
      setReconnectName("");
      setShowReconnect(false);
    }
  };

  const addWord = async () => {
    if (!newWord.trim() || !session?.id || !isMyTurn) return;
    
    const nextPosition = words.length + 1;
    await supabase.from('story_words').insert({
      session_id: session.id,
      word: newWord.trim(),
      added_by: participantId,
      position: nextPosition
    });
    
    // Advance to next writer
    const nextWriter = (gameState.current_writer_position % volunteers.length) + 1;
    await supabase
      .from('story_game_state')
      .update({ current_writer_position: nextWriter })
      .eq('session_id', session.id);
    
    setNewWord("");
  };

  // Add word (presenter/solo can always add, even without being a volunteer)
  const addWordAsPresenter = async () => {
    if (!newWord.trim()) return;
    if (!canControl && !isMyTurn) return;
    
    // If session exists, save to database
    if (session?.id) {
      const nextPosition = words.length + 1;
      await supabase.from('story_words').insert({
        session_id: session.id,
        word: newWord.trim(),
        added_by: participantId,
        position: nextPosition
      });
      
      // Advance to next writer if there are volunteers
      if (volunteers.length > 0) {
        const nextWriter = (gameState.current_writer_position % volunteers.length) + 1;
        await supabase
          .from('story_game_state')
          .update({ current_writer_position: nextWriter })
          .eq('session_id', session.id);
      }
    } else {
      // Local mode - just add to local state
      setLocalWords(prev => [...prev, newWord.trim()]);
    }
    
    setNewWord("");
  };

  // Presenter/Solo controls
  const advanceStage = async (nextStage: GameStage) => {
    if (!canControl) return;
    
    // If session exists, update database
    if (session?.id) {
      const updates: any = { stage: nextStage };
      if (nextStage === 'writing') {
        updates.max_volunteers = maxVolunteers;
      }
      
      await supabase
        .from('story_game_state')
        .update(updates)
        .eq('session_id', session.id);
    } else {
      // Local mode - just update local state
      setGameState(prev => ({ ...prev, stage: nextStage }));
    }
  };

  const resetGame = async () => {
    if (!canControl) return;
    
    // If session exists, delete from database
    if (session?.id) {
      await supabase.from('story_words').delete().eq('session_id', session.id);
      await supabase.from('story_volunteers').delete().eq('session_id', session.id);
      
      await supabase
        .from('story_game_state')
        .update({
          stage: 'volunteering',
          current_writer_position: 1,
          topic: null
        })
        .eq('session_id', session.id);
    }
    
    // Always reset local state
    setVolunteers([]);
    setWords([]);
    setLocalWords([]);
    setGameState({
      stage: 'volunteering',
      max_volunteers: 3,
      current_writer_position: 1
    });
  };

  // Stage indicator - simplified flow
  const stages = [
    { key: 'volunteering', label: 'Volunteers', icon: Hand },
  ];

  // Voluntell - randomly pick a logged-in participant who hasn't volunteered
  const voluntell = async () => {
    if (!session?.id || !isPresenter) return;
    
    // Get all participants from the session (we'll use responses table to find active participants)
    // For now, create a random "voluntold" participant
    const nextPosition = volunteers.length + 1;
    if (nextPosition > gameState.max_volunteers) return;
    
    const voluntoldNames = ["Brave Soul", "Lucky Winner", "Chosen One", "Star Player", "MVP"];
    const randomName = voluntoldNames[Math.floor(Math.random() * voluntoldNames.length)];
    
    await supabase.from('story_volunteers').insert({
      session_id: session.id,
      participant_id: `voluntold-${Date.now()}`,
      participant_name: `${randomName} #${nextPosition}`,
      position: nextPosition
    });
  };

  return (
    <div className="flex-1 flex flex-col animate-fade-in p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 border border-secondary/30 rounded-full mb-3">
          <Sparkles className="h-3.5 w-3.5 text-secondary" />
          <span className="text-secondary font-semibold tracking-wide text-xs uppercase">
            Round 1 · Cast Call
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          Who&rsquo;s In?
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
          Drop the join link in the chat — anyone who opts in goes into the lottery. The lottery picks who writes; everyone else watches the story unfold. Quiet room? Skip ahead and play all the parts yourself.
        </p>
      </div>

      {/* Stage Progress */}
      <div className="flex justify-center gap-2 md:gap-4 mb-6">
        {stages.map((s, i) => {
          const Icon = s.icon;
          const isActive = s.key === gameState.stage;
          const isPast = stages.findIndex(st => st.key === gameState.stage) > i;
          return (
            <div
              key={s.key}
              className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : isPast
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className={`flex-1 w-full ${canControl && lotteryMode && gameState.stage === 'volunteering' ? '' : 'max-w-6xl mx-auto'}`}>
        {/* STAGE: Volunteering */}
         {gameState.stage === 'volunteering' && (
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {/* Session mode: Show volunteer collection */}
              {session ? (
                <>
                  <div className="bg-gradient-to-br from-secondary/20 to-primary/10 border-2 border-secondary/40 rounded-2xl p-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                      ✋ Who&rsquo;s In the Lottery?
                    </h2>
                    <p className="text-muted-foreground">
                      {lotteryMode
                        ? `Share the join link in the chat — we'll randomly pick ${PICK_COUNT} writers from everyone who opts in.`
                        : `We need ${gameState.max_volunteers} writers to build a story together!`}
                    </p>
                  </div>

                  {/* Mode toggle — only shown when NOT in lottery (so user can switch back) */}
                  {canControl && !lotteryMode && (
                    <div className="flex justify-center gap-2 mb-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLotteryMode(true)}
                      >
                        <Shuffle className="h-4 w-4 mr-1" /> Switch to Lottery
                      </Button>
                      <Button size="sm" variant="default">
                        <Hand className="h-4 w-4 mr-1" /> First-come slots
                      </Button>
                    </div>
                  )}

                  {/* ============== PRESENTER / SOLO VIEW ============== */}
                  {canControl ? (
                    <div className="bg-card/50 border border-border/50 rounded-2xl p-6">
                      {/* Presenter-only: visual demo of how the one-word story will work */}
                      <div className="mb-6 bg-gradient-to-br from-accent/10 to-secondary/10 border-2 border-accent/30 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-bold text-accent flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Here's how it works
                          </h4>
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Presenter preview</span>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Each writer adds <strong>one word</strong> in turn. The story builds itself, live — you'll type each word the volunteer calls out on the next slide.
                        </p>

                        {/* Demo story building */}
                        <div className="bg-card/80 border border-border/50 rounded-xl p-4 min-h-[72px]">
                          <p className="text-foreground text-xl md:text-2xl leading-relaxed">
                            {demoWords.length === 0 ? (
                              <span className="text-muted-foreground italic">Story starts here…</span>
                            ) : (
                              <>
                                {demoWords.join(" ")}
                                <span className="animate-pulse text-primary">▌</span>
                              </>
                            )}
                          </p>
                        </div>

                        {/* Demo writer roster */}
                        <div className="flex justify-center gap-1.5 flex-wrap">
                          {demoWriters.map((name, i) => (
                            <div
                              key={name}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                                i === demoWriterIndex
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted/50 text-muted-foreground'
                              }`}
                            >
                              {i + 1}. {name}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-center space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Drop the join link in the chat, let people opt in, then pick →
                        </p>
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => advanceStage('writing')}
                          >
                            <ChevronRight className="h-4 w-4 mr-1" />
                            Skip — I&rsquo;ll play all the parts
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ============== PARTICIPANT VIEW ============== */
                    <div className="bg-card/50 border border-border/50 rounded-2xl p-6">
                      {lotteryMode ? (
                        <>
                          {/* If picked, celebrate; if in pool, waiting; else, join the lottery */}
                          {myVolunteer ? (
                            <div className="text-center py-4 space-y-2">
                              <div className="text-4xl">🎉</div>
                              <p className="text-xl font-bold text-primary">
                                You're Writer #{myVolunteer.position}!
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Watch the main screen — your turn is coming.
                              </p>
                            </div>
                          ) : myCandidacy ? (
                            <div className="text-center py-4 space-y-2">
                              <div className="text-3xl">✋</div>
                              <p className="text-lg font-semibold text-foreground">
                                You're in the lottery, {myCandidacy.participant_name}!
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {candidates.length}{" "}
                                {candidates.length === 1 ? "person" : "people"}{" "}
                                in the lottery so far. Hang tight — random pick coming.
                              </p>
                            </div>
                          ) : pickedVolunteers.length > 0 ? (
                            <div className="text-center py-4 space-y-2">
                              <p className="text-base text-muted-foreground">
                                The writers have been picked! Watch the main screen.
                              </p>
                              <div className="flex flex-wrap gap-2 justify-center pt-2">
                                {pickedVolunteers
                                  .sort((a, b) => a.position - b.position)
                                  .map((v) => (
                                    <div
                                      key={v.id}
                                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                                    >
                                      {v.position}. {v.participant_name}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <p className="text-center text-base">
                                Want to be one of the writers?{" "}
                                <span className="text-muted-foreground">
                                  Drop your name in — we'll pick {PICK_COUNT} at random.
                                </span>
                              </p>
                              <div className="flex gap-3 justify-center">
                                <Input
                                  value={volunteerName}
                                  onChange={(e) => setVolunteerName(e.target.value)}
                                  placeholder="Your name"
                                  className="max-w-[200px]"
                                  maxLength={20}
                                  onKeyDown={(e) => e.key === "Enter" && joinLottery()}
                                />
                                <Button
                                  onClick={joinLottery}
                                  disabled={!volunteerName.trim()}
                                  size="lg"
                                >
                                  <Hand className="h-4 w-4 mr-2" />
                                  I'm in!
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Volunteer slots */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                            {Array.from({ length: gameState.max_volunteers }).map((_, i) => {
                              const vol = pickedVolunteers.find((v) => v.position === i + 1);
                              return (
                                <div
                                  key={i}
                                  className={`p-4 rounded-xl border-2 text-center ${
                                    vol
                                      ? "border-primary bg-primary/10"
                                      : "border-dashed border-border/50 bg-muted/20"
                                  }`}
                                >
                                  <div className="text-2xl font-bold mb-1">{i + 1}</div>
                                  <div
                                    className={`text-sm ${vol ? "text-primary font-medium" : "text-muted-foreground"}`}
                                  >
                                    {vol ? vol.participant_name : "Open"}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {!myVolunteer &&
                            pickedVolunteers.length < gameState.max_volunteers && (
                              <div className="flex gap-3 justify-center">
                                <Input
                                  value={volunteerName}
                                  onChange={(e) => setVolunteerName(e.target.value)}
                                  placeholder="Your name"
                                  className="max-w-[200px]"
                                  maxLength={20}
                                />
                                <Button
                                  onClick={volunteer}
                                  disabled={!volunteerName.trim()}
                                  size="lg"
                                >
                                  <Hand className="h-4 w-4 mr-2" />
                                  I'll Do It!
                                </Button>
                              </div>
                            )}

                          {/* Reconnect option for disconnected volunteers */}
                          {!myVolunteer && pickedVolunteers.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-border/50">
                              {!showReconnect ? (
                                <div className="text-center">
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Were you already a writer? Reconnect:
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowReconnect(true)}
                                  >
                                    Reconnect to my slot
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex gap-2 justify-center">
                                  <Input
                                    value={reconnectName}
                                    onChange={(e) => setReconnectName(e.target.value)}
                                    placeholder="Your name"
                                    className="max-w-[150px]"
                                    onKeyDown={(e) =>
                                      e.key === "Enter" && reconnectAsVolunteer()
                                    }
                                  />
                                  <Button
                                    size="sm"
                                    onClick={reconnectAsVolunteer}
                                    disabled={!reconnectName.trim()}
                                  >
                                    Reconnect
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowReconnect(false)}
                                  >
                                    ✕
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}

                          {myVolunteer && (
                            <p className="text-center text-primary font-semibold">
                              You're Writer #{myVolunteer.position}! 🎉
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* No session: simplified view - just show demo and start button */
                <div className="bg-gradient-to-br from-secondary/20 to-primary/10 border-2 border-secondary/40 rounded-2xl p-6 text-center space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    🎭 Solo Demo Mode
                  </h2>
                  <p className="text-muted-foreground">
                    Watch the demo, then start the writing exercise!
                  </p>
                  <Button 
                    size="lg"
                    onClick={() => advanceStage('writing')}
                    className="mt-4"
                  >
                    <ChevronRight className="h-5 w-5 mr-2" />
                    Start Writing
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    💡 Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space</kbd> or <kbd className="px-1 py-0.5 bg-muted rounded text-xs">→</kbd> to advance
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STAGE: Writing */}
        {gameState.stage === 'writing' && (
          <div className="space-y-6">
            {/* Story Display */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-2xl p-8 min-h-[200px]">
              {/* Use session words if available, otherwise local words */}
              {(() => {
                const allWords = words.length > 0 ? words.map(w => w.word) : localWords;
                return allWords.length === 0 ? (
                  <p className="text-muted-foreground italic text-xl text-center">
                    The story begins... Type your first word below!
                  </p>
                ) : (
                  <p className="text-foreground text-2xl md:text-3xl leading-relaxed">
                    {allWords.join(" ")}
                    <span className="animate-pulse text-primary">▌</span>
                  </p>
                );
              })()}
            </div>

            {/* Current Writer Indicator - show different message for solo presenter mode */}
            {volunteers.length > 0 ? (
              <div className="flex justify-center">
                <div className={`px-6 py-3 rounded-full font-semibold ${
                  isMyTurn 
                    ? 'bg-primary text-primary-foreground animate-pulse' 
                    : 'bg-muted/50 text-muted-foreground'
                }`}>
                  {isMyTurn ? (
                    <>🎤 Your Turn!</>
                  ) : (
                    <>Waiting for: {currentWriter?.participant_name || 'Writer'}</>
                  )}
                </div>
              </div>
            ) : canControl ? (
              <div className="flex justify-center">
                <div className="px-6 py-3 rounded-full font-semibold bg-secondary text-secondary-foreground">
                  🎤 Solo Mode - Type words as they're called out!
                </div>
              </div>
            ) : null}

            {/* Word Input (for current writer OR presenter/solo demo) */}
            {(isMyTurn || canControl) && (
              <div className="flex gap-3 justify-center">
                <Input
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value.split(' ')[0])}
                  onKeyDown={(e) => e.key === 'Enter' && addWordAsPresenter()}
                  placeholder="Type one word..."
                  className="max-w-[300px] text-xl"
                  
                  maxLength={30}
                />
                <Button onClick={addWordAsPresenter} disabled={!newWord.trim()} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Word
                </Button>
              </div>
            )}

            {/* Writer roster - only show if there are volunteers */}
            {volunteers.length > 0 && (
              <div className="flex justify-center gap-2 flex-wrap">
                {volunteers.map((vol) => (
                  <div
                    key={vol.id}
                    className={`px-3 py-1 rounded-full text-sm ${
                      vol.position === gameState.current_writer_position
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    {vol.position}. {vol.participant_name}
                  </div>
                ))}
              </div>
            )}

            {/* Presenter/Solo Controls */}
            {canControl && (
              <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6">
                <h3 className="font-semibold mb-3">Presenter Controls</h3>
                <div className="flex gap-3">
                  <Button onClick={() => advanceStage('complete')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Finish Story
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  💡 Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">→</kbd> to finish story
                </p>
              </div>
            )}
          </div>
        )}

        {/* STAGE: Complete */}
        {gameState.stage === 'complete' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-secondary/20 to-primary/20 border-2 border-secondary/40 rounded-3xl p-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-2xl md:text-3xl text-foreground leading-relaxed font-serif">
                {/* Use session words if available, otherwise local words */}
                {words.length > 0 ? words.map(w => w.word).join(" ") : localWords.join(" ")}
              </p>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {volunteers.length > 0 
                  ? `Written by: ${volunteers.map(v => v.participant_name).join(", ")}`
                  : "Written collaboratively"
                }
              </p>
            </div>

            {/* Presenter/Solo Controls */}
            {canControl && (
              <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 text-center">
                <h3 className="font-semibold mb-3">Presenter Controls</h3>
                <Button onClick={resetGame} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start New Story
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
