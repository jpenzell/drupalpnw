// ============= Full file contents =============

import { useState, useRef } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHeadshotTransform, EFFECTS } from "@/hooks/useHeadshotTransform";
import joshHeadshot from "@/assets/josh-headshot.jpeg";
import logoAmazon from "@/assets/logo-amazon-new.jpeg";
import logoAlexa from "@/assets/logo-alexa-new.png";
import logoSkillsoft from "@/assets/logo-skillsoft-new.jpg";
import logoSdc from "@/assets/logo-sdc-new.webp";
import logoZillow from "@/assets/logo-zillow-rentals.png";
import logoZoox from "@/assets/logo-zoox.avif";
import logoOffBroadway from "@/assets/logo-offbroadway.png";
import logoNorthwestern from "@/assets/logo-northwestern.png";
import logoBrooklyn from "@/assets/logo-brooklyn-college.png";
import logoUIUC from "@/assets/logo-uiuc.webp";

const HEADSHOT_STORAGE_URL =
  "https://wxgdptvgerwudxhihkzn.supabase.co/storage/v1/object/public/era-images/josh-headshot.jpeg";

interface DraggableLogoProps {
  src: string;
  alt: string;
  initialX: number;
  initialY: number;
  height: string;
  className?: string;
  zIndex?: number;
}

const DraggableLogo = ({
  src,
  alt,
  initialX,
  initialY,
  height,
  className = "",
  zIndex = 1,
}: DraggableLogoProps) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [dragging, setDragging] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const dragRef = useRef<{ sx: number; sy: number; ix: number; iy: number } | null>(null);

  const onDown = (cx: number, cy: number) => {
    setDragging(true);
    dragRef.current = { sx: cx, sy: cy, ix: pos.x, iy: pos.y };
  };
  const onMove = (cx: number, cy: number) => {
    if (!dragging || !dragRef.current) return;
    setPos({ x: dragRef.current.ix + (cx - dragRef.current.sx), y: dragRef.current.iy + (cy - dragRef.current.sy) });
  };
  const onUp = () => {
    if (!dragging) return;
    setDragging(false);
    dragRef.current = null;
    setWiggle(true);
    setTimeout(() => setWiggle(false), 500);
  };

  return (
    <div
      className={`absolute flex items-center justify-center px-3 py-2 rounded-xl bg-white border border-border/50 shadow-md cursor-grab active:cursor-grabbing select-none transition-transform ${dragging ? "scale-110 shadow-xl" : ""} ${wiggle ? "animate-wiggle" : ""} ${className}`}
      style={{
        left: pos.x,
        top: pos.y,
        zIndex: dragging ? 100 : zIndex,
        transform: `translate(-50%, -50%) ${dragging ? "scale(1.1) rotate(2deg)" : ""}`,
      }}
      onMouseDown={(e) => { e.preventDefault(); onDown(e.clientX, e.clientY); }}
      onMouseMove={(e) => onMove(e.clientX, e.clientY)}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={(e) => { const t = e.touches[0]; onDown(t.clientX, t.clientY); }}
      onTouchMove={(e) => { const t = e.touches[0]; onMove(t.clientX, t.clientY); }}
      onTouchEnd={onUp}
    >
      <img src={src} alt={alt} className={`${height} w-auto object-contain pointer-events-none`} loading="eager" decoding="sync" />
    </div>
  );
};

interface LogoTileProps {
  src: string;
  alt: string;
  height: string;
  className?: string;
}

const LogoTile = ({ src, alt, height, className = "" }: LogoTileProps) => (
  <div className={`flex items-center justify-center px-3 py-3 rounded-xl bg-white border border-border/50 shadow-md ${className}`}>
    <img src={src} alt={alt} className={`${height} w-auto object-contain`} loading="eager" decoding="sync" />
  </div>
);

interface AboutMeSlideProps {
  isActive?: boolean;
}

export const AboutMeSlide = ({ isActive = true }: AboutMeSlideProps) => {
  const {
    currentImage,
    activeEffect,
    isTransforming,
    progress,
    applyEffect,
  } = useHeadshotTransform(HEADSHOT_STORAGE_URL, false, false);

  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in relative overflow-hidden px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          {/* Left: Photo + name + effects */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-56 h-56 md:w-64 md:h-64 rounded-3xl overflow-hidden border-4 border-primary/40 shadow-2xl">
                <img
                  src={currentImage || joshHeadshot}
                  alt="Josh Penzell"
                  className="w-full h-full object-cover transition-opacity duration-300"
                  width={256}
                  height={256}
                  loading="eager"
                  decoding="sync"
                />
              </div>

              {isTransforming && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-44">
                  <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Wand2 className="h-3 w-3" />
                AI Fun
              </div>
            </div>

            <div className="text-center">
              <h1 className="slide-subtitle font-display font-bold text-foreground leading-tight">
                Josh Penzell
              </h1>
              <p className="slide-caption text-muted-foreground italic">MBA · MFA · Director</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 max-w-xs">
              {EFFECTS.map((effect) => (
                <Button
                  key={effect.id}
                  size="sm"
                  variant={activeEffect === effect.id ? "default" : "outline"}
                  onClick={() => applyEffect(effect.id)}
                  disabled={isTransforming}
                  className="text-xs px-2 py-1 h-7"
                >
                  {effect.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Right: Logo grid */}
          <div className="flex-1 w-full min-w-[320px] grid grid-cols-3 gap-4 items-center">
            <LogoTile src={logoNorthwestern} alt="Northwestern" height="h-12" />
            <LogoTile src={logoAmazon} alt="Amazon" height="h-10" />
            <LogoTile src={logoUIUC} alt="University of Illinois" height="h-12" />

            <LogoTile src={logoSdc} alt="SDC" height="h-12" />
            <LogoTile
              src={logoZoox}
              alt="Zoox"
              height="h-20"
              className="ring-2 ring-secondary/60 shadow-2xl scale-110"
            />
            <LogoTile src={logoZillow} alt="Zillow Rentals" height="h-10" />

            <LogoTile src={logoBrooklyn} alt="Brooklyn College" height="h-14" />
            <LogoTile src={logoOffBroadway} alt="Off Broadway" height="h-10" />
            <LogoTile src={logoAlexa} alt="Alexa" height="h-10" />

            <div />
            <LogoTile src={logoSkillsoft} alt="Skillsoft" height="h-10" />
            <div />
          </div>
        </div>
      </div>
    </div>
  );
};
