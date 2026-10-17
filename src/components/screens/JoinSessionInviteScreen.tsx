import { useState } from "react";
import { Users, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSession } from "@/contexts/SessionContext";
import { usePresentationMode } from "@/contexts/PresentationModeContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getPublicOrigin } from "@/lib/publicUrl";

export const JoinSessionInviteScreen = () => {
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

  // Solo mode - simple message
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl w-full text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground">
            I <span className="text-primary">reimagined</span> the presentation
          </h1>
          <p className="text-xl text-muted-foreground">
            I don't know how to code. I <span className="text-primary font-semibold">willed this into being</span> by working with AI — through my language, English.
          </p>
          <p className="text-muted-foreground/60 text-sm italic">
            ✨ Built with vibe coding — no programming knowledge required
          </p>
        </div>
      </div>
    );
  }

  // Session mode - Join panel
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
            I <span className="text-primary">reimagined</span> the presentation
          </h1>
          <p className="text-lg text-muted-foreground">
            I don't know how to code. I <span className="text-primary font-semibold">willed this into being</span> through my language, English.
          </p>
        </div>

        {/* Join Panel - Centered */}
        <div className="flex justify-center">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-foreground mb-4 flex items-center justify-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Join the Session
            </h2>
            
            <div className="space-y-4">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl w-fit mx-auto">
                <QRCodeSVG value={joinUrl} size={160} level="M" />
              </div>
              
              {/* Code */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Enter code</p>
                <p className="text-4xl font-black text-primary tracking-wider">{session.code}</p>
              </div>
              
              {/* URL + Copy */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-mono text-muted-foreground break-all mb-2 text-center">
                  {joinUrl.replace('https://', '').replace('http://', '')}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="w-full text-xs"
                >
                  {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
              </div>
              
              {participantCount > 0 && (
                <div className="flex items-center justify-center gap-2 text-secondary pt-2">
                  <Users className="h-4 w-4" />
                  <span className="font-bold">{participantCount} joined</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Participant waiting message */}
        {isParticipant && (
          <p className="text-center text-muted-foreground/60 text-sm mt-6">
            You're connected! Wait for the presentation to begin.
          </p>
        )}

        {/* Vibe coding note for presenter */}
        {!isParticipant && (
          <p className="text-center text-muted-foreground/60 text-xs mt-6 italic">
            ✨ Built with vibe coding — no programming knowledge required
          </p>
        )}
      </div>
    </div>
  );
};
