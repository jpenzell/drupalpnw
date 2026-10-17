import { Brain, Youtube, Bookmark, ExternalLink, Copy, Check } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const VIDEO_URL = "https://www.youtube.com/watch?v=Bj9BD2D3DzA";
const VIDEO_TITLE = "How LLMs Predict Language - Anthropic";

export const StoryRevealScreen = () => {
  const { isPresenter, isSoloMode } = useSession();
  const [copied, setCopied] = useState(false);
  
  // Show video for presenter OR solo mode (practicing alone)
  const showVideo = isPresenter || isSoloMode;

  const copyLink = () => {
    navigator.clipboard.writeText(VIDEO_URL);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const openVideo = () => {
    window.open(VIDEO_URL, "_blank");
  };

  return (
    <div className="flex-1 flex flex-col animate-slide-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-5 py-2 glass-effect rounded-full mb-3">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-primary font-semibold">How It Works</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
          How LLMs Predict Language
        </h1>
        <p className="text-lg text-muted-foreground font-light">
          From <span className="text-secondary font-semibold">Anthropic</span> — one of the AI ensemble
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center max-w-5xl mx-auto w-full">
        {showVideo ? (
          // Presenter/Solo mode sees the embedded video
          <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/20">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/Bj9BD2D3DzA"
              title="Understanding How AI Works"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        ) : (
          // Participants see a save/watch later card
          <div className="bg-gradient-to-br from-card to-card/80 border-2 border-primary/30 rounded-2xl p-8 md:p-12 max-w-2xl w-full shadow-2xl">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30">
                <Youtube className="h-10 w-10 text-red-500" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {VIDEO_TITLE}
                </h3>
                <p className="text-muted-foreground">
                  Save this video to watch later or add to your YouTube playlist
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 font-mono text-sm text-foreground break-all">
                {VIDEO_URL}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={copyLink} variant="outline" size="lg" className="gap-2">
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
                <Button onClick={openVideo} size="lg" className="gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Open in YouTube
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                <Bookmark className="h-4 w-4 inline mr-1" />
                Tip: Click "Save" on YouTube to add to your Watch Later playlist
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
