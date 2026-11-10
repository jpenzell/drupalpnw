// STAGED — Deno-only wiring for guarded legacy functions (imported by gate/functions/<paid>/index.ts).
import { runtimeDeps } from "./runtime.ts";
import { denyWithoutAccess } from "./interactiveGuard.ts";

const ORIGINS = (Deno.env.get("PNW2_ALLOWED_ORIGINS") ?? "https://drupalpnw.lovable.app")
  .split(",").map((s) => s.trim()).filter(Boolean);

/** Static CORS origin for the legacy corsHeaders constants (first allowed origin). */
export const PNW2_CORS_ORIGIN = ORIGINS[0];

export function denyWithoutInteractiveAccess(req: Request): Promise<Response | null> {
  return denyWithoutAccess(req, runtimeDeps());
}
