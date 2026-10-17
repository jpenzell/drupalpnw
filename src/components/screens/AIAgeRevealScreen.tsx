import { useState, useEffect, useCallback } from "react";
import { BookOpen, Sparkles, Send, ExternalLink, RefreshCw, Wand2 } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { usePoll } from "@/contexts/PollContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import talosImage from "@/assets/ancient-talos.jpg";
import davinciImage from "@/assets/ancient-davinci-knight.jpg";
import pinocchioImage from "@/assets/ancient-pinocchio.jpg";
import frankensteinImage from "@/assets/ancient-frankenstein.jpg";
import adaImage from "@/assets/ancient-ada-lovelace.jpg";

interface AncientDream {
  id: string;
  era: string;
  title: string;
  description: string;
  year: string;
  image: string;
  wikiUrl: string;
  prompt: string;
}

const ancientDreams: AncientDream[] = [
  {
    id: "talos",
    era: "Greek Mythology",
    title: "Talos",
    description: "Bronze automaton guarding Crete",
    year: "~400 BCE",
    image: talosImage,
    wikiUrl: "https://en.wikipedia.org/wiki/Talos",
    prompt: "Ancient Greek bronze giant Talos, mythological automaton guardian of Crete, metallic humanoid figure with glowing eyes, dramatic classical Greek art style"
  },
  {
    id: "davinci",
    era: "Renaissance", 
    title: "Da Vinci's Knight",
    description: "Mechanical automaton designs",
    year: "1495",
    image: davinciImage,
    wikiUrl: "https://en.wikipedia.org/wiki/Leonardo%27s_robot",
    prompt: "Leonardo da Vinci mechanical knight automaton, Renaissance robot design, brass and copper gears, intricate clockwork mechanism, technical drawing style"
  },
  {
    id: "pinocchio",
    era: "Italian Literature",
    title: "Pinocchio",
    description: "Wooden puppet becomes real",
    year: "1883",
    image: pinocchioImage,
    wikiUrl: "https://en.wikipedia.org/wiki/Pinocchio",
    prompt: "Pinocchio wooden puppet boy coming to life, magical transformation moment, warm golden lighting, whimsical fairy tale illustration style"
  },
  {
    id: "frankenstein",
    era: "Gothic Fiction",
    title: "Frankenstein",
    description: "Created life from science",
    year: "1818",
    image: frankensteinImage,
    wikiUrl: "https://en.wikipedia.org/wiki/Frankenstein%27s_monster",
    prompt: "Frankenstein's monster awakening on laboratory table, dramatic lightning, gothic horror scene, 19th century science laboratory"
  },
  {
    id: "ada",
    era: "Victorian Era",
    title: "Ada Lovelace",
    description: "First algorithm for a machine",
    year: "1843",
    image: adaImage,
    wikiUrl: "https://en.wikipedia.org/wiki/Ada_Lovelace",
    prompt: "Ada Lovelace Victorian woman mathematician, elegant period dress, working with analytical engine gears and calculations, steampunk aesthetic"
  }
];

export const AIAgeRevealScreen = () => {
  const [revealed, setRevealed] = useState(false);
  const { isPresenter, isSoloMode, participantId } = useSession();
  const { currentPoll, responses, myResponse, createPoll, openPoll, closePoll, submitResponse, getPollForSlide } = usePoll();
  
  const [yearGuess, setYearGuess] = useState("");
  const [showAITools, setShowAITools] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [customImages, setCustomImages] = useState<Record<string, string>>({});

  // Load or create poll for this slide
  useEffect(() => {
    getPollForSlide("ai-age-reveal");
  }, [getPollForSlide]);

  // Auto-create and open poll when presenter arrives
  useEffect(() => {
    const autoStartPoll = async () => {
      if (isPresenter && !currentPoll) {
        await createPoll("ai-age-reveal", "text", {});
      } else if (isPresenter && currentPoll && !currentPoll.is_open) {
        await openPoll(currentPoll.id);
      }
    };
    autoStartPoll();
  }, [isPresenter, currentPoll, createPoll, openPoll]);

  // Load custom images from storage on mount
  useEffect(() => {
    const loadCustomImages = async () => {
      const images: Record<string, string> = {};
      for (const dream of ancientDreams) {
        const { data } = supabase.storage
          .from('era-images')
          .getPublicUrl(`ai-era-${dream.id}.png`);
        
        // Check if image exists by trying to fetch it
        try {
          const response = await fetch(data.publicUrl, { method: 'HEAD' });
          if (response.ok) {
            images[dream.id] = `${data.publicUrl}?t=${Date.now()}`;
          }
        } catch {
          // Image doesn't exist, use default
        }
      }
      if (Object.keys(images).length > 0) {
        setCustomImages(images);
      }
    };
    loadCustomImages();
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.key === " " || e.key === "ArrowRight") && !revealed && (isPresenter || isSoloMode)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      setRevealed(true);
    }
  }, [revealed, isPresenter, isSoloMode]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
  }, [handleKeyDown]);

  const handleSubmitGuess = async () => {
    const year = parseInt(yearGuess);
    if (isNaN(year) || year < 1800 || year > 2025) return;
    
    await submitResponse({ year });
    setYearGuess("");
  };

  const handleRegenerateImage = async (dream: AncientDream) => {
    setRegeneratingId(dream.id);
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-era-image', {
        body: {
          prompt: dream.prompt,
          era: dream.id,
          model: 'google/gemini-2.5-flash-image'
        }
      });

      if (error) throw error;
      if (data?.imageUrl) {
        setCustomImages(prev => ({ ...prev, [dream.id]: data.imageUrl }));
        toast.success(`${dream.title} image regenerated!`);
      }
    } catch (err) {
      console.error('Regeneration error:', err);
      toast.error('Failed to regenerate image');
    } finally {
      setRegeneratingId(null);
    }
  };

  // Get individual guesses for display
  const individualGuesses = responses
    .map(r => ({ id: r.id, year: (r.value as any)?.year }))
    .filter(g => g.year)
    .slice(-16);

  // Aggregate for reveal stats
  const guessBuckets = responses.reduce((acc, r) => {
    const year = (r.value as any)?.year;
    if (year) {
      acc[year] = (acc[year] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  const sortedGuesses = Object.entries(guessBuckets)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => b.count - a.count);

  const isPollOpen = currentPoll?.is_open;
  const hasSubmitted = !!myResponse;

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-in">
      <div className="max-w-6xl mx-auto w-full space-y-4">
        
        {/* Pre-reveal: The Ancient Dream */}
        {!revealed && (
          <>
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-primary font-semibold text-sm">The Ancient Dream</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Humanity has <span className="text-accent">always</span> dreamed of creating life
              </h1>
            </div>

            {/* Ancient Dreams Grid with Images */}
            <div className="grid grid-cols-5 gap-3">
              {ancientDreams.map((dream, idx) => (
                <a 
                  key={dream.id}
                  href={dream.wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 rounded-xl overflow-hidden animate-fade-in hover:border-primary/50 hover:shadow-lg transition-all"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img 
                      src={customImages[dream.id] || dream.image} 
                      alt={dream.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="h-4 w-4 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="p-2 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{dream.era}</p>
                    <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{dream.title}</p>
                    <p className="text-xs text-primary font-semibold">{dream.year}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* AI Tools Toggle - Presenter only */}
            {isPresenter && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAITools(!showAITools)}
                  className="gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  {showAITools ? 'Hide AI Tools' : 'AI Tools'}
                </Button>
              </div>
            )}

            {/* AI Tools Panel */}
            {showAITools && isPresenter && (
              <div className="bg-card/80 border border-border rounded-xl p-4 animate-fade-in">
                <p className="text-sm text-muted-foreground mb-3 text-center">
                  Regenerate images with AI (uses Gemini)
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {ancientDreams.map((dream) => (
                    <Button
                      key={dream.id}
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRegenerateImage(dream);
                      }}
                      disabled={regeneratingId !== null}
                      className="gap-2"
                    >
                      <RefreshCw className={`h-3 w-3 ${regeneratingId === dream.id ? 'animate-spin' : ''}`} />
                      {dream.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* The Question */}
            <div className="text-center bg-accent/10 border-2 border-accent/30 rounded-2xl p-4">
              <p className="text-xl md:text-2xl font-bold text-foreground">
                But when was <span className="text-primary">"Artificial Intelligence"</span> actually coined?
              </p>
              <p className="text-muted-foreground text-sm mt-1">The dream is ancient. When did we name it?</p>
            </div>

            {/* Participant Input */}
            {!isPresenter && (
              <div className="flex justify-center">
                {isPollOpen && !hasSubmitted ? (
                  <div className="bg-card/50 border border-border/50 rounded-xl p-4 max-w-sm w-full">
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        value={yearGuess}
                        onChange={(e) => setYearGuess(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmitGuess()}
                        placeholder="Your guess..."
                        className="text-xl text-center font-bold"
                        min={1800}
                        max={2025}
                      />
                      <Button onClick={handleSubmitGuess} disabled={!yearGuess}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : hasSubmitted ? (
                  <div className="bg-primary/10 border border-primary/30 rounded-xl px-6 py-3">
                    <p className="text-primary font-medium">
                      Your guess: <span className="text-xl font-bold">{(myResponse?.value as any)?.year}</span>
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Presenter: Live Guesses - Scrolling ticker */}
            {isPresenter && !showAITools && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-muted-foreground text-sm">Guesses:</span>
                  <span className="text-2xl font-bold text-primary">{responses.length}</span>
                </div>
                
                {individualGuesses.length > 0 && (
                  <div className="relative overflow-hidden h-12 bg-muted/30 rounded-xl border border-border/50">
                    <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent z-10" />
                    <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-10" />
                    <div 
                      className="flex items-center gap-3 h-full px-4 animate-[scroll-left_20s_linear_infinite]"
                      style={{
                        width: 'max-content',
                        animation: individualGuesses.length > 6 ? 'scroll-left 20s linear infinite' : 'none',
                        justifyContent: individualGuesses.length <= 6 ? 'center' : 'flex-start'
                      }}
                    >
                      {/* Duplicate for seamless scroll */}
                      {[...individualGuesses, ...(individualGuesses.length > 6 ? individualGuesses : [])].map((guess, idx) => (
                        <div
                          key={`${guess.id}-${idx}`}
                          className="flex-shrink-0 bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/40 rounded-lg px-4 py-1.5 shadow-sm"
                        >
                          <span className="text-xl font-black text-foreground">{guess.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {individualGuesses.length === 0 && (
                  <div className="h-12 bg-muted/20 rounded-xl border border-dashed border-border/50 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Waiting for guesses...</span>
                  </div>
                )}
                
                <p className="text-muted-foreground text-xs text-center">
                  Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Space</kbd> to reveal
                </p>
              </div>
            )}
          </>
        )}

        {/* Reveal */}
        {revealed && (
          <div className="text-center space-y-6 animate-scale-in">
            <div className="bg-gradient-to-br from-accent/20 to-primary/20 border-2 border-accent/40 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-center gap-4 mb-3">
                <Sparkles className="h-8 w-8 text-accent" />
                <span className="text-6xl md:text-8xl font-black text-foreground">1956</span>
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <p className="text-2xl font-bold text-primary">Dartmouth Conference</p>
              <p className="text-muted-foreground">John McCarthy coined the term</p>
            </div>

            {responses.length > 0 && (
              <div className="text-lg text-muted-foreground">
                {guessBuckets[1956] ? (
                  <span className="text-primary font-semibold">
                    🎉 {guessBuckets[1956]} got it exactly right!
                  </span>
                ) : sortedGuesses[0] && (
                  <span>
                    Closest: <span className="font-bold text-foreground">{sortedGuesses[0].year}</span>
                    {" "}({Math.abs(sortedGuesses[0].year - 1956)} years off)
                  </span>
                )}
              </div>
            )}

            <div className="max-w-3xl mx-auto space-y-3">
              <p className="text-lg text-muted-foreground">
                <span className="text-primary font-semibold">The dream is thousands of years old.</span>
                <br />What changed in 1956 wasn't the idea—it was the belief that we could actually build it.
              </p>
              <div className="bg-muted/30 border border-border/50 rounded-xl px-5 py-3 inline-block">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">For context:</span> 1956 was also the year IBM released the <strong className="text-foreground">305 RAMAC</strong>—the first computer with a hard drive. It weighed over a ton and stored 5 MB.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
