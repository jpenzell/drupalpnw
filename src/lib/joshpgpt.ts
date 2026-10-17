// JoshPGPT SDK wrapper for React
// Based on: https://joshpenzell.com/joshp-gpt-sdk.js

const BASE_URL = "https://joshpenzell.com";
const SDK_URL = `${BASE_URL}/joshp-gpt-sdk.js`;

// Presentation ID removed - can add later if needed

interface JoshPGPTInstance {
  init(): Promise<void>;
  send(message: string, options?: { stream?: boolean; onChunk?: (chunk: string) => void }): Promise<{ content: string }>;
  setVisitor(info: { email?: string; name?: string }): void;
  getHistory(): Array<{ role: string; content: string }>;
  clearHistory(): void;
}

interface JoshPGPTConstructor {
  new (options: { baseUrl: string; presentationId?: string }): JoshPGPTInstance;
}

declare global {
  interface Window {
    JoshPGPT?: JoshPGPTConstructor;
  }
}

let sdkLoaded = false;
let sdkLoadPromise: Promise<void> | null = null;

export async function loadJoshPGPTSDK(): Promise<void> {
  if (sdkLoaded) return;
  
  if (sdkLoadPromise) return sdkLoadPromise;
  
  sdkLoadPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.JoshPGPT) {
      sdkLoaded = true;
      resolve();
      return;
    }
    
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    
    script.onload = () => {
      sdkLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      sdkLoadPromise = null;
      reject(new Error("Failed to load JoshPGPT SDK"));
    };
    
    document.head.appendChild(script);
  });
  
  return sdkLoadPromise;
}

let chatInstance: JoshPGPTInstance | null = null;

export async function getJoshPGPTInstance(): Promise<JoshPGPTInstance> {
  await loadJoshPGPTSDK();
  
  if (!window.JoshPGPT) {
    throw new Error("JoshPGPT SDK not available");
  }
  
  if (!chatInstance) {
    chatInstance = new window.JoshPGPT({
      baseUrl: BASE_URL,
    });
    await chatInstance.init();
  }
  
  return chatInstance;
}

export function resetJoshPGPTInstance(): void {
  if (chatInstance) {
    chatInstance.clearHistory();
  }
  chatInstance = null;
}
