// Returns a publicly-accessible origin for share links / QR codes.
// The Lovable preview host (id-preview--*.lovable.app) requires a Lovable
// login, so participants scanning a QR there get blocked. We swap any
// preview/dev host for the published production domain.
const PUBLIC_ORIGIN = "https://ispi.lovable.app";

export function getPublicOrigin(): string {
  if (typeof window === "undefined") return PUBLIC_ORIGIN;
  const host = window.location.hostname;
  // Use the live origin only when it's already the published domain,
  // a custom domain, or localhost for dev.
  const isPreview =
    host.includes("preview--") ||
    host.endsWith(".lovable.dev") ||
    host.endsWith(".lovableproject.com");
  if (isPreview) return PUBLIC_ORIGIN;
  return window.location.origin;
}
