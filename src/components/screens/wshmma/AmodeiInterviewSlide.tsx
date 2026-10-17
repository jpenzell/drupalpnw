import { Youtube, ExternalLink, Copy, Check, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const VIDEO_ID = "aAPpQC-3EyE";
const START = 485;
const VIDEO_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}&t=${START}`;
const VIDEO_TITLE = "60 Minutes — Anthropic's Claude and the shutdown scenario (from 8:05)";

export const AmodeiInterviewSlide = () => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = async () => {
    if (!wrapperRef.current) return;
    try {
      if (!document.fullscreenElement) await wrapperRef.current.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      // fall back to the player's own fullscreen control
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(VIDEO_URL);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-10 py-8 animate-fade-in">
      <div className="w-full max-w-[1500px] flex flex-col h-full">
        <header className="text-center mb-4 shrink-0">
          <p className="slide-kicker text-secondary font-bold tracking-[0.2em]">Watch it first</p>
          <h1 className="text-3xl xl:text-4xl font-display font-bold text-foreground leading-tight mt-1">
            When the model thinks it's being shut down.
          </h1>
        </header>

        <div
          ref={wrapperRef}
          className="relative flex-1 min-h-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/20 bg-black"
        >
          <iframe
            src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0&start=${START}`}
            title={VIDEO_TITLE}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>

        <div className="flex items-center justify-between mt-4 shrink-0 gap-4">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Youtube className="h-4 w-4 text-red-500" aria-hidden="true" />
            {VIDEO_TITLE}
          </span>
          <div className="flex items-center gap-2">
            <Button onClick={copyLink} variant="outline" size="sm" className="gap-1">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button onClick={() => window.open(VIDEO_URL, "_blank")} variant="outline" size="sm" className="gap-1">
              <ExternalLink className="h-4 w-4" />
              Open
            </Button>
            <Button onClick={toggleFullscreen} size="sm" className="gap-1">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
