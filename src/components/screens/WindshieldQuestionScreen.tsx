import { useState } from "react";
import { Play } from "lucide-react";
import { RevealCard } from "../blocks/RevealCard";
import zooxImage from "@/assets/zoox-vehicle.jpg";

const YOUTUBE_VIDEO_ID = "oINBP9b2J_c";

export const WindshieldQuestionScreen = () => {
  const [showVideo, setShowVideo] = useState(false);
  return (
    <div className="flex-1 flex flex-col animate-slide-in overflow-hidden">
      <div className="text-center space-y-4 max-w-4xl mx-auto flex-shrink-0">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Let's Start with a Question...
        </h2>
      </div>

      <div className="flex-1 min-h-0 max-w-5xl mx-auto w-full mt-4">
        <RevealCard
          question="Does a self-driving vehicle need windshield wipers?"
          answer={
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-shrink-0 md:w-1/2">
                <div className="rounded-xl overflow-hidden shadow-xl border-2 border-primary/20 relative aspect-video">
                  <img 
                    src={zooxImage} 
                    alt="Zoox autonomous vehicle" 
                    className="w-full h-full object-cover absolute inset-0"
                  />
                  {!showVideo && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-lg cursor-pointer transition-colors"
                    >
                      <Play className="w-5 h-5 text-primary ml-0.5" />
                    </button>
                  )}
                  {showVideo && (
                    <iframe
                      src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=1&showinfo=0&rel=0&modestbranding=1&start=6`}
                      title="Zoox autonomous vehicle"
                      className="w-full h-full absolute inset-0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
              <div className="space-y-3 md:w-1/2">
                <p className="text-xl font-semibold text-primary">
                  Not if it doesn't have a windshield.
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>The Zoox:</strong> No front. No back. No steering wheel. No windshield.
                </p>
                <p className="text-base text-muted-foreground">
                  When you remove the driver, you can rethink <em>everything</em>.
                </p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};
