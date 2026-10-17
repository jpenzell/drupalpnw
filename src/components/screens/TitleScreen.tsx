import { useState } from "react";
import { Copy, Check, Users, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getPublicOrigin } from "@/lib/publicUrl";

export const TitleScreen = () => {
  const { session, isParticipant, participantCount } = useSession();
  const [copied, setCopied] = useState(false);

  const joinUrl = session
    ? `${getPublicOrigin()}/?join=${session.code}`
    : "";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in relative overflow-hidden min-h-0 bg-iqa-hero">
      {/* Event wordmark — top right */}
      <p className="absolute top-6 right-6 md:top-10 md:right-10 z-20 font-display font-black text-primary text-2xl md:text-4xl tracking-[0.18em]">
        ISPI
      </p>

      {/* Year accent — top left, like the template */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 z-20">
        <p className="font-display font-semibold text-spotlight text-lg md:text-xl tracking-wide">
          September 25, 2026
        </p>
        <p className="font-display text-white/90 text-sm md:text-base tracking-wide">
          Minnesota Chapter · Digital Learning Forum
        </p>
      </div>

      {/* Content */}
      <div
        className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 pt-24 pb-12"
        style={{
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {/* Left: Title */}
        <div className="text-center lg:text-left space-y-6 flex-1 min-w-0">
          {/* Brand badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/40 rounded-full border border-white/15 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-spotlight" />
            <span className="text-white/95 font-semibold text-sm tracking-wide">
              A program by Josh Penzell
            </span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span className="text-white/70 text-xs">Imagination Applied</span>
          </div>

          {/* Main Title */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight uppercase">
            Rehearsing
            <span className="block text-white">the Future</span>
            <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Training + AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-light tracking-tight max-w-2xl">
            Directing the Future of Training in the Age of AI
          </p>

          {/* Conference line */}
          <p className="text-sm md:text-base text-white/60 tracking-wider uppercase">
            Minnesota Chapter of ISPI · Digital Learning Forum
          </p>

        </div>

        {/* Right: Join panel */}
        {(isParticipant || session) && (
          <div className="flex-shrink-0 w-full lg:w-auto max-w-sm">
            {isParticipant ? (
              <div className="bg-black/50 rounded-2xl p-5 border border-white/15 text-center backdrop-blur-md">
                <div className="flex items-center justify-center gap-2 text-white mb-2">
                  <Users className="h-5 w-5 text-spotlight" />
                  <span className="font-semibold">You're connected!</span>
                </div>
                <p className="text-white/70 text-sm">
                  Keep this screen handy — we'll use it for interactive moments throughout.
                </p>
              </div>
            ) : (
              <div className="bg-black/50 rounded-2xl p-5 border border-white/15 text-center space-y-3 backdrop-blur-md">
                <p className="text-white/95 font-medium">Join the session</p>

                <div className="bg-white p-3 rounded-xl mx-auto w-fit">
                  <QRCodeSVG value={joinUrl} size={140} level="M" />
                </div>

                <div className="text-center">
                  <p className="text-white/70 text-sm mb-1">Or enter code</p>
                  <p className="text-3xl font-black text-spotlight tracking-wider">
                    {session?.code}
                  </p>
                </div>

                <div className="bg-white/10 rounded-lg p-3 border border-white/15">
                  <p className="text-white/90 font-mono text-sm break-all mb-2">
                    {joinUrl.replace('https://', '').replace('http://', '')}
                  </p>
                  <Button
                    size="sm"
                    onClick={copyToClipboard}
                    className="bg-white text-foreground hover:bg-white/90 font-medium"
                  >
                    {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                </div>

                {participantCount > 0 && (
                  <div className="flex items-center justify-center gap-2 text-spotlight pt-1">
                    <Users className="h-4 w-4" />
                    <span className="font-bold text-sm">{participantCount} joined</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
