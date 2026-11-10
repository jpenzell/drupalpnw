// STAGED — Deno-only: builds GateDeps from the function environment.
// Fixed endpoints derive from the pinned issuer (never from env, tokens or requests):
//   JWKS        GET  https://www.joshpenzell.com/api/drupal-access/jwks
//   introspect  POST https://www.joshpenzell.com/api/drupal-access/introspect (Bearer token)
// Config: PRESENTATION_PASSWORD (exists today); optional PNW2_ALLOWED_ORIGINS (comma list,
// default https://drupalpnw.lovable.app). No MainSite secret is needed (no shared secret).
import { createClient } from "npm:@supabase/supabase-js@2";
import { PNW2_POLICY, type PublicJwk } from "./accessToken.ts";
import type { GateDeps } from "./gateHttp.ts";
import { introspect, mainSiteEndpoints } from "./mainsite.ts";

let cached: GateDeps | null = null;
// Public KEYS may be cached briefly; authorization (introspection) never is.
let jwksCache: { at: number; keys: PublicJwk[] } | null = null;

async function fetchJwks(): Promise<{ keys: PublicJwk[] }> {
  if (jwksCache && Date.now() - jwksCache.at < 5 * 60_000) return { keys: jwksCache.keys };
  const r = await fetch(mainSiteEndpoints(PNW2_POLICY.issuer).jwks, {
    headers: { accept: "application/json" },
    redirect: "error",
    signal: AbortSignal.timeout(3000),
  });
  if (!r.ok) {
    await r.body?.cancel();
    throw new Error("jwks_unavailable");
  }
  const body = await r.json();
  const keys = Array.isArray(body?.keys) ? (body.keys as PublicJwk[]) : [];
  jwksCache = { at: Date.now(), keys };
  return { keys };
}

export function runtimeDeps(): GateDeps {
  if (cached) return cached;
  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const anon = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { auth: { persistSession: false } });
  cached = {
    admin,
    async getUserId(bearer: string) {
      const { data, error } = await anon.auth.getClaims(bearer);
      const sub = data?.claims?.sub;
      return !error && typeof sub === "string" && data?.claims?.role === "authenticated" ? sub : null;
    },
    jwks: fetchJwks,
    introspect: (token, access) => introspect(token, access, PNW2_POLICY, fetch),
    policy: PNW2_POLICY,
    allowedOrigins: (Deno.env.get("PNW2_ALLOWED_ORIGINS") ?? "https://drupalpnw.lovable.app")
      .split(",").map((s) => s.trim()).filter(Boolean),
    presentationPassword: Deno.env.get("PRESENTATION_PASSWORD") ?? undefined,
    now: () => Math.floor(Date.now() / 1000),
  };
  return cached;
}
