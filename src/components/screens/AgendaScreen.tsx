import { useState, useEffect, useCallback } from "react";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import agendaLearnImg from "@/assets/agenda-learn.png";
import agendaDemoImg from "@/assets/agenda-demo.png";
import agendaExploreImg from "@/assets/agenda-explore.png";
import agendaMindsetImg from "@/assets/agenda-mindset.png";

interface AgendaItem {
  number: string;
  title: string;
  flipTitle?: string; // if set, title is clickable and flips to this
  subtitle: string;
  defaultImage: string;
  era: string;
  prompt: string;
}

const agendaItems: AgendaItem[] = [
  {
    number: "01",
    title: "What Is AI?",
    subtitle: "Demystify the buzzwords",
    defaultImage: agendaLearnImg,
    era: "agenda-learn",
    prompt: "Cartoon illustration of a friendly wine barrel character with eyes and a smile, holding a magnifying glass and looking curious about AI, discovery and learning theme, burgundy gold warm colors, flat vector style, clean white background",
  },
  {
    number: "02",
    title: "So What?",
    subtitle: "Use cases & live demos",
    defaultImage: agendaDemoImg,
    era: "agenda-demo",
    prompt: "Cute cartoon illustration of a wine bottle character performing a magic show with sparkles and a wand, demo presentation theme, warm burgundy and gold color palette, simple flat illustration style, white background",
  },
  {
    number: "03",
    title: "Can I Do This?",
    flipTitle: "Let's Do This!",
    subtitle: "Hands-on exploration",
    defaultImage: agendaExploreImg,
    era: "agenda-explore",
    prompt: "Cute cartoon illustration of wine grapes and a wine glass working together at a laptop computer, teamwork and hands-on exploration theme, warm burgundy and gold color palette, simple flat illustration style, white background",
  },
  {
    number: "04",
    title: "What's Next?",
    subtitle: "Your first use case & next steps",
    defaultImage: agendaMindsetImg,
    era: "agenda-mindset",
    prompt: "Cute cartoon illustration of wine glasses toasting with lightbulb ideas floating above them, mindset and takeaways theme, warm burgundy and gold color palette, simple flat illustration style, white background",
  },
];

export const AgendaScreen = () => {
  // Per-era: array of version URLs (oldest first), with "default" as index -1
  const [versions, setVersions] = useState<Record<string, string[]>>({});
  // Per-era: which index is currently shown (-1 = default static image)
  const [currentIndex, setCurrentIndex] = useState<Record<string, number>>({});
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  // Load version history from storage
  useEffect(() => {
    const loadVersions = async () => {
      for (const item of agendaItems) {
        const prefix = `ai-era-${item.era}`;
        const { data: files } = await supabase.storage
          .from("era-images")
          .list("", { search: prefix });

        if (files && files.length > 0) {
          // Filter to versioned files only (contain "-v"), sort by name (timestamp)
          const versionedFiles = files
            .filter((f) => f.name.includes("-v"))
            .sort((a, b) => a.name.localeCompare(b.name));

          if (versionedFiles.length > 0) {
            const urls = versionedFiles.map((f) => {
              const { data } = supabase.storage
                .from("era-images")
                .getPublicUrl(f.name);
              return `${data.publicUrl}?t=${Date.now()}`;
            });

            setVersions((prev) => ({ ...prev, [item.era]: urls }));
            // Show the latest version by default
            setCurrentIndex((prev) => ({
              ...prev,
              [item.era]: urls.length - 1,
            }));
          }
        }
      }
    };
    loadVersions();
  }, []);

  const handleRegenerate = useCallback(async (item: AgendaItem) => {
    setRegeneratingId(item.era);
    try {
      const { data, error } = await supabase.functions.invoke(
        "regenerate-era-image",
        {
          body: {
            prompt: item.prompt,
            era: item.era,
            model: "google/gemini-2.5-flash-image",
          },
        }
      );

      if (error) throw error;
      if (data?.imageUrl) {
        setVersions((prev) => {
          const existing = prev[item.era] || [];
          return { ...prev, [item.era]: [...existing, data.imageUrl] };
        });
        setCurrentIndex((prev) => {
          const existing = versions[item.era] || [];
          return { ...prev, [item.era]: existing.length }; // point to new last item
        });
        toast.success(`New "${item.title}" image generated!`);
      }
    } catch (err) {
      console.error("Regeneration error:", err);
      toast.error("Failed to regenerate image");
    } finally {
      setRegeneratingId(null);
    }
  }, [versions]);

  const navigate = (era: string, direction: -1 | 1) => {
    const eraVersions = versions[era] || [];
    const totalCount = eraVersions.length + 1; // +1 for default
    setCurrentIndex((prev) => {
      const current = prev[era] ?? -1;
      // -1 = default, 0..n = versions
      let next = current + direction;
      if (next < -1) next = totalCount - 2; // wrap to last version
      if (next > totalCount - 2) next = -1; // wrap to default
      return { ...prev, [era]: next };
    });
  };

  const getImageForEra = (item: AgendaItem): string => {
    const idx = currentIndex[item.era] ?? -1;
    if (idx === -1) return item.defaultImage;
    const eraVersions = versions[item.era] || [];
    return eraVersions[idx] || item.defaultImage;
  };

  const getVersionLabel = (item: AgendaItem): string => {
    const eraVersions = versions[item.era] || [];
    const idx = currentIndex[item.era] ?? -1;
    if (eraVersions.length === 0) return "Original";
    if (idx === -1) return `Original`;
    return `v${idx + 1}`;
  };

  const hasHistory = (era: string): boolean => {
    return (versions[era] || []).length > 0;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-in px-4">
      <div className="max-w-5xl w-full space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Today's <span className="text-primary">Journey</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            From grape to glass — understanding AI one sip at a time
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {agendaItems.map((item) => (
            <div
              key={item.number}
              className="flex flex-col items-center text-center space-y-3 group"
            >
              <div className="relative">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-card border-2 border-border overflow-hidden shadow-lg group-hover:border-primary/40 transition-colors">
                  {regeneratingId === item.era ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  ) : (
                    <img
                      src={getImageForEra(item)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
                  {item.number}
                </div>
              </div>

              <div className="space-y-1">
                {item.flipTitle ? (
                  <button
                    onClick={() => setFlipped((prev) => ({ ...prev, [item.era]: !prev[item.era] }))}
                    className="cursor-pointer perspective-[400px] block mx-auto"
                  >
                    <h3
                      className="text-lg md:text-xl font-bold text-primary hover:text-primary/80 transition-all duration-500"
                      style={{
                        transform: flipped[item.era] ? "rotateX(360deg)" : "rotateX(0deg)",
                        transition: "transform 0.6s ease-in-out",
                      }}
                    >
                      {flipped[item.era] ? item.flipTitle : item.title}
                    </h3>
                  </button>
                ) : (
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    {item.title}
                  </h3>
                )}
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </div>

              {/* Per-card controls */}
              <div className="flex items-center gap-1">
                {hasHistory(item.era) && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => navigate(item.era, -1)}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <span className="text-xs text-muted-foreground min-w-[32px] text-center">
                      {getVersionLabel(item)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => navigate(item.era, 1)}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                  onClick={() => handleRegenerate(item)}
                  disabled={regeneratingId !== null}
                  title="Regenerate this image"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      regeneratingId === item.era ? "animate-spin" : ""
                    }`}
                  />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
