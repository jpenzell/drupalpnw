import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/contexts/SessionContext";
import { usePoll } from "@/contexts/PollContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Loader2, 
  ChevronRight,
  MessageSquare,
  Hand,
  PenTool,
  Bot,
  Users,
  RotateCcw,
  Play,
  CheckCircle2
} from "lucide-react";
import stadiumImg from "@/assets/us-bank-stadium.jpg";

type Stage = "volunteering" | "answering" | "ai-compare";

const POLL_SLIDE_ID = "S3a2-elephants";

// Fixed question for the live audience estimation round
const FIXED_QUESTION = "How many ELEPHANTS could fit inside U.S. Bank Stadium?";

type LiveProvider = { label: string; provider: "openai" | "anthropic" | "perplexity" | "gemini" | "gemini-pro" };

const LIVE_PROVIDERS: LiveProvider[] = [
  { label: "ChatGPT (GPT-4o-mini)", provider: "openai" },
  { label: "Claude 3.5 Haiku", provider: "anthropic" },
  { label: "Perplexity Sonar", provider: "perplexity" },
  { label: "Gemini 2.5 Flash", provider: "gemini" },
  { label: "Gemini 2.5 Pro", provider: "gemini-pro" },
  { label: "ChatGPT (retry)", provider: "openai" },
  { label: "Claude (retry)", provider: "anthropic" },
  { label: "Perplexity (retry)", provider: "perplexity" },
  { label: "Gemini Flash (retry)", provider: "gemini" },
];

const DEMO_WRITERS = ["Alex", "Jordan", "Sam", "Taylor", "Casey"];
const DEMO_ANSWER_WORDS = ["I", "think", "around", "fifty", "pennies", "could", "fit", "into", "a", "teapot."];

interface Volunteer {
  id: string;
  participant_id: string;
  participant_name: string;
  position: number;
}

interface AnswerWord {
  id: string;
  word: string;
  added_by: string;
  position: number;
}

export const ElephantQuestionScreen = () => {
  const { session, isPresenter, participantId, isSoloMode } = useSession();
  const { toast } = useToast();

  // Stage state - this round starts directly with live audience guesses.
  const [stage, setStage] = useState<Stage>("ai-compare");
  
  // Treat solo mode as presenter for controls
  const canControl = isPresenter || isSoloMode;
  
  // Volunteer/answer state - reuses volunteers from P5 (One Word Story)
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [words, setWords] = useState<AnswerWord[]>([]);
  const [currentWriterPosition, setCurrentWriterPosition] = useState(1);
  const [maxVolunteers, setMaxVolunteers] = useState(5);
  
  // Input state
  const [newWord, setNewWord] = useState("");
  const [reconnectName, setReconnectName] = useState("");
  const [showReconnect, setShowReconnect] = useState(false);
  
  // AI comparison state — start with 3 preloaded answers so the slide is never empty.
  // Live AI calls will append more on top of these.
  const [aiAnswers, setAiAnswers] = useState<{model: string, answer: string}[]>([
    {
      model: "ChatGPT",
      answer: "U.S. Bank Stadium has roughly 1.75 million cubic meters of interior volume. An adult African elephant occupies about 10 cubic meters. Packed in volumetrically, that's roughly 175,000 elephants — but on the playing-surface footprint of about 7,500 sq m, you could fit closer to 1,500 standing elephants.",
    },
    {
      model: "Claude",
      answer: "On just the field level (~80,000 sq ft), assuming each adult elephant needs about 50 sq ft of standing space, you could fit roughly 1,600 elephants on the field. Including the seating bowl floors, maybe 3,000.",
    },
    {
      model: "Gemini",
      answer: "Total enclosed volume is around 60 million cubic feet. An elephant is roughly 350 cubic feet. Stacked floor-to-ceiling that's ~170,000 elephants — practically, on usable floor space, around 2,000.",
    },
  ]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [streamingModelName, setStreamingModelName] = useState<string | null>(null);

  // Audience answer collection — persisted via polls/responses (real audience phones)
  const { currentPoll, responses, myResponse, createPoll, openPoll, getPollForSlide, submitResponse } = usePoll();
  const [newAudienceName, setNewAudienceName] = useState("");
  const [newAudienceNumber, setNewAudienceNumber] = useState("");
  const [myGuess, setMyGuess] = useState("");

  // Load existing poll for this slide on mount
  useEffect(() => {
    getPollForSlide(POLL_SLIDE_ID);
  }, [getPollForSlide]);

  // Auto-create / reopen poll when entering ai-compare stage (presenter only)
  useEffect(() => {
    if (stage !== "ai-compare") return;
    if (!canControl) return;
    if (!currentPoll || currentPoll.slide_id !== POLL_SLIDE_ID) {
      createPoll(POLL_SLIDE_ID, "text", { question: FIXED_QUESTION });
    } else if (!currentPoll.is_open) {
      openPoll(currentPoll.id);
    }
  }, [stage, canControl, currentPoll, createPoll, openPoll]);

  // Derive audience answers from real poll responses
  const audienceAnswers = useMemo(() => {
    return responses
      .map((r) => {
        const v = r.value as { number?: number; name?: string } | null;
        const num = typeof v?.number === "number" ? v.number : null;
        if (num === null || isNaN(num)) return null;
        return { name: v?.name?.trim() || "Audience", number: num };
      })
      .filter((x): x is { name: string; number: number } => x !== null);
  }, [responses]);

  // Real models that actually answer — fanned out in parallel, each appended
  // as it returns. Each label maps to a real backend (OpenAI, Anthropic,
  // Perplexity, Lovable AI / Gemini).
  const hasStartedStreamingRef = useRef(false);

  useEffect(() => {
    if (stage !== "ai-compare") return;
    if (!canControl) return;
    if (hasStartedStreamingRef.current) return;
    hasStartedStreamingRef.current = true;
    let cancelled = false;

    // Reset preloaded answers — we want REAL model answers on this slide,
    // not the hand-written demo seeds.
    setAiAnswers([]);
    setIsLoadingAI(true);
    setStreamingModelName("Asking real AIs…");

    let pending = LIVE_PROVIDERS.length;

    LIVE_PROVIDERS.forEach(({ label, provider }) => {
      supabase.functions
        .invoke("multi-ai-estimate", {
          body: { prompt: FIXED_QUESTION, provider },
        })
        .then(({ data, error }) => {
          if (cancelled) return;
          if (!error && data?.success && data?.answer) {
            setAiAnswers((prev) => [...prev, { model: label, answer: data.answer }]);
          } else {
            console.warn(`[${label}] failed`, error || data?.error);
          }
        })
        .catch((e) => console.warn(`[${label}] threw`, e))
        .finally(() => {
          if (cancelled) return;
          pending -= 1;
          if (pending <= 0) {
            setStreamingModelName(null);
            setIsLoadingAI(false);
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [canControl, stage]);

  // Demo preview state (runs during volunteering)
  const [demoWords, setDemoWords] = useState<string[]>([]);
  const [demoWriterIndex, setDemoWriterIndex] = useState(0);
  
  // Run demo animation during volunteering stage
  useEffect(() => {
    if (stage !== 'volunteering') {
      setDemoWords([]);
      setDemoWriterIndex(0);
      return;
    }
    
    if (demoWords.length >= DEMO_ANSWER_WORDS.length) {
      // Reset demo after a pause
      const resetTimer = setTimeout(() => {
        setDemoWords([]);
        setDemoWriterIndex(0);
      }, 2000);
      return () => clearTimeout(resetTimer);
    }
    
    const timer = setTimeout(() => {
      setDemoWords(prev => [...prev, DEMO_ANSWER_WORDS[prev.length]]);
      setDemoWriterIndex(prev => (prev + 1) % DEMO_WRITERS.length);
    }, 700);
    
    return () => clearTimeout(timer);
  }, [stage, demoWords.length]);

  // Check if current user is a volunteer and if it's their turn
  const myVolunteer = volunteers.find(v => v.participant_id === participantId);
  const isMyTurn = myVolunteer && myVolunteer.position === currentWriterPosition;
  const currentWriter = volunteers.find(v => v.position === currentWriterPosition);

  useEffect(() => {
    if (!session?.id) return;

    const loadData = async () => {
      const { data: volunteersData } = await supabase
        .from('story_volunteers')
        .select('*')
        .eq('session_id', session.id)
        .order('position', { ascending: true });
      if (volunteersData) setVolunteers(volunteersData);

      const { data: wordsData } = await supabase
        .from('story_words')
        .select('*')
        .eq('session_id', session.id)
        .order('position', { ascending: true });
      if (wordsData) setWords(wordsData);

      const { data: gameState } = await supabase
        .from('story_game_state')
        .select('current_writer_position, max_volunteers, stage')
        .eq('session_id', session.id)
        .single();
      if (gameState) {
        setCurrentWriterPosition(gameState.current_writer_position || 1);
        setMaxVolunteers(gameState.max_volunteers || 3);
        // Map stage from DB if exists
        if (gameState.stage === 'answering' || gameState.stage === 'ai-compare') {
          setStage(gameState.stage as Stage);
        }
      }
    };

    loadData();
  }, [session?.id]);

  // Real-time subscriptions
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`elephant:${session.id}`)
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
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'story_game_state',
        filter: `session_id=eq.${session.id}`
      }, (payload) => {
        if (payload.new) {
          const newState = payload.new as {
            current_writer_position?: number | null;
            max_volunteers?: number | null;
            stage?: string | null;
          };
          setCurrentWriterPosition(newState.current_writer_position || 1);
          setMaxVolunteers(newState.max_volunteers || 3);
          if (newState.stage === 'answering' || newState.stage === 'ai-compare') {
            setStage(newState.stage as Stage);
          }
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [session?.id]);

  // Add word action
  const addWord = async () => {
    if (!newWord.trim() || !session?.id || !isMyTurn) return;
    
    const nextPosition = words.length + 1;
    await supabase.from('story_words').insert({
      session_id: session.id,
      word: newWord.trim(),
      added_by: participantId,
      position: nextPosition
    });
    
    const nextWriter = (currentWriterPosition % volunteers.length) + 1;
    await supabase
      .from('story_game_state')
      .update({ current_writer_position: nextWriter })
      .eq('session_id', session.id);
    
    setNewWord("");
  };

  // Add word (presenter can always add for demo purposes)
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
        const nextWriter = (currentWriterPosition % volunteers.length) + 1;
        await supabase
          .from('story_game_state')
          .update({ current_writer_position: nextWriter })
          .eq('session_id', session.id);
      }
    } else {
      // Local mode - add to local state
      setWords(prev => [...prev, { 
        id: `local-${Date.now()}`, 
        word: newWord.trim(), 
        added_by: 'presenter', 
        position: prev.length + 1 
      }]);
    }
    
    setNewWord("");
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
      
      toast({
        title: "Reconnected!",
        description: `You're Writer #${matchingVolunteer.position} again.`,
      });
      setReconnectName("");
      setShowReconnect(false);
    } else {
      toast({
        title: "Name not found",
        description: "No writer with that name. Check the spelling!",
        variant: "destructive",
      });
    }
  };

  // Presenter: Start answering (reveals the question)
  // Can start with or without volunteers (solo mode)
  const startAnswering = async (soloMode = false) => {
    if (!canControl) return;
    if (!soloMode && volunteers.length < 2) return;
    
    if (session?.id) {
      await supabase
        .from('story_game_state')
        .upsert({
          session_id: session.id,
          stage: 'answering',
          current_writer_position: 1,
          max_volunteers: soloMode ? 1 : maxVolunteers,
          topic: FIXED_QUESTION
        }, { onConflict: 'session_id' });
    }
    
    setCurrentWriterPosition(1);
    setStage("answering");
  };

  // Presenter: Show AI comparison
  const showAIComparison = async () => {
    setStage("ai-compare");
    setIsLoadingAI(true);
    
    try {
      const models = ["ChatGPT", "Claude", "Gemini"];
      const responses: {model: string, answer: string}[] = [];
      
      for (const model of models) {
        const { data, error } = await supabase.functions.invoke('test-prompt', {
          body: { 
            prompt: FIXED_QUESTION,
            context: `You are ${model}. Answer this estimation question. State your assumptions clearly, then give a specific number. Be confident. Keep it to 2-3 sentences.`
          }
        });
        
        if (!error && data?.response) {
          responses.push({ model, answer: data.response });
        }
      }
      
      setAiAnswers(responses);
    } catch (error) {
      console.error('Error getting AI responses:', error);
      toast({
        title: "Error",
        description: "Failed to get AI responses",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Reset game
  const resetGame = async () => {
    if (!canControl) return;
    
    if (session?.id) {
      await supabase.from('story_words').delete().eq('session_id', session.id);
      await supabase.from('story_volunteers').delete().eq('session_id', session.id);
      
      await supabase
        .from('story_game_state')
        .update({
          stage: 'ai-compare',
          current_writer_position: 1,
          topic: null
        })
        .eq('session_id', session.id);
    }
    
    setVolunteers([]);
    setWords([]);
    setAiAnswers([]);
    setCurrentWriterPosition(1);
    setStage("ai-compare");
    hasStartedStreamingRef.current = false;
  };

  const humanAnswer = words.map(w => w.word).join(" ");

  // Stage indicators
  const stages = [
    { key: 'volunteering', label: 'Ready', icon: Users },
    { key: 'answering', label: 'Answer', icon: PenTool },
    { key: 'ai-compare', label: 'AI Compare', icon: Bot },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* Header — hidden in ai-compare so the Range of Answers is the top of the slide */}
        {stage !== "ai-compare" && (
          <>
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/30 rounded-full mb-3">
                <MessageSquare className="h-3.5 w-3.5 text-accent" />
                <span className="text-accent font-semibold tracking-wide text-xs uppercase">
                  {stage === "volunteering" ? "Round 2 · Cast Call" : "Round 2 · One-Word Answer"}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {stage === "volunteering" && "Same Stage. New Cast?"}
                {stage === "answering" && "Build the Answer — Together"}
              </h1>
              {stage === "volunteering" && (
                <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl mx-auto">
                  Round 1's writers can stay on, or we can swap in fresh volunteers. Either way — the question stays hidden until we have our team.
                </p>
              )}
            </div>

            {/* Stage Progress */}
            <div className="flex justify-center gap-2 md:gap-4 mb-6">
              {stages.map((s, i) => {
                const Icon = s.icon;
                const isActive = s.key === stage;
                const isPast = stages.findIndex(st => st.key === stage) > i;
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
          </>
        )}

        {/* STAGE: Volunteering (Question NOT yet revealed) */}
        {stage === "volunteering" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Demo Preview */}
            <div className="bg-gradient-to-br from-accent/10 to-secondary/10 border-2 border-accent/30 rounded-2xl p-5 space-y-3">
              <h3 className="text-lg font-bold text-accent flex items-center gap-2">
                <Play className="h-5 w-5" />
                Same Game, New Question!
              </h3>
              
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-sm text-muted-foreground">This time you'll answer:</p>
                <p className="text-lg font-medium text-foreground mt-1">"How many [X] can fit in [Y]?"</p>
              </div>
              
              {/* Demo Answer Display */}
              <div className="bg-card/80 border border-border/50 rounded-xl p-4 min-h-[80px]">
                <p className="text-foreground text-xl md:text-2xl leading-relaxed">
                  {demoWords.length === 0 ? (
                    <span className="text-muted-foreground italic">Answer starts here...</span>
                  ) : (
                    <>
                      {demoWords.join(" ")}
                      <span className="animate-pulse text-primary">▌</span>
                    </>
                  )}
                </p>
              </div>
              
              {/* Demo Writer Indicator */}
              <div className="flex justify-center">
                <div className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold animate-pulse">
                   🎤 {DEMO_WRITERS[demoWriterIndex]}'s turn!
                </div>
              </div>
              
              {/* Demo Writer Roster */}
              <div className="flex justify-center gap-1.5 flex-wrap">
                {DEMO_WRITERS.map((name, i) => (
                  <div
                    key={name}
                    className={`px-2 py-0.5 rounded-full text-xs transition-all ${
                      i === demoWriterIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    {i + 1}. {name}
                  </div>
                ))}
              </div>
              
              <p className="text-center text-xs text-muted-foreground">
                Each person adds one word, then it's the next person's turn!
              </p>
            </div>

            {/* Right: Ready Team */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-secondary/20 to-primary/10 border-2 border-secondary/40 rounded-2xl p-6 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  🎯 Same Team, New Challenge!
                </h2>
                <p className="text-muted-foreground">
                  {isSoloMode && volunteers.length === 0
                    ? "Same rules — one word at a time!"
                    : `Our ${volunteers.length} writers are ready for round two!`}
                </p>
              </div>

              {/* Presenter/Solo View */}
              {canControl ? (
                <div className="bg-card/50 border border-border/50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Users className="h-6 w-6 text-secondary" />
                    {isSoloMode && volunteers.length === 0 ? "Ready to Go" : `Your Writers (${volunteers.length})`}
                  </h3>
                  
                  {/* Volunteer slots - show actual volunteers from P5 */}
                  {volunteers.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {volunteers.map((vol) => (
                        <div
                          key={vol.id}
                          className="p-3 rounded-xl border-2 text-center border-primary bg-primary/10"
                        >
                          <div className="text-xl font-bold mb-1">{vol.position}</div>
                          <div className="text-sm truncate text-primary font-medium">
                            {vol.participant_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : isSoloMode ? (
                    <div className="bg-muted/30 rounded-xl p-4 mb-6 text-center">
                      <p className="text-muted-foreground text-sm">Ask for 3 volunteers, then start!</p>
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-xl p-4 mb-6 text-center">
                      <p className="text-muted-foreground text-sm">Waiting for volunteers to join...</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-3">
                    {volunteers.length >= 2 && (
                      <Button 
                        onClick={() => startAnswering(false)} 
                        size="lg"
                        className="gap-2 w-full"
                      >
                        Reveal the Question!
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      onClick={() => startAnswering(true)} 
                      variant={volunteers.length >= 2 ? "outline" : "default"}
                      size="lg"
                      className="gap-2 w-full"
                    >
                      <PenTool className="h-4 w-4" />
                      Solo Mode (I'll type the words)
                    </Button>
                  </div>
                </div>
              ) : (
                /* Participant View */
                <div className="bg-card/50 border border-border/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-secondary" />
                    Your Team ({volunteers.length})
                  </h3>
                  
                  {/* Show actual volunteers from P5 */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    {volunteers.map((vol) => (
                      <div
                        key={vol.id}
                        className={`p-3 rounded-xl border-2 text-center ${
                          vol.participant_id === participantId
                            ? 'border-secondary bg-secondary/20'
                            : 'border-primary bg-primary/10'
                        }`}
                      >
                        <div className="text-xl font-bold mb-1">{vol.position}</div>
                        <div className={`text-sm truncate ${vol.participant_id === participantId ? 'text-secondary font-medium' : 'text-primary font-medium'}`}>
                          {vol.participant_name}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {myVolunteer ? (
                    <p className="text-center text-secondary font-semibold text-lg">
                      You're Writer #{myVolunteer.position}! Get ready! 🎯
                    </p>
                  ) : volunteers.length > 0 ? (
                    <div className="space-y-3">
                      {!showReconnect ? (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-2">
                            Were you a writer before? Reconnect to your slot:
                          </p>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowReconnect(true)}
                            className="gap-2"
                          >
                            <Hand className="h-4 w-4" />
                            Reconnect as Writer
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-center">
                          <Input
                            value={reconnectName}
                            onChange={(e) => setReconnectName(e.target.value)}
                            placeholder="Enter your name"
                            className="max-w-[180px]"
                            onKeyDown={(e) => e.key === 'Enter' && reconnectAsVolunteer()}
                          />
                          <Button onClick={reconnectAsVolunteer} disabled={!reconnectName.trim()}>
                            Reconnect
                          </Button>
                          <Button variant="ghost" onClick={() => setShowReconnect(false)}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      No writers yet. Complete the One-Word Story first!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STAGE: Answering (Question NOW revealed) */}
        {stage === "answering" && (
          <div className="space-y-6">
            {/* The Question - Big Reveal with Stadium Image */}
            <div className="bg-gradient-to-br from-accent/20 to-primary/10 border-2 border-accent/40 rounded-2xl p-6 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="text-center md:text-left">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">One-Word Answer</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    {FIXED_QUESTION}
                  </h2>
                </div>
                <div className="rounded-xl overflow-hidden border border-accent/30">
                  <img src={stadiumImg} alt="U.S. Bank Stadium" className="w-full h-auto" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: The Human Answer */}
              <div className="bg-card/50 border-2 border-secondary/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-secondary" />
                  The Human Answer
                </h3>
                <div className="min-h-[120px] bg-muted/30 rounded-xl p-4 text-xl md:text-2xl font-medium text-foreground">
                  {humanAnswer || <span className="text-muted-foreground italic">Waiting for the first word...</span>}
                  <span className="animate-pulse text-primary">|</span>
                </div>
              </div>

              {/* Right: Current Writer */}
              <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6">
                {currentWriter && (
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Now Writing</p>
                    <p className="text-2xl font-bold text-primary">
                      #{currentWriter.position}: {currentWriter.participant_name}
                    </p>
                  </div>
                )}
                
                {(isMyTurn || canControl) ? (
                  <div className="space-y-3">
                    <p className="text-center text-sm text-muted-foreground">Add ONE word to the answer:</p>
                    <div className="flex gap-3 max-w-md mx-auto">
                      <Input
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value.split(" ")[0])}
                        onKeyDown={(e) => e.key === 'Enter' && addWordAsPresenter()}
                        placeholder="Your word..."
                        className="flex-1 text-lg text-center"
                        
                      />
                      <Button onClick={addWordAsPresenter} disabled={!newWord.trim()} size="lg">Add</Button>
                    </div>
                  </div>
                ) : myVolunteer ? (
                  <p className="text-center text-muted-foreground">Wait for your turn... (You're #{myVolunteer.position})</p>
                ) : (
                  <p className="text-center text-muted-foreground">Watch the answer being built word by word!</p>
                )}

                {/* Writer Roster */}
                <div className="mt-6 pt-4 border-t border-border/30">
                  <div className="flex justify-center gap-2 flex-wrap">
                    {volunteers.map((v) => (
                      <div
                        key={v.id}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          v.position === currentWriterPosition
                            ? 'bg-primary text-primary-foreground animate-pulse'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        {v.position}. {v.participant_name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Presenter/Solo Controls */}
            {canControl && (
              <div className="flex justify-center gap-3">
                <Button onClick={showAIComparison} size="lg" className="gap-2" disabled={words.length < 3}>
                  <Bot className="h-5 w-5" />
                  Compare with AI
                </Button>
                <Button onClick={resetGame} variant="outline" size="lg" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            )}
          </div>
        )}

        {/* STAGE: AI Comparison */}
        {stage === "ai-compare" && (
          <AiCompareStage
            aiAnswers={aiAnswers}
            isLoadingAI={isLoadingAI}
            streamingModelName={streamingModelName}
            audienceAnswers={audienceAnswers}
            addAudienceAnswerToPoll={async (num) => {
              if (!currentPoll) return;
              const manualId = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
              await supabase.from("responses").insert({
                poll_id: currentPoll.id,
                participant_id: manualId,
                value: { number: num, name: "Stage" },
              });
            }}
            newAudienceName={newAudienceName}
            setNewAudienceName={setNewAudienceName}
            newAudienceNumber={newAudienceNumber}
            setNewAudienceNumber={setNewAudienceNumber}
            myGuess={myGuess}
            setMyGuess={setMyGuess}
            hasSubmittedMyGuess={!!myResponse}
            submitMyGuess={async () => {
              const num = parseInt(myGuess.replace(/[,\s]/g, ""));
              if (isNaN(num) || num <= 0) return;
              await submitResponse({ number: num });
              setMyGuess("");
            }}
            isPollOpen={!!currentPoll?.is_open}
            canControl={canControl}
            isSoloMode={isSoloMode}
            humanAnswer={humanAnswer}
            resetGame={resetGame}
            fixedQuestion={FIXED_QUESTION}
            stadiumImg={stadiumImg}
          />
        )}
      </div>
    </div>
  );
};

// ─── AI Compare Stage (extracted component) ─────────────────────────────────

// Helper: extract the answer number from AI answer text.
// AI answers usually walk through dimensions (e.g. "1,800,000 sq ft / 80 sq ft per car
// ≈ 22,500 cars"). The intermediate numbers can be huge and meaningless. We want the
// CONCLUSION — the number attached to "cars" or appearing at the end of the answer.
function extractNumber(text: string): number | null {
  if (!text) return null;
  // Match numbers, optionally with commas/decimals, optionally followed by k/m/million/thousand,
  // and capture a small trailing context window so we can score them.
  const numRe = /(\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?\s*(million|thousand|billion|m\b|k\b)?\s*([a-z\s-]{0,25})?/gi;
  // Units that disqualify a number from being "the answer" (it's a dimension, not a count of cars).
  const dimensionUnits = /(sq\.?\s*(ft|feet|m|meter|metre|yard)|square|cubic|acres?|feet|ft\b|meter|metre|yards?|miles?|seats?|spectators?|capacity|attendees?|people|fans|year|years|mph|km|kilometer)/i;
  const carsHint = /\b(elephants?|cars?|vehicles?|automobiles?)\b/i;

  type Cand = { value: number; index: number; score: number };
  const candidates: Cand[] = [];
  let m: RegExpExecArray | null;
  while ((m = numRe.exec(text)) !== null) {
    const raw = m[1].replace(/,/g, "");
    let value = parseFloat(raw);
    if (!isFinite(value)) continue;
    const mult = (m[2] || "").toLowerCase();
    if (mult.startsWith("k")) value *= 1_000;
    else if (mult.startsWith("m") && mult !== "m") value *= 1_000_000;
    else if (mult === "m") value *= 1; // ambiguous (could be meters) — leave alone
    else if (mult.startsWith("thousand")) value *= 1_000;
    else if (mult.startsWith("million")) value *= 1_000_000;
    else if (mult.startsWith("billion")) value *= 1_000_000_000;

    if (value < 100) continue; // too small to be a car-count answer

    const tail = (m[3] || "").toLowerCase();
    // Disqualify obvious dimensions
    if (dimensionUnits.test(tail)) continue;

    let score = 0;
    if (carsHint.test(tail)) score += 100; // strong: "22,500 cars"
    // Bonus for being near the end of the answer (conclusions live at the end)
    score += (m.index / Math.max(text.length, 1)) * 20;
    // Penalize absurdly large counts (≥ 500k cars in a stadium is almost certainly a dimension)
    if (value > 500_000) score -= 50;
    if (value > 5_000_000) score -= 200;

    candidates.push({ value, index: m.index, score });
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score || b.index - a.index);
  return candidates[0].value;
}

interface AiCompareStageProps {
  aiAnswers: {model: string, answer: string}[];
  isLoadingAI: boolean;
  streamingModelName: string | null;
  audienceAnswers: {name: string, number: number, note?: string}[];
  addAudienceAnswerToPoll: (num: number) => Promise<void> | void;
  newAudienceName: string;
  setNewAudienceName: React.Dispatch<React.SetStateAction<string>>;
  newAudienceNumber: string;
  setNewAudienceNumber: React.Dispatch<React.SetStateAction<string>>;
  myGuess: string;
  setMyGuess: React.Dispatch<React.SetStateAction<string>>;
  hasSubmittedMyGuess: boolean;
  submitMyGuess: () => Promise<void> | void;
  isPollOpen: boolean;
  canControl: boolean;
  isSoloMode: boolean;
  humanAnswer: string;
  resetGame: () => void;
  fixedQuestion: string;
  stadiumImg: string;
}

const AiCompareStage = ({
  aiAnswers, isLoadingAI, streamingModelName,
  audienceAnswers, addAudienceAnswerToPoll,
  newAudienceName, setNewAudienceName,
  newAudienceNumber, setNewAudienceNumber,
  myGuess, setMyGuess, hasSubmittedMyGuess, submitMyGuess, isPollOpen,
  canControl, isSoloMode, humanAnswer, resetGame,
  fixedQuestion, stadiumImg,
}: AiCompareStageProps) => {
  const { session } = useSession();

  const addAudienceAnswer = async () => {
    const num = parseInt(newAudienceNumber.replace(/,/g, ''));
    if (isNaN(num)) return;
    await addAudienceAnswerToPoll(num);
    setNewAudienceName("");
    setNewAudienceNumber("");
  };

  // Collect all numbers for comparison
  const allNumbers = useMemo(() => {
    const nums: {source: string, number: number}[] = [];
    aiAnswers.forEach(ai => {
      const n = extractNumber(ai.answer);
      if (n) nums.push({ source: ai.model, number: n });
    });
    audienceAnswers.forEach(a => {
      nums.push({ source: a.name, number: a.number });
    });
    return nums.sort((a, b) => a.number - b.number);
  }, [aiAnswers, audienceAnswers]);

  const minNum = allNumbers.length > 0 ? allNumbers[0].number : 0;
  const maxNum = allNumbers.length > 0 ? allNumbers[allNumbers.length - 1].number : 1;
  const range = maxNum - minNum || 1;

  // ─── Audience phone view: keep it dead simple ──────────────────────────
  // The big screen already shows the question, AI answers, and live range.
  // Phones get one job: enter a number and submit.
  if (!canControl && !isSoloMode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 animate-fade-in">
        <div className="w-full max-w-md mx-auto space-y-8 text-center">
          {hasSubmittedMyGuess ? (
            <>
              <div className="text-6xl">✅</div>
              <h2 className="text-3xl font-display font-bold text-foreground">
                Guess submitted.
              </h2>
              <p className="text-lg text-muted-foreground">
                Watch the main screen.
              </p>
            </>
          ) : isPollOpen ? (
            <>
              <p className="uppercase tracking-[0.3em] text-xs font-semibold text-secondary">
                Your turn
              </p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
                How many elephants?
              </h2>
              <div className="space-y-3">
                <Input
                  value={myGuess}
                  onChange={(e) => setMyGuess(e.target.value.replace(/[^\d,]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && submitMyGuess()}
                  placeholder="e.g. 2,500"
                  inputMode="numeric"
                  autoFocus
                  className="text-center text-3xl h-16 font-bold"
                />
                <Button
                  onClick={submitMyGuess}
                  disabled={!myGuess.trim()}
                  size="lg"
                  className="w-full h-14 text-lg font-bold"
                >
                  Submit my guess
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl">⏳</div>
              <p className="text-xl text-muted-foreground italic">
                Submissions opening soon…
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── Presenter projection view: dead simple ─────────────────────────────
  // Just the numbers landing on screen + one big input. AI keeps streaming
  // in the background and adds to the same number list as the presenter types.
  const allNumberValues = allNumbers.map((n) => n.number);

  const submitTypedNumber = async () => {
    const num = parseInt(newAudienceNumber.replace(/,/g, ""));
    if (!isNaN(num) && num > 0) {
      await addAudienceAnswerToPoll(num);
      setNewAudienceNumber("");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full px-8 py-6 gap-6">
      {/* TOP: Single big input for the presenter */}
      {canControl && (
        <div className="flex items-center gap-4 max-w-3xl mx-auto w-full">
          <Input
            value={newAudienceNumber}
            onChange={(e) =>
              setNewAudienceNumber(e.target.value.replace(/[^\d,]/g, ""))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") submitTypedNumber();
            }}
            placeholder="Type a number…"
            inputMode="numeric"
            autoFocus
            className="flex-1 text-center font-bold h-20"
            style={{ fontSize: "2.5rem" }}
          />
          <Button
            onClick={submitTypedNumber}
            disabled={!newAudienceNumber.trim()}
            className="h-20 px-10 font-bold"
            style={{ fontSize: "1.75rem" }}
          >
            Add
          </Button>
          <Button
            onClick={resetGame}
            variant="outline"
            className="h-20 px-6"
            title="Clear the board"
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* MIDDLE: Number-line scale showing spread between min and max */}
      {allNumberValues.length > 0 && (
        <div className="w-full max-w-[1600px] mx-auto px-12 pt-2">
          <div className="relative h-20">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-border rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-border rounded-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-border rounded-full" />
            {allNumbers.map((item, i) => {
              const pct = ((item.number - minNum) / range) * 100;
              const isAudience = audienceAnswers.some((a) => a.name === item.source);
              return (
                <div
                  key={`tick-${item.source}-${i}`}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 animate-fade-in"
                  style={{ left: `${pct}%` }}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      isAudience
                        ? "bg-secondary border-secondary"
                        : "bg-primary border-primary"
                    } shadow-lg`}
                  />
                </div>
              );
            })}
            <div className="absolute -bottom-2 left-0 text-lg font-bold text-muted-foreground">
              {minNum.toLocaleString()}
            </div>
            <div className="absolute -bottom-2 right-0 text-lg font-bold text-muted-foreground">
              {maxNum.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM: Numbers landing on the wall */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 gap-10">
        {allNumberValues.length === 0 ? (
          <p className="text-3xl text-muted-foreground italic">
            Waiting for the first number…
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 max-w-[1600px]">
            {allNumbers.map((item, i) => {
              const isAudience = audienceAnswers.some((a) => a.name === item.source);
              return (
                <span
                  key={`${item.source}-${i}`}
                  className={`font-display font-bold leading-none animate-fade-in ${
                    isAudience ? "text-secondary" : "text-primary"
                  }`}
                  style={{ fontSize: "clamp(3rem, 7cqw, 7rem)" }}
                >
                  {item.number.toLocaleString()}
                </span>
              );
            })}
            {isLoadingAI && (
              <span className="text-2xl text-muted-foreground italic flex items-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin" />
                {streamingModelName ? `${streamingModelName} is thinking…` : "AI thinking…"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
