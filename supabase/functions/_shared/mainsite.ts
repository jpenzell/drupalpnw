// STAGED — MainSite policy service client. Endpoints are fixed to the pinned issuer; never
// taken from a token, header or request. Introspection runs on EVERY protected action, is never
// cached, and anything other than an exact positive answer denies (fail closed).
import type { AccessTokenPolicy, VerifiedAccess } from "./accessToken.ts";

export function mainSiteEndpoints(issuer: string) {
  const u = new URL(issuer);
  if (u.protocol !== "https:" || u.pathname !== "/" || u.search || u.hash || u.username || u.port) {
    throw new Error("issuer must be a bare https origin");
  }
  return {
    jwks: `${u.origin}/api/drupal-access/jwks`,
    introspect: `${u.origin}/api/drupal-access/introspect`,
  };
}

export type IntrospectResult = { active: true } | { active: false; reason: "inactive" | "mismatch" | "unavailable" };

type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

/** POST {issuer}/api/drupal-access/introspect with Authorization: Bearer <token>. */
export async function introspect(
  token: string,
  access: VerifiedAccess,
  policy: AccessTokenPolicy,
  fetchImpl: FetchLike,
  timeoutMs = 3000,
): Promise<IntrospectResult> {
  let res: Response;
  try {
    res = await fetchImpl(mainSiteEndpoints(policy.issuer).introspect, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return { active: false, reason: "unavailable" };
  }
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return { active: false, reason: res.ok ? "unavailable" : "inactive" };
  }
  if (res.status === 401) return { active: false, reason: "inactive" }; // MainSite: invalid token
  if (!res.ok || !body || typeof body !== "object") return { active: false, reason: "unavailable" };
  const b = body as Record<string, unknown>;
  if (b.active !== true) return { active: false, reason: "inactive" };
  const scope = b.scope;
  if (
    typeof b.sub !== "string" || b.sub.toLowerCase() !== access.sub ||
    b.policy_version !== policy.policyVersion ||
    !Array.isArray(scope) || !scope.includes("slides:interact")
  ) {
    return { active: false, reason: "mismatch" };
  }
  return { active: true };
}
