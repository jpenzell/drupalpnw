import { Linkedin, Presentation, Coffee, ScanLine } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ZenBackdrop } from "../ZenBackdrop";
import curtainCall from "@/assets/zen/curtain-call.jpg";
import { getPublicOrigin } from "@/lib/publicUrl";
import { usePresentationMode } from "@/contexts/PresentationModeContext";
import { useSession } from "@/contexts/SessionContext";
import Connect from "@/pages/Connect";

export const FinalSlide = () => {
  const connectUrl = `${getPublicOrigin()}/connect`;
  const { eventWhere } = usePresentationMode();
  const { isParticipant } = useSession();

  if (isParticipant) return <Connect embedded />;

  return (
    <ZenBackdrop image={curtainCall} overlay="paper" kenBurns alt="Stage curtain call under warm spotlights">
      <div className="w-full h-full flex items-center justify-center px-16 py-12">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-[1.25fr_auto] gap-12 items-center">
          {/* Left: headline + signature */}
          <div className="space-y-6 text-left">
            <p className="slide-kicker text-secondary">Curtain call</p>
            <h2 className="slide-title font-display font-bold text-foreground">
              One change on Monday.
            </h2>
            <p className="slide-body text-foreground italic">
              Structured freedom. Curb-cut design.
            </p>
            <p className="slide-body text-foreground">
              Josh Penzell · Imagination Applied
            </p>
            <p className="slide-caption text-muted-foreground uppercase break-words">
              {eventWhere}
            </p>
          </div>

          {/* Right: QR card */}
          <a
            href={connectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-5 p-8 rounded-lg border-2 border-border bg-background hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2 text-secondary">
              <ScanLine className="w-6 h-6" />
              <span className="slide-chrome uppercase tracking-widest font-semibold">
                Scan to connect
              </span>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <QRCodeSVG
                value={connectUrl}
                size={260}
                bgColor="#ffffff"
                fgColor="#111111"
                level="M"
              />
            </div>
            <ul className="space-y-2 text-foreground slide-caption">
              <li className="flex items-center gap-3">
                <Linkedin className="w-5 h-5 text-secondary shrink-0" />
                Connect on LinkedIn
              </li>
              <li className="flex items-center gap-3">
                <Presentation className="w-5 h-5 text-secondary shrink-0" />
                Slides when they're live
              </li>
              <li className="flex items-center gap-3">
                <Coffee className="w-5 h-5 text-secondary shrink-0" />
                Ask for a follow-up
              </li>
            </ul>
            <p className="text-muted-foreground text-base font-mono">
              {connectUrl.replace(/^https?:\/\//, "")}
            </p>
          </a>
        </div>
      </div>
    </ZenBackdrop>
  );
};
