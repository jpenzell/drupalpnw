// STAGED — shared HTTP helpers and dependency contract for the gate functions.
// Pure (no Deno globals, no npm imports) so handlers are testable under Bun.
import type { AccessTokenPolicy, PublicJwk, VerifiedAccess } from "./accessToken.ts";
import type { IntrospectResult } from "./mainsite.ts";

export interface RpcResult {
  data: unknown;
  error: { message: string } | null;
}
/** Matches supabase-js `admin.rpc(fn, args)`; tests pass a real local Postgres adapter. */
export interface Rpc {
  rpc(fn: string, args: Record<string, unknown>): PromiseLike<RpcResult>;
}

export interface GateDeps {
  admin: Rpc; // service-role client — the only caller allowed to execute gate_* functions
  getUserId(bearer: string): Promise<string | null>; // verified Lovable Cloud login → user id
  jwks(): Promise<{ keys: PublicJwk[] }>; // fixed {issuer}/api/drupal-access/jwks
  introspect(token: string, access: VerifiedAccess): Promise<IntrospectResult>; // per action, uncached
  policy: AccessTokenPolicy;
  allowedOrigins: string[];
  presentationPassword: string | undefined;
  now(): number; // seconds since epoch
}

export const ALLOW_HEADERS =
  "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version";

export function corsFor(req: Request, allowed: string[]): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0] ?? "null",
    "Access-Control-Allow-Headers": ALLOW_HEADERS,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "private, no-store",
    Vary: "Origin",
  };
}

export function jsonResponse(cors: Record<string, string>, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

/** Browser callers must come from an allowed origin. (Origin is a CORS courtesy, never authorization.) */
export function originAllowed(req: Request, allowed: string[]): boolean {
  const origin = req.headers.get("Origin");
  return origin === null || allowed.includes(origin);
}

const STATUS: Record<string, number> = {
  not_configured: 503,
  maintenance: 503,
  malformed: 400,
  session_inactive: 409,
  poll_not_found: 404,
  wrong_session: 403,
  poll_closed: 409,
  invalid_value: 400,
  invalid_name: 400,
  invalid_word: 400,
  full: 409,
  not_your_turn: 409,
  presenter_required: 403,
  unavailable: 503,
};

/** Maps a `gate:<code>` database exception to a stable client error; anything else is opaque. */
export function mapDbError(message: string): { code: string; status: number } {
  const m = /gate:([a-z_]+)/.exec(message);
  if (m && STATUS[m[1]] !== undefined) return { code: m[1], status: STATUS[m[1]] };
  return { code: "unavailable", status: 503 };
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function bearerOf(req: Request): string | null {
  const a = req.headers.get("Authorization");
  return a && a.startsWith("Bearer ") && a.length > 7 ? a.slice(7) : null;
}

export async function readJson(req: Request, maxBytes = 8192): Promise<Record<string, unknown> | null> {
  const text = await req.text();
  if (text.length > maxBytes) return null;
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
