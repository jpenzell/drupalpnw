import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const HEADSHOT_STORAGE_URL =
  "https://wxgdptvgerwudxhihkzn.supabase.co/storage/v1/object/public/era-images/josh-headshot.jpeg";

// Preload + decode every deck image before rendering the app so the audience
// never sees a slide-by-slide image load. Vite's import.meta.glob with
// eager:true inlines bundled asset URLs at build time.
const assetModules = import.meta.glob(
  "/src/assets/**/*.{png,jpg,jpeg,webp,gif,svg,avif}",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const deckImageCache: HTMLImageElement[] = [];

const getDeckImageUrls = () => {
  const bundled = Object.values(assetModules);
  const external = [HEADSHOT_STORAGE_URL];
  return [...new Set([...bundled, ...external].filter(Boolean))];
};

const preloadDeckImage = (href: string) =>
  new Promise<void>((resolve) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = href;
    (link as any).fetchPriority = "high";
    document.head.appendChild(link);

    const img = new Image();
    deckImageCache.push(img);
    img.onload = () => {
      if (img.decode) {
        img.decode().then(() => resolve()).catch(() => resolve());
      } else {
        resolve();
      }
    };
    img.onerror = () => resolve();
    img.src = href;
  });

const preloadDeckImages = () => Promise.allSettled(getDeckImageUrls().map(preloadDeckImage));

const renderApp = () => {
  createRoot(document.getElementById("root")!).render(<App />);
};

if (typeof window !== "undefined") {
  preloadDeckImages().finally(renderApp);
} else {
  renderApp();
}
