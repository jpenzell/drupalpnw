import { ReactNode, useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Info, ZoomIn, ZoomOut, Maximize2, Play, RotateCcw, X, Settings, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { ModeSelector } from "@/components/ModeSelector";
import { FitToStage } from "@/components/FitToStage";
import { SessionQRCode } from "@/components/SessionQRCode";
import { useSession } from "@/contexts/SessionContext";
import { usePresentationMode } from "@/contexts/PresentationModeContext";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface PresentationLayoutProps {
  children: ReactNode;
  currentScreen: string;
  totalScreens: number;
  currentIndex: number;
  onNavigate: (index: number) => void;
  title: string;
  duration?: number;
  notes?: string;
  mode?: "presenter" | "participant" | "present";
}

export const PresentationLayout = ({
  children,
  currentScreen,
  totalScreens,
  currentIndex,
  onNavigate,
  title,
  duration = 60,
  notes,
  mode = "presenter",
}: PresentationLayoutProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBlackout, setIsBlackout] = useState(false);
  const [hideChrome, setHideChrome] = useState(false);

  const { session, createSession, endSession, updateSlide, isPresenter: hasSession } = useSession();
  const { presentationTitle } = usePresentationMode();
  const [isRestarting, setIsRestarting] = useState(false);

  // Accessibility / projector color themes. Persist across reloads.
  type PresTheme = "default" | "high-contrast" | "dark" | "colorblind";
  const THEMES: { id: PresTheme; label: string; hint: string }[] = [
    { id: "default", label: "Light room", hint: "Dark ink on white — projector default" },
    { id: "dark", label: "Dark stage", hint: "Deep navy stage — dark rooms only" },
    { id: "high-contrast", label: "High contrast", hint: "Black + yellow — washed-out projectors" },
    { id: "colorblind", label: "Colorblind-safe", hint: "Blue + orange (Wong palette)" },
  ];

  const [presTheme, setPresTheme] = useState<PresTheme>(() => {
    if (typeof window === "undefined") return "default";
    const stored = localStorage.getItem("pres-theme") as PresTheme | "light" | null;
    if (!stored || stored === "light") return "default";
    return stored as PresTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (presTheme === "default") root.removeAttribute("data-pres-theme");
    else root.setAttribute("data-pres-theme", presTheme);
    try { localStorage.setItem("pres-theme", presTheme); } catch {}
  }, [presTheme]);
  const cycleTheme = () => {
    const ids = THEMES.map((t) => t.id);
    const next = ids[(ids.indexOf(presTheme) + 1) % ids.length];
    setPresTheme(next);
    toast.success(`Theme: ${THEMES.find((t) => t.id === next)!.label}`);
  };

  const handleRestart = async () => {
    setIsRestarting(true);
    await endSession(true);
    await createSession();
    setIsRestarting(false);
    toast.success("New session started!");
  };

  const isPresenter = mode === "presenter";
  const isPresent = mode === "present";
  // Fullscreen and `h` must both remove presenter chrome completely so the
  // mirrored slide gets the full viewport instead of invisible reserved bars.
  const chromeless = isPresent || (isPresenter && (isFullscreen || hideChrome));
  const requestedScale = zoom / 100;

  // Fixed 1920×1080 presentation stage, scaled to fit available area.
  // Same scaling math in preview, fullscreen, and projector output —
  // so what you see in the editor is exactly what the audience sees.
  const stageHostRef = useRef<HTMLElement | null>(null);
  const [stageScale, setStageScale] = useState(1);
  useLayoutEffect(() => {
    const host = stageHostRef.current;
    if (!host) return;
    const update = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      setStageScale(Math.min(w / 1920, h / 1080));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(host);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [chromeless]);

  useEffect(() => {
    if (isPresenter && session) {
      updateSlide(currentScreen);
    }
  }, [currentScreen, isPresenter, session, updateSlide]);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const progress = (currentIndex / (totalScreens - 1)) * 100;
  const timeProgress = (elapsedTime / duration) * 100;

  // Dispatch a synthetic arrow keydown so per-slide reveal handlers
  // (useReveal, custom stage handlers) can intercept and step through
  // their own builds. If nothing intercepts, fall back to slide nav.
  const navigatePrevious = () => {
    const ev = new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true });
    const notHandled = window.dispatchEvent(ev);
    if (notHandled && currentIndex > 0) onNavigate(currentIndex - 1);
  };

  const navigateNext = () => {
    const ev = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true });
    const notHandled = window.dispatchEvent(ev);
    if (notHandled && currentIndex < totalScreens - 1) onNavigate(currentIndex + 1);
  };


  const handleKeyPress = (e: KeyboardEvent) => {
    if (!isPresenter) return;
    const target = e.target as HTMLElement;
    const tag = target?.tagName;
    const isTextInput =
      (tag === "INPUT" &&
        !["checkbox", "radio", "button", "submit", "range"].includes(
          (target as HTMLInputElement).type,
        )) ||
      tag === "TEXTAREA" ||
      target?.isContentEditable;
    const isSlider = target?.closest?.('[role="slider"]') !== null;

    if (e.key === " ") {
      // Space toggles a typing input — don't hijack
      if (!isTextInput) {
        e.preventDefault();
        navigateNext();
      }
    } else if (e.key === "ArrowRight") {
      if (isSlider) return;
      e.preventDefault();
      if (isTextInput) (target as HTMLElement).blur();
      // Real key: reveal handlers already had their capture-phase shot via
      // stopImmediatePropagation. If we got here, just move to next slide.
      if (currentIndex < totalScreens - 1) onNavigate(currentIndex + 1);
    } else if (e.key === "ArrowLeft") {
      if (isSlider) return;
      e.preventDefault();
      if (isTextInput) (target as HTMLElement).blur();
      if (currentIndex > 0) onNavigate(currentIndex - 1);

    } else if (e.key === "=" || e.key === "+") {
      if (isTextInput) return;
      e.preventDefault();
      setZoom((prev) => Math.min(prev + 10, 200));
    } else if (e.key === "-") {
      if (isTextInput) return;
      e.preventDefault();
      setZoom((prev) => Math.max(prev - 10, 50));
    } else if (e.key === "0") {
      if (isTextInput) return;
      e.preventDefault();
      setZoom(100);
    } else if (e.key === "b" || e.key === "B") {
      if (isTextInput) return;
      e.preventDefault();
      setIsBlackout((prev) => !prev);
    } else if (e.key === "h" || e.key === "H") {
      if (isTextInput) return;
      e.preventDefault();
      setHideChrome((prev) => !prev);
    } else if (e.key === "t" || e.key === "T") {
      if (isTextInput) return;
      e.preventDefault();
      cycleTheme();
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Error attempting fullscreen:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Reset the chrome override so h behaves predictably in the new mode.
      setHideChrome(false);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, totalScreens, isPresenter, presTheme]);

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const direction = (event as CustomEvent<"next" | "previous">).detail;
      if (direction === "next") navigateNext();
      if (direction === "previous") navigatePrevious();
    };
    window.addEventListener("presentation:navigate", handleNavigate);
    return () => window.removeEventListener("presentation:navigate", handleNavigate);
  }, [currentIndex, totalScreens]);

  return (
    <div className={`${chromeless ? "h-screen overflow-hidden" : "min-h-screen"} w-screen max-w-full overflow-x-hidden bg-gradient-to-br from-background via-background to-muted/20 flex flex-col`}>
      {/* Header */}
      {!chromeless && (
        <header className="border-b bg-card/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-lg font-semibold text-foreground font-display">{presentationTitle}</h1>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {totalScreens}
            </span>
            <ModeSelector currentMode={mode} />

            {isPresenter && !session && (
              <Button variant="outline" size="sm" onClick={createSession} className="gap-2">
                <Play className="h-4 w-4" />
                Start Session
              </Button>
            )}
            {isPresenter && session && (
              <div className="flex items-center gap-2">
                <SessionQRCode />
                <Button variant="ghost" size="sm" onClick={handleRestart} disabled={isRestarting} className="gap-1 text-muted-foreground hover:text-secondary" title="Restart session">
                  <RotateCcw className={`h-3 w-3 ${isRestarting ? "animate-spin" : ""}`} />
                  {isRestarting ? "Restarting..." : "Restart"}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => endSession(false)} className="h-8 w-8 text-muted-foreground hover:text-destructive" title="End session">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 px-2"
                  title="Display theme (press T to cycle)"
                  aria-label="Display theme"
                >
                  <Palette className="h-3.5 w-3.5" />
                  <span className="text-xs hidden md:inline">
                    {THEMES.find((t) => t.id === presTheme)!.label}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Display theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {THEMES.map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => setPresTheme(t.id)}
                    className={presTheme === t.id ? "bg-accent/40" : ""}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{t.label}</span>
                      <span className="text-xs text-muted-foreground">{t.hint}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-[10px] text-muted-foreground">
                  Shortcut: press <kbd className="px-1 bg-muted rounded">T</kbd> to cycle
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-1 border rounded-md px-2 py-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut} disabled={zoom <= 50}>
                <ZoomOut className="h-3 w-3" />
              </Button>
              <span className="text-xs font-mono text-muted-foreground min-w-[3rem] text-center">{zoom}%</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn} disabled={zoom >= 200}>
                <ZoomIn className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>


            <div className="w-32">
              <Progress value={progress} className="h-2" />
            </div>

            {isPresenter && (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => onNavigate(currentIndex - 1)} disabled={currentIndex === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onNavigate(currentIndex + 1)} disabled={currentIndex === totalScreens - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {notes && isPresenter && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon"><Info className="h-4 w-4" /></Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Speaker Notes</SheetTitle>
                    <SheetDescription>Notes for: {currentScreen}</SheetDescription>
                  </SheetHeader>
                  <div className="mt-4 prose prose-sm max-w-none">
                    <p className="text-foreground">{notes}</p>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </header>
      )}

      {isPresenter && !chromeless && <Progress value={timeProgress} className="h-1 rounded-none" />}

      <main
        ref={stageHostRef}
        className="flex-1 min-h-0 w-full max-w-full overflow-hidden flex items-center justify-center bg-muted relative"
      >
        <div
          className="absolute"
          style={{
            width: 1920,
            height: 1080,
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) scale(${stageScale * requestedScale})`,
            transformOrigin: "center center",
            backfaceVisibility: "hidden",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          <div
            className="slide-content w-full h-full flex flex-col overflow-hidden"
            style={{ containerType: "size" } as React.CSSProperties}
          >
            <FitToStage deps={currentScreen}>{children}</FitToStage>
          </div>
        </div>
      </main>


      {isPresenter && !chromeless && (
        <footer className="border-t bg-card/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between shadow-sm">
          <Button variant="outline" size="lg" onClick={() => onNavigate(currentIndex - 1)} disabled={currentIndex === 0} className="font-semibold">
            <ChevronLeft className="h-4 w-4 mr-2" />Previous
          </Button>
          <span className="text-sm font-mono text-muted-foreground bg-muted px-4 py-2 rounded-full">{currentScreen}</span>
          <Button size="lg" onClick={() => onNavigate(currentIndex + 1)} disabled={currentIndex === totalScreens - 1} className="font-semibold">
            Next<ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </footer>
      )}

      {/* Floating zoom pill — only in dedicated Present mode (audience link),
          never when the presenter is mirroring their own screen in fullscreen. */}
      {isPresent && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-card/90 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut} disabled={zoom <= 50}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-mono text-muted-foreground min-w-[3rem] text-center">{zoom}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn} disabled={zoom >= 200}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      )}
      {/* Blackout overlay — press B to toggle */}
      {isBlackout && (
        <div
          className="fixed inset-0 z-[9999] bg-black cursor-none"
          onClick={() => setIsBlackout(false)}
          title="Click or press B to exit blackout"
        />
      )}
    </div>
  );
};
