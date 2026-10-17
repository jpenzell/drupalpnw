import { QRCodeSVG } from "qrcode.react";
import { useSession } from "@/contexts/SessionContext";
import { getPublicOrigin } from "@/lib/publicUrl";

/**
 * S3a — Prompt slide for the Big Idea photo wall.
 * Shows the question, the QR code, and the join code so the audience can submit.
 */
export const BigIdeaPromptSlide = () => {
  const { session, participantCount } = useSession();

  const joinUrl = session
    ? `${getPublicOrigin()}${window.location.pathname}?join=${session.code}`
    : null;

  return (
    <div className="flex-1 flex items-center justify-center px-8 py-10 animate-fade-in">
      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-[1.3fr_1fr] gap-12 items-center">
        {/* LEFT: prompt */}
        <div className="space-y-8">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary font-semibold">
            Your turn — imagine bigger
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[1.05]">
            If AI could build
            <span className="block text-primary">anything for you —</span>
            <span className="block">what would it be?</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
            Snap a photo — a whiteboard sketch, a thing in the room, a screenshot, your own face,
            anything that captures the big idea you're imagining right now.
          </p>
          <div className="border-l-4 border-secondary pl-5">
            <p className="text-base md:text-lg text-foreground/80 italic">
              Don't overthink it. We'll put them all on the wall together.
            </p>
          </div>
        </div>

        {/* RIGHT: QR + code */}
        <div className="flex flex-col items-center justify-center gap-5">
          {session && joinUrl ? (
            <>
              <div className="bg-white p-5 rounded-2xl shadow-2xl border border-border">
                <QRCodeSVG value={joinUrl} size={260} level="M" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
                  Or enter code
                </p>
                <p className="text-5xl font-mono font-bold tracking-widest text-primary">
                  {session.code}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {participantCount} connected
                </p>
              </div>
            </>
          ) : (
            <div className="text-center space-y-3 p-8 rounded-2xl border border-dashed border-border max-w-sm">
              <p className="text-lg font-semibold text-foreground">
                Start a session to collect ideas
              </p>
              <p className="text-sm text-muted-foreground">
                Use the session button in the toolbar to start. The QR code will appear here so the
                audience can submit photos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
