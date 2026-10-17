import { useState, useRef, useEffect } from "react";
import { Sparkles, Wand2, Pause, Play, Upload, Send, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { useHeadshotTransform, EFFECTS, preloadFirstEffect } from "@/hooks/useHeadshotTransform";
import vineyardHero from "@/assets/vineyard-hero.jpg";
import joshHeadshot from "@/assets/josh-headshot.jpeg";

const HEADSHOT_STORAGE_URL = "https://wxgdptvgerwudxhihkzn.supabase.co/storage/v1/object/public/era-images/josh-headshot.jpeg";

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

// Export preload function for use in Index.tsx
export { preloadFirstEffect };

interface LogoPosition {
  x: number;
  y: number;
}

interface DraggableLogoProps {
  id: string;
  src: string;
  alt: string;
  initialX: number;
  initialY: number;
  height: string;
  className?: string;
  zIndex?: number;
}

const DraggableLogo = ({ 
  id, 
  src, 
  alt, 
  initialX, 
  initialY, 
  height, 
  className = "",
  zIndex = 1 
}: DraggableLogoProps) => {
  const [position, setPosition] = useState<LogoPosition>({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragRef.current) return;
    
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    
    setPosition({
      x: dragRef.current.initialX + deltaX,
      y: dragRef.current.initialY + deltaY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragRef.current = null;
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 500);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragRef.current.startX;
    const deltaY = touch.clientY - dragRef.current.startY;
    
    setPosition({
      x: dragRef.current.initialX + deltaX,
      y: dragRef.current.initialY + deltaY
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    dragRef.current = null;
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 500);
  };

  return (
    <div
      className={`absolute flex items-center justify-center px-3 py-2 rounded-xl bg-white border border-border/50 shadow-md cursor-grab active:cursor-grabbing select-none transition-transform ${isDragging ? 'scale-110 shadow-xl' : ''} ${isWiggling ? 'animate-wiggle' : ''} ${className}`}
      style={{ 
        left: position.x, 
        top: position.y,
        zIndex: isDragging ? 100 : zIndex,
        transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.1) rotate(2deg)' : ''}`,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img src={src} alt={alt} className={`${height} w-auto object-contain pointer-events-none`} />
    </div>
  );
};

// Participant photo upload and transform component
const ParticipantPhotoTransform = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { session } = useSession();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setTransformedImage(null);
      setActiveEffect(null);
      setIsSubmitted(false);
    };
    reader.readAsDataURL(file);
  };

  const applyEffect = async (effectId: string) => {
    if (!uploadedImage || isTransforming) return;
    
    setIsTransforming(true);
    setActiveEffect(effectId);
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 90));
    }, 100);
    
    try {
      const { data, error } = await supabase.functions.invoke('transform-headshot', {
        body: { imageUrl: uploadedImage, effect: effectId }
      });

      if (error) throw error;
      
      if (data?.imageUrl) {
        setTransformedImage(data.imageUrl);
        toast.success(`${effectId.replace('_', ' ')} effect applied!`);
      }
    } catch (error) {
      console.error('Transform error:', error);
      toast.error('Failed to apply effect');
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => setProgress(0), 300);
      setIsTransforming(false);
    }
  };

  const handleSubmit = async () => {
    if (!transformedImage || !session?.id) {
      toast.error("Please apply an effect first");
      return;
    }
    
    try {
      // Upload to Supabase storage
      const fileName = `participant-${Date.now()}.png`;
      const response = await fetch(transformedImage);
      const blob = await response.blob();
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('era-images')
        .upload(`participant-photos/${session.id}/${fileName}`, blob, {
          contentType: 'image/png',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      setIsSubmitted(true);
      toast.success("Photo submitted! It may appear in the closing slides 🎉");
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit photo');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-md mx-auto">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 border border-secondary/30 rounded-full">
        <Camera className="h-4 w-4 text-secondary" />
        <span className="text-secondary font-semibold text-sm">Your Turn!</span>
      </div>
      
      <p className="text-sm text-muted-foreground text-center">
        Upload your photo and see yourself transformed by AI
      </p>

      {!uploadedImage ? (
        <div 
          className="w-48 h-48 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Tap to upload</span>
        </div>
      ) : (
        <div className="relative">
          <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-primary/30 shadow-xl">
            <img 
              src={transformedImage || uploadedImage} 
              alt="Your photo" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {isTransforming && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-40">
              <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-100 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {activeEffect && (
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold">
              {EFFECTS.find(e => e.id === activeEffect)?.label}
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFileUpload}
      />

      {uploadedImage && (
        <>
          <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
            {EFFECTS.slice(0, 6).map((effect) => (
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
          
          {transformedImage && !isSubmitted && (
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Input
                placeholder="Your name (optional)"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="text-sm"
              />
              <Button
                onClick={handleSubmit}
                className="w-full gap-2"
                disabled={isTransforming}
              >
                <Send className="h-4 w-4" />
                Submit to Gallery
              </Button>
            </div>
          )}
          
          {isSubmitted && (
            <div className="text-center p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-600 font-medium">✅ Submitted!</p>
              <p className="text-xs text-muted-foreground">Watch for your photo at the end</p>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setUploadedImage(null);
              setTransformedImage(null);
              setActiveEffect(null);
              setIsSubmitted(false);
            }}
          >
            Upload Different Photo
          </Button>
        </>
      )}
    </div>
  );
};

interface AboutMeScreenProps {
  isActive?: boolean;
}

export const AboutMeScreen = ({ isActive = true }: AboutMeScreenProps) => {
  const { isParticipant } = useSession();
  
  const {
    currentImage,
    activeEffect,
    isTransforming,
    progress,
    isAutoCycling,
    setIsAutoCycling,
    applyEffect,
    reset,
  } = useHeadshotTransform(HEADSHOT_STORAGE_URL, isActive && !isParticipant);

  // Show participant upload UI for participants
  if (isParticipant) {
    return (
      <div className="flex-1 flex items-center justify-center animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={vineyardHero} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>
        <ParticipantPhotoTransform />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in relative overflow-hidden">
      {/* Subtle vineyard background */}
      <div className="absolute inset-0">
        <img 
          src={vineyardHero} 
          alt="" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>
      
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Left side: Photo with effects */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-secondary/10 border border-secondary/30 rounded-full">
              <Sparkles className="h-4 w-4 text-secondary" />
              <span className="text-secondary font-semibold tracking-wide text-sm uppercase">
                Artistic Intelligence
              </span>
            </div>

            {/* Photo */}
            <div className="relative">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border-4 border-primary/30 shadow-2xl">
                <img 
                  src={currentImage || joshHeadshot} 
                  alt="Josh Penzell" 
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              </div>
              
              {/* Progress bar below photo */}
              {isTransforming && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-40">
                  <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-100 ease-out rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 text-center mt-1">
                    Creating {EFFECTS.find(e => e.id === activeEffect)?.label}...
                  </p>
                </div>
              )}
              
              {/* AI Badge */}
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Wand2 className="h-3 w-3" />
                AI Fun
              </div>
            </div>

            {/* Name */}
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Josh Penzell
              </h1>
              <p className="text-sm text-muted-foreground">
                MBA + MFA • Strategy meets creativity
              </p>
            </div>

            {/* Effect Buttons */}
            <div className="flex flex-wrap justify-center gap-2 max-w-xs">
              {EFFECTS.map((effect) => (
                <Button
                  key={effect.id}
                  size="sm"
                  variant={activeEffect === effect.id ? "default" : "outline"}
                  onClick={() => {
                    setIsAutoCycling(false);
                    applyEffect(effect.id);
                  }}
                  disabled={isTransforming}
                  className="text-xs px-2 py-1 h-7"
                >
                  {effect.label}
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAutoCycling(!isAutoCycling)}
                disabled={isTransforming}
                className="text-xs px-2 py-1 h-7"
              >
                {isAutoCycling ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground/60">
              {isAutoCycling ? "🔄 Auto-cycling effects..." : "✨ Click effects or drag logos!"}
            </p>
          </div>

          {/* Right side: Draggable Logos Area */}
          <div className="relative h-[320px] md:h-[380px] flex-1 w-full min-w-[300px]">
            {/* Row 1: Top */}
            <DraggableLogo
              id="northwestern"
              src={logoNorthwestern}
              alt="Northwestern"
              initialX={80}
              initialY={40}
              height="h-12"
              className="opacity-80"
            />
            
            <DraggableLogo
              id="amazon"
              src={logoAmazon}
              alt="Amazon"
              initialX={280}
              initialY={50}
              height="h-10"
            />
            
            <DraggableLogo
              id="uiuc"
              src={logoUIUC}
              alt="University of Illinois"
              initialX={480}
              initialY={40}
              height="h-10"
              className="opacity-80"
            />

            {/* Row 2: Upper middle */}
            <DraggableLogo
              id="sdc"
              src={logoSdc}
              alt="SDC"
              initialX={60}
              initialY={130}
              height="h-10"
            />
            
            <DraggableLogo
              id="zillow"
              src={logoZillow}
              alt="Zillow Rentals"
              initialX={500}
              initialY={120}
              height="h-16"
            />

            {/* Center: ZOOX - Highlighted */}
            <DraggableLogo
              id="zoox"
              src={logoZoox}
              alt="Zoox"
              initialX={280}
              initialY={180}
              height="h-16"
              className="border-2 border-primary/50 ring-4 ring-primary/20"
              zIndex={10}
            />

            {/* Row 3: Lower middle */}
            <DraggableLogo
              id="alexa"
              src={logoAlexa}
              alt="Alexa"
              initialX={480}
              initialY={250}
              height="h-16"
            />

            {/* Row 4: Bottom */}
            <DraggableLogo
              id="brooklyn"
              src={logoBrooklyn}
              alt="Brooklyn College"
              initialX={80}
              initialY={280}
              height="h-8"
              className="opacity-80"
            />
            
            <DraggableLogo
              id="offbroadway"
              src={logoOffBroadway}
              alt="Off Broadway"
              initialX={220}
              initialY={300}
              height="h-10"
            />
            
            <DraggableLogo
              id="skillsoft"
              src={logoSkillsoft}
              alt="Skillsoft"
              initialX={480}
              initialY={330}
              height="h-12"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
