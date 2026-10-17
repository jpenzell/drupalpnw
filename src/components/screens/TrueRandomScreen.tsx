import { useState, useEffect } from "react";
import { Dice5, Users, Send, Sparkles, Lock, Clock, Cpu, Shuffle, Info, X } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { usePoll } from "@/contexts/PollContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Persist true random numbers across navigation
let persistedRandomSources: Record<string, number[]> = {};

export const getTrueRandomNumbers = () => persistedRandomSources['crypto'] || [];

export const appendTrueRandomNumbers = (count: number) => {
  const array = new Uint32Array(count);
  crypto.getRandomValues(array);
  const newNums = Array.from(array).map(n => (n % 100) + 1);
  persistedRandomSources['crypto'] = [...(persistedRandomSources['crypto'] || []), ...newNums];
  return persistedRandomSources['crypto'];
};

export const resetTrueRandom = () => {
  persistedRandomSources = {};
};

// Different random number generation methods with detailed explanations
const randomSources = [
  {
    id: 'crypto',
    name: 'Cryptographic',
    icon: Lock,
    color: 'green',
    description: 'Hardware entropy (mouse, keyboard, CPU noise)',
    explanation: {
      title: 'Cryptographic Random (crypto.getRandomValues)',
      howItWorks: 'Uses your computer\'s hardware to collect "entropy" - unpredictable physical events like CPU temperature fluctuations, mouse movements, keyboard timing, and electrical noise.',
      whyRandom: 'Physical processes are inherently unpredictable. No algorithm can predict CPU thermal noise or the exact timing of your keystrokes.',
      codeExample: `const array = new Uint32Array(1);
crypto.getRandomValues(array);
return (array[0] % 100) + 1;`,
      funFact: 'Intel CPUs have a dedicated "RDRAND" instruction that harvests quantum noise from thermal fluctuations in silicon.'
    },
    generate: (count: number): number[] => {
      const array = new Uint32Array(count);
      crypto.getRandomValues(array);
      return Array.from(array).map(n => (n % 100) + 1);
    }
  },
  {
    id: 'math',
    name: 'Math.random()',
    icon: Shuffle,
    color: 'blue',
    description: 'Pseudo-random algorithm (XorShift128+)',
    explanation: {
      title: 'Math.random() - XorShift128+',
      howItWorks: 'Uses a 128-bit internal state and XOR operations with bit shifts. Each call transforms the state deterministically, producing a sequence that appears random but is fully predictable if you know the seed.',
      whyRandom: 'The bit manipulations create chaos - small changes cascade into wildly different outputs. But it\'s "pseudo" random: same seed = same sequence.',
      codeExample: `// Simplified concept (actual impl is in C++)
state ^= state << 23;
state ^= state >> 17;
state ^= state << 5;
return state / MAX_INT;`,
      funFact: 'V8 (Chrome\'s JS engine) switched to XorShift128+ in 2015 because the old algorithm failed statistical tests for randomness.'
    },
    generate: (count: number): number[] => {
      return Array.from({ length: count }, () => Math.floor(Math.random() * 100) + 1);
    }
  },
  {
    id: 'lcg',
    name: 'LCG Algorithm',
    icon: Clock,
    color: 'amber',
    description: 'Linear Congruential Generator (classic PRNG)',
    explanation: {
      title: 'Linear Congruential Generator (LCG)',
      howItWorks: 'Simple formula: X(n+1) = (a × X(n) + c) mod m. Multiplies the previous number, adds a constant, and wraps around. Used since the 1950s!',
      whyRandom: 'The multiplication and modulo create apparent disorder. But LCGs have patterns - consecutive numbers can be correlated, and the sequence eventually repeats.',
      codeExample: `// Classic "Numerical Recipes" parameters
const a = 1664525;
const c = 1013904223;
const m = 2^32;
seed = (a * seed + c) % m;`,
      funFact: 'Early versions of RANDU (IBM\'s LCG from 1968) were so flawed that 3D plots of consecutive triplets showed clear hyperplanes instead of random scatter.'
    },
    generate: (count: number): number[] => {
      const a = 1664525;
      const c = 1013904223;
      const m = Math.pow(2, 32);
      let seed = Date.now() % m;
      const results: number[] = [];
      for (let i = 0; i < count; i++) {
        seed = (a * seed + c) % m;
        results.push(Math.floor((seed / m) * 100) + 1);
      }
      return results;
    }
  },
  {
    id: 'xorshift',
    name: 'XorShift',
    icon: Cpu,
    color: 'purple',
    description: 'Bit-manipulation PRNG (fast, good distribution)',
    explanation: {
      title: 'XorShift Algorithm',
      howItWorks: 'Uses only XOR and bit-shift operations - no multiplication needed. Invented by George Marsaglia in 2003. Extremely fast because modern CPUs execute XOR and shifts in a single clock cycle.',
      whyRandom: 'Bit shifts move information across the number, XOR mixes bits together. After 3 operations, every output bit depends on multiple input bits, creating avalanche effect.',
      codeExample: `// XorShift32 by George Marsaglia
state ^= state << 13;
state ^= state >> 17;
state ^= state << 5;
return state;`,
      funFact: 'XorShift passes most statistical tests for randomness despite being incredibly simple. It\'s the "good enough" choice for games and simulations.'
    },
    generate: (count: number): number[] => {
      let state = (Date.now() ^ (performance.now() * 1000)) >>> 0 || 1;
      const results: number[] = [];
      for (let i = 0; i < count; i++) {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        state = state >>> 0;
        results.push((state % 100) + 1);
      }
      return results;
    }
  }
];

const colorClasses: Record<string, { bg: string, border: string, text: string, dot: string }> = {
  green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-500', dot: 'bg-green-500' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500', dot: 'bg-blue-500' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500', dot: 'bg-amber-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-500', dot: 'bg-purple-500' },
};

export const TrueRandomScreen = () => {
  const { isPresenter, isSoloMode, participantId } = useSession();
  const { currentPoll, responses, myResponse, createPoll, openPoll, closePoll, getPollForSlide } = usePoll();

  // In solo mode, treat as presenter for UI purposes
  const canControl = isPresenter || isSoloMode;

  const [randomData, setRandomData] = useState<Record<string, number[]>>(persistedRandomSources);
  const [myNumber, setMyNumber] = useState("");
  const [selectedSource, setSelectedSource] = useState<typeof randomSources[0] | null>(null);
  const [presenterNumber, setPresenterNumber] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  
  // Initialize poll
  useEffect(() => {
    getPollForSlide("true-random-human");
  }, [getPollForSlide]);

  // Generate initial random sources on mount
  useEffect(() => {
    if (Object.keys(persistedRandomSources).length === 0) {
      const newData: Record<string, number[]> = {};
      randomSources.forEach(source => {
        newData[source.id] = source.generate(20);
      });
      persistedRandomSources = newData;
      setRandomData(newData);
      setConsoleLogs(prev => [...prev.slice(-8), `> Initialized ${randomSources.length} random sources with 20 numbers each`]);
    }
  }, []);

  // Continuously add new random numbers
  useEffect(() => {
    const interval = setInterval(() => {
      const sourceIndex = Math.floor(Math.random() * randomSources.length);
      const source = randomSources[sourceIndex];
      const newNum = source.generate(1)[0];
      
      setRandomData(prev => {
        const updated = { ...prev };
        // Keep last 20 numbers, add new one
        const current = updated[source.id] || [];
        updated[source.id] = [...current.slice(-19), newNum];
        persistedRandomSources = updated;
        return updated;
      });
      
      // Add to console log
      const now = new Date();
      const timestamp = `${now.toLocaleTimeString('en-US', { hour12: false })}:${String(now.getMilliseconds()).padStart(3, '0')}`;
      setConsoleLogs(prev => [...prev.slice(-5), `[${timestamp}] ${source.name}: ${newNum}`]);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // Stats calculator
  const calculateStats = (nums: number[]) => {
    if (nums.length === 0) return { mean: null, mode: null, modeFreq: null, range: null };
    const sorted = [...nums].sort((a, b) => a - b);
    const mean = Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
    const range = sorted[sorted.length - 1] - sorted[0];
    
    const freq: Record<number, number> = {};
    nums.forEach(n => freq[n] = (freq[n] || 0) + 1);
    const maxFreq = Math.max(...Object.values(freq));
    const mode = maxFreq > 1 ? parseInt(Object.keys(freq).find(k => freq[parseInt(k)] === maxFreq) || "0") : null;
    
    return { mean, mode, modeFreq: maxFreq > 1 ? maxFreq : null, range };
  };
  
  // Human responses
  const humanNumbers = responses
    .map(r => (r.value as any)?.number)
    .filter((n): n is number => typeof n === "number" && n >= 1 && n <= 100);
  
  const humanStats = calculateStats(humanNumbers);
  
  const isPollOpen = currentPoll?.is_open;
  const hasSubmitted = !!myResponse;

  const getFrequencyStyle = (freq: number) => {
    if (freq === 1) return "";
    if (freq === 2) return "ring-2 ring-yellow-400/60";
    if (freq === 3) return "ring-2 ring-orange-500/80";
    return "ring-3 ring-red-500";
  };

  const humanFrequencyMap: Record<number, number> = {};
  humanNumbers.forEach(n => humanFrequencyMap[n] = (humanFrequencyMap[n] || 0) + 1);

  // Presenter controls
  const startHumanPoll = async () => {
    if (!currentPoll) {
      await createPoll("true-random-human", "text", {});
    } else {
      await openPoll(currentPoll.id);
    }
  };

  const stopHumanPoll = async () => {
    if (currentPoll) {
      await closePoll(currentPoll.id);
    }
  };

  // Presenter manual number submission (for adding from chat)
  const handlePresenterAdd = async () => {
    const num = parseInt(presenterNumber);
    if (isNaN(num) || num < 1 || num > 100 || !currentPoll) return;
    
    // Generate a unique participant ID for manual entries
    const manualId = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    await supabase.from("responses").insert({
      poll_id: currentPoll.id,
      participant_id: manualId,
      value: { number: num }
    });
    
    setPresenterNumber("");
  };

  // Participant submit
  const handleSubmit = async () => {
    const num = parseInt(myNumber);
    if (isNaN(num) || num < 1 || num > 100 || !currentPoll?.is_open) return;
    
    await supabase.from("responses").upsert({
      poll_id: currentPoll.id,
      participant_id: participantId,
      value: { number: num }
    }, { onConflict: "poll_id,participant_id" });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-in px-4 md:px-8">
      <div className="max-w-7xl w-full space-y-3">
        {/* Header - Compact */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            <Dice5 className="h-8 w-8 text-green-500" />
            What Does "Random" Look Like?
          </h1>
          <p className="text-muted-foreground text-base mt-1">
            4 PRNGs generating numbers 1-100 in real-time
          </p>
        </div>

        {/* Random Sources Grid - 2x2 optimized for presentation */}
        <div className="grid grid-cols-2 gap-4">
          {randomSources.map(source => {
            const colors = colorClasses[source.color];
            const Icon = source.icon;
            const numbers = randomData[source.id] || [];
            const stats = calculateStats(numbers);
            
            const frequencyMap: Record<number, number> = {};
            numbers.forEach(n => frequencyMap[n] = (frequencyMap[n] || 0) + 1);
            
            return (
              <div key={source.id} className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4`}>
                {/* Source Header - Clickable */}
                <button 
                  onClick={() => setSelectedSource(source)}
                  className="flex items-center gap-2 mb-3 w-full group hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <Icon className={`h-5 w-5 ${colors.text}`} />
                  <span className={`font-bold text-lg ${colors.text} group-hover:underline`}>{source.name}</span>
                  <Info className={`h-4 w-4 ${colors.text} opacity-50 group-hover:opacity-100`} />
                  <span className={`text-sm ${colors.text} bg-black/20 px-2 py-0.5 rounded ml-auto`}>n={numbers.length}</span>
                </button>
                
                {/* Mini Scatterplot - Larger */}
                <div className="relative h-14 bg-muted/30 rounded-lg overflow-visible mb-3">
                  <div className="absolute inset-x-2 top-1/2 h-px bg-border/40" />
                  {/* Scale markers */}
                  {[1, 50, 100].map(n => (
                    <span key={n} className="absolute bottom-0 text-[10px] text-muted-foreground -translate-x-1/2" style={{ left: `${(n - 1) * 0.96 + 2}%` }}>{n}</span>
                  ))}
                  {numbers.map((num, i) => (
                    <div
                      key={`${source.id}-${i}`}
                      className={`absolute w-2.5 h-2.5 rounded-full ${colors.dot} border border-white/50 shadow-sm transform -translate-x-1/2 -translate-y-1/2 ${getFrequencyStyle(frequencyMap[num])}`}
                      style={{ 
                        left: `${(num - 1) * 0.96 + 2}%`, 
                        top: `${30 + (i % 3) * 12}%`,
                      }}
                    />
                  ))}
                </div>
                
                {/* Stats Row */}
                <div className="flex gap-2 text-sm">
                  <div className={`flex-1 ${colors.bg} rounded px-2 py-1 text-center`}>
                    <span className="text-muted-foreground">Avg</span>
                    <span className={`font-bold ml-1 ${colors.text}`}>{stats.mean}</span>
                  </div>
                  <div className={`flex-1 ${colors.bg} rounded px-2 py-1 text-center`}>
                    <span className="text-muted-foreground">Mode</span>
                    <span className={`font-bold ml-1 ${colors.text}`}>
                      {stats.mode !== null ? `${stats.mode}` : "—"}
                    </span>
                  </div>
                  <div className={`flex-1 ${colors.bg} rounded px-2 py-1 text-center`}>
                    <span className="text-muted-foreground">Range</span>
                    <span className={`font-bold ml-1 ${colors.text}`}>{stats.range}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Row: Console + Key Insight */}
        <div className="grid grid-cols-3 gap-4">
          {/* Live Console - Larger */}
          <div className="col-span-2 bg-black/90 border-2 border-green-500/50 rounded-xl p-4 font-mono">
            <div className="flex items-center gap-2 mb-2 text-green-500">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold">LIVE — Real-time generation</span>
            </div>
            <div className="space-y-1 text-green-400/90 text-sm">
              {consoleLogs.map((log, i) => (
                <div key={i} className={`transition-opacity ${i === consoleLogs.length - 1 ? 'opacity-100' : 'opacity-50'}`}>
                  {log}
                </div>
              ))}
              {consoleLogs.length === 0 && <div className="text-green-500/50">Waiting for generation...</div>}
            </div>
          </div>
          
          {/* Key Insight */}
          <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-4 flex flex-col justify-center">
            <p className="text-lg font-bold text-primary mb-2">Key Point</p>
            <p className="text-foreground">
              True random = <span className="text-green-500 font-bold">uniform distribution</span>
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              All 100 numbers equally likely. No patterns. No "favorites."
            </p>
          </div>
        </div>
        
        {/* Participant-only sections - hidden in solo mode */}
        {!canControl && (
          <>
            {isPollOpen && !hasSubmitted && (
              <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-3 space-y-2">
                <p className="text-sm font-medium text-center">
                  Pick a "random" number between 1-100:
                </p>
                <div className="flex gap-2 justify-center">
                  <Input
                    type="number"
                    value={myNumber}
                    onChange={(e) => setMyNumber(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Your number"
                    className="w-28 text-center font-bold"
                    min={1}
                    max={100}
                  />
                  <Button onClick={handleSubmit} disabled={!myNumber} size="sm">
                    <Send className="h-4 w-4 mr-1" />
                    Submit
                  </Button>
                </div>
              </div>
            )}

            {hasSubmitted && (
              <div className="text-center text-sm text-secondary flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                Submitted: {(myResponse?.value as any)?.number}
              </div>
            )}
          </>
        )}

        {/* Presenter Controls - shown in presenter mode OR solo mode */}
        {canControl && (
          <div className="bg-muted/30 border border-border/50 rounded-xl p-2 flex items-center justify-center gap-4">
            {isSoloMode ? (
              <span className="text-sm text-muted-foreground">Solo Mode — no session active</span>
            ) : !isPollOpen ? (
              <Button onClick={startHumanPoll} className="gap-2" size="sm">
                <Users className="h-4 w-4" />
                Collect Human Numbers ({humanNumbers.length})
              </Button>
            ) : (
              <>
                <span className="text-sm text-muted-foreground">{humanNumbers.length} submitted</span>
                <Button onClick={stopHumanPoll} variant="secondary" size="sm">Close Poll</Button>
              </>
            )}
            {currentPoll && (
              <>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Add:</span>
                  <Input
                    type="number"
                    value={presenterNumber}
                    onChange={(e) => setPresenterNumber(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePresenterAdd()}
                    placeholder="1-100"
                    className="w-16 text-center text-sm h-8"
                    min={1}
                    max={100}
                  />
                  <Button onClick={handlePresenterAdd} disabled={!presenterNumber} size="sm" variant="outline" className="h-8 px-2">
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Explanation Dialog */}
        <Dialog open={!!selectedSource} onOpenChange={() => setSelectedSource(null)}>
          <DialogContent className="max-w-lg">
            {selectedSource && (
              <>
                <DialogHeader>
                  <DialogTitle className={`flex items-center gap-2 ${colorClasses[selectedSource.color].text}`}>
                    <selectedSource.icon className="h-5 w-5" />
                    {selectedSource.explanation.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">How it works</h4>
                    <p className="text-foreground text-sm">{selectedSource.explanation.howItWorks}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Why it appears random</h4>
                    <p className="text-foreground text-sm">{selectedSource.explanation.whyRandom}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Code</h4>
                    <pre className="bg-muted/50 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                      {selectedSource.explanation.codeExample}
                    </pre>
                  </div>
                  <div className={`${colorClasses[selectedSource.color].bg} border ${colorClasses[selectedSource.color].border} rounded-lg p-3`}>
                    <h4 className={`font-semibold text-sm ${colorClasses[selectedSource.color].text} mb-1`}>💡 Fun Fact</h4>
                    <p className="text-foreground text-sm">{selectedSource.explanation.funFact}</p>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
