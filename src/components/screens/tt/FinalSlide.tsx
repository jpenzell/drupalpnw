import { Linkedin, Presentation, Coffee, ScanLine } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ZenBackdrop } from "../ZenBackdrop";
import curtainCall from "@/assets/zen/curtain-call.jpg";
import { getPublicOrigin } from "@/lib/publicUrl";

export const FinalSlide = () => {
  const connectUrl = `${getPublicOrigin()}/connect`;


  return (
    <ZenBackdrop image={curtainCall} overlay="heavy" kenBurns alt="Stage curtain call under warm spotlights">
      <div className="w-full h-full flex items-center justify-center px-16 py-12">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-center">
          {/* Left: headline + signature */}
          <div className="space-y-6 text-left">
            <p className="slide-kicker text-secondary">Curtain call</p>
            <h2 className="slide-title font-display font-bold text-white drop-shadow-[0_2px_28px_rgba(0,0,0,0.85)]">
              Now go imagine.
            </h2>
            <p className="slide-body text-white/85 italic drop-shadow-[0_2px_18px_rgba(0,0,0,0.7)]">
              Rehearse the future of the learning you design — together.
            </p>
            <p className="slide-body text-white/90 drop-shadow-[0_2px_18px_rgba(0,0,0,0.7)]">
              Josh Penzell · Imagination Applied
            </p>
            <p className="slide-caption text-white/65 uppercase tracking-[0.12em]">
              Minnesota Chapter of ISPI · Digital Learning Forum
            </p>
          </div>

          {/* Right: QR card */}
          <a
            href={connectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-5 p-8 rounded-3xl border-2 border-white/30 bg-black/55 backdrop-blur-md hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-2 text-secondary">
              <ScanLine className="w-6 h-6" />
              <span className="slide-chrome uppercase tracking-widest font-semibold">
                Scan to connect
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl">
              <QRCodeSVG
                value={connectUrl}
                size={260}
                bgColor="#ffffff"
                fgColor="#111111"
                level="M"
              />
            </div>
            <ul className="space-y-2 text-white slide-caption">
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
            <p className="text-white/70 text-base font-mono">
              {connectUrl.replace(/^https?:\/\//, "")}
            </p>
          </a>
        </div>
      </div>
    </ZenBackdrop>
  );
};
