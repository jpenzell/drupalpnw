import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const HEADSHOT_STORAGE_URL = "https://wxgdptvgerwudxhihkzn.supabase.co/storage/v1/object/public/era-images/josh-headshot.jpeg";

export const EFFECTS = [
  { id: "cartoon", label: "🎨 Cartoon", color: "bg-yellow-500" },
  { id: "pixar", label: "✨ Pixar", color: "bg-blue-500" },
  { id: "anime", label: "🌸 Anime", color: "bg-pink-500" },
  { id: "pop_art", label: "🎭 Pop Art", color: "bg-red-500" },
  { id: "sketch", label: "✏️ Sketch", color: "bg-gray-500" },
  { id: "wine_sommelier", label: "🍷 Sommelier", color: "bg-primary" },
  { id: "superhero", label: "🦸 Hero", color: "bg-purple-500" },
  { id: "renaissance", label: "🖼️ Classic", color: "bg-amber-700" },
];

interface TransformState {
  currentImage: string | null;
  activeEffect: string | null;
  isTransforming: boolean;
  progress: number;
}

// Singleton cache for preloaded images across components
const preloadCache: Map<string, string> = new Map();
let preloadPromise: Promise<string | null> | null = null;

export const preloadFirstEffect = async (): Promise<string | null> => {
  if (preloadCache.has("cartoon")) {
    return preloadCache.get("cartoon")!;
  }
  
  if (preloadPromise) {
    return preloadPromise;
  }
  
  preloadPromise = (async () => {
    try {
      console.log("[Preload] Starting headshot transform preload...");
      const { data, error } = await supabase.functions.invoke('transform-headshot', {
        body: { imageUrl: HEADSHOT_STORAGE_URL, effect: "cartoon" }
      });
      
      if (error) throw error;
      
      if (data?.imageUrl) {
        // Preload the image into browser cache
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load preloaded image"));
          img.src = data.imageUrl;
        });
        
        preloadCache.set("cartoon", data.imageUrl);
        console.log("[Preload] Headshot transform preloaded successfully");
        return data.imageUrl;
      }
      return null;
    } catch (error) {
      console.error("[Preload] Failed to preload headshot:", error);
      return null;
    } finally {
      preloadPromise = null;
    }
  })();
  
  return preloadPromise;
};

export const getPreloadedImage = (effectId: string): string | null => {
  return preloadCache.get(effectId) || null;
};

export const useHeadshotTransform = (
  imageUrl: string,
  isActive: boolean,
  autoCycleEnabled: boolean = true
) => {
  const [state, setState] = useState<TransformState>({
    currentImage: null,
    activeEffect: null,
    isTransforming: false,
    progress: 0,
  });
  
  const cycleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitializedRef = useRef(false);
  const [isAutoCycling, setIsAutoCycling] = useState(autoCycleEnabled);

  // Apply an effect
  const applyEffect = useCallback(async (effectId: string): Promise<string | null> => {
    if (state.isTransforming) return null;
    
    // Check cache first
    const cached = preloadCache.get(effectId);
    if (cached) {
      setState(prev => ({
        ...prev,
        currentImage: cached,
        activeEffect: effectId,
      }));
      return cached;
    }
    
    setState(prev => ({ ...prev, isTransforming: true, activeEffect: effectId, progress: 0 }));
    
    // Start progress animation
    progressIntervalRef.current = setInterval(() => {
      setState(prev => ({ ...prev, progress: Math.min(prev.progress + 2, 90) }));
    }, 100);
    
    try {
      const { data, error } = await supabase.functions.invoke('transform-headshot', {
        body: { imageUrl, effect: effectId }
      });

      if (error) throw error;
      
      if (data?.imageUrl) {
        // Preload the new image
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = data.imageUrl;
        });
        
        preloadCache.set(effectId, data.imageUrl);
        setState(prev => ({
          ...prev,
          currentImage: data.imageUrl,
          isTransforming: false,
          progress: 100,
        }));
        
        setTimeout(() => setState(prev => ({ ...prev, progress: 0 })), 300);
        return data.imageUrl;
      }
      throw new Error("No image returned");
    } catch (error) {
      console.error('Transform error:', error);
      setState(prev => ({ ...prev, isTransforming: false, progress: 0 }));
      return null;
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  }, [imageUrl, state.isTransforming]);

  // Initialize: show original photo first, then transition to preloaded effect
  useEffect(() => {
    if (isActive && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      // Start with original photo (null means component shows default headshot)
      setState(prev => ({
        ...prev,
        currentImage: null,
        activeEffect: null,
      }));
      
      // After a brief pause, show the first preloaded effect
      const initialDelay = setTimeout(() => {
        const preloaded = getPreloadedImage("cartoon");
        if (preloaded) {
          // Use preloaded image
          setState(prev => ({
            ...prev,
            currentImage: preloaded,
            activeEffect: "cartoon",
          }));
        } else {
          // No preload available, generate first effect
          applyEffect("cartoon");
        }
      }, 800); // Show original briefly before first transform
      
      return () => clearTimeout(initialDelay);
    }
  }, [isActive, applyEffect]);

  // Auto-cycle through effects only when active
  useEffect(() => {
    if (!isActive || !isAutoCycling || state.isTransforming || !state.activeEffect) {
      if (cycleTimeoutRef.current) {
        clearTimeout(cycleTimeoutRef.current);
        cycleTimeoutRef.current = null;
      }
      return;
    }
    
    cycleTimeoutRef.current = setTimeout(() => {
      const currentIndex = EFFECTS.findIndex(e => e.id === state.activeEffect);
      const nextIndex = (currentIndex + 1) % EFFECTS.length;
      applyEffect(EFFECTS[nextIndex].id);
    }, 2500);

    return () => {
      if (cycleTimeoutRef.current) {
        clearTimeout(cycleTimeoutRef.current);
      }
    };
  }, [isActive, isAutoCycling, state.activeEffect, state.isTransforming, applyEffect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cycleTimeoutRef.current) clearTimeout(cycleTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const reset = useCallback((originalImage: string) => {
    setState({
      currentImage: originalImage,
      activeEffect: null,
      isTransforming: false,
      progress: 0,
    });
  }, []);

  return {
    ...state,
    isAutoCycling,
    setIsAutoCycling,
    applyEffect,
    reset,
  };
};
