// STAGED — copied into supabase/functions/_shared/ only at activation (gate/README.md).
// Verifies a MainSite attendee token exactly per the final contract (MainSite candidate
// 9f83abd4, src server/drupalContact signer): EdDSA/Ed25519 only, fixed issuer, audience,
// event ids, scope, policy version, sub === jti (opaque capture UUID), <= 300 s lifetime.
// WebCrypto only, so it runs unchanged in Deno (edge) and Bun (tests).

export interface PublicJwk extends JsonWebKey {
  kid?: string;
  alg?: string;
}

export interface AccessTokenPolicy {
  issuer: string; // exact string
  audience: string; // exact string
  presentationId: number; // exact integer
  workshopId: number; // exact integer
  scope: readonly string[]; // exact set, as MainSite issues it
  policyVersion: number; // exact integer
  maxLifetimeSeconds: number; // exp - iat ceiling
  clockSkewSeconds: number; // tolerance for iat/nbf ahead of our clock only; exp gets none
}

export interface VerifiedAccess {
  sub: string; // capture grant UUID (== jti); reusable for the token's lifetime
  exp: number; // seconds since epoch — nothing derived from this token outlives it
  iat: number;
  kid: string;
}

export type AccessError =
  | "malformed"
  | "unsupported_alg"
  | "unknown_kid"
  | "bad_signature"
  | "wrong_issuer"
  | "wrong_audience"
  | "wrong_event"
  | "wrong_scope"
  | "wrong_policy"
  | "invalid_timestamps"
  | "not_yet_valid"
  | "expired"
  | "lifetime_too_long"
  | "invalid_subject"
  | "personal_data_in_token";

export class AccessTokenError extends Error {
  constructor(public code: AccessError) {
    super(code);
  }
}

// MainSite agreed to send no PII; reject outright if any appears.
const FORBIDDEN_CLAIMS = ["email", "name", "given_name", "family_name", "phone_number", "preferred_username", "consent", "consentMarketing", "company", "role"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function b64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  if (!/^[A-Za-z0-9_-]+$/.test(s)) throw new AccessTokenError("malformed");
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  let bin: string;
  try {
    bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  } catch {
    throw new AccessTokenError("malformed");
  }
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function parseJson(bytes: Uint8Array): Record<string, unknown> {
  try {
    const v = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error();
    return v as Record<string, unknown>;
  } catch {
    throw new AccessTokenError("malformed");
  }
}

const isTimestamp = (x: unknown): x is number => typeof x === "number" && Number.isSafeInteger(x) && x > 0;

/** Routing hint only (never authorization): does this bearer look like an EdDSA MainSite token? */
export function looksLikeMainSiteToken(bearer: string): boolean {
  try {
    const h = parseJson(b64urlToBytes(bearer.split(".")[0] ?? ""));
    return h.alg === "EdDSA";
  } catch {
    return false;
  }
}

export async function verifyAccessToken(
  token: string,
  jwks: { keys: PublicJwk[] },
  policy: AccessTokenPolicy,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<VerifiedAccess> {
  if (typeof token !== "string" || token.length === 0 || token.length > 4096) throw new AccessTokenError("malformed");
  const parts = token.split(".");
  if (parts.length !== 3) throw new AccessTokenError("malformed");
  const [h, p, s] = parts;

  const header = parseJson(b64urlToBytes(h));
  if (header.alg !== "EdDSA") throw new AccessTokenError("unsupported_alg"); // pinned: no ES256, HS256, none
  for (const k of ["crit", "jku", "x5u", "jwk", "x5c"]) if (k in header) throw new AccessTokenError("malformed");
  if (header.typ !== undefined && header.typ !== "JWT") throw new AccessTokenError("malformed");
  const kid = header.kid;
  if (typeof kid !== "string" || kid.length === 0 || kid.length > 128) throw new AccessTokenError("unknown_kid");
  const jwk = jwks.keys.find((k) => k.kid === kid);
  if (!jwk) throw new AccessTokenError("unknown_kid");
  if ((jwk.alg !== undefined && jwk.alg !== "EdDSA") || jwk.kty !== "OKP" || jwk.crv !== "Ed25519" ||
      typeof jwk.x !== "string" || "d" in jwk) {
    throw new AccessTokenError("unknown_kid");
  }
  const key = await crypto.subtle.importKey("jwk", { kty: "OKP", crv: "Ed25519", x: jwk.x }, { name: "Ed25519" }, false, ["verify"]);
  const ok = await crypto.subtle.verify({ name: "Ed25519" }, key, b64urlToBytes(s), new TextEncoder().encode(`${h}.${p}`));
  if (!ok) throw new AccessTokenError("bad_signature");

  const c = parseJson(b64urlToBytes(p));
  for (const f of FORBIDDEN_CLAIMS) if (f in c) throw new AccessTokenError("personal_data_in_token");

  if (c.iss !== policy.issuer) throw new AccessTokenError("wrong_issuer");
  if (c.aud !== policy.audience) throw new AccessTokenError("wrong_audience"); // string only, no arrays
  if (c.presentation_id !== policy.presentationId || c.workshop_id !== policy.workshopId) {
    throw new AccessTokenError("wrong_event"); // integers, exact (a "16460" string is refused)
  }
  const scope = c.scope;
  if (!Array.isArray(scope) || scope.length !== policy.scope.length || !scope.every((x) => typeof x === "string") ||
      new Set(scope).size !== scope.length || !policy.scope.every((x) => scope.includes(x))) {
    throw new AccessTokenError("wrong_scope");
  }
  if (c.policy_version !== policy.policyVersion) throw new AccessTokenError("wrong_policy");
  if (typeof c.sub !== "string" || !UUID.test(c.sub) || c.jti !== c.sub) throw new AccessTokenError("invalid_subject");

  const { iat, nbf, exp } = c;
  if (!isTimestamp(iat) || !isTimestamp(nbf) || !isTimestamp(exp)) throw new AccessTokenError("invalid_timestamps");
  if (exp <= iat || nbf < iat || nbf >= exp) throw new AccessTokenError("invalid_timestamps");
  if (exp - iat > policy.maxLifetimeSeconds) throw new AccessTokenError("lifetime_too_long");
  if (iat > nowSeconds + policy.clockSkewSeconds || nbf > nowSeconds + policy.clockSkewSeconds) {
    throw new AccessTokenError("not_yet_valid");
  }
  if (exp <= nowSeconds) throw new AccessTokenError("expired");

  return { sub: c.sub.toLowerCase(), exp, iat, kid };
}

export async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Server-derived response identity: stable per MainSite capture + event, never client-chosen. */
export async function participantKey(policy: AccessTokenPolicy, access: VerifiedAccess): Promise<string> {
  return "lead_" + (await sha256Hex(`${policy.issuer}|${access.sub}|${policy.presentationId}|${policy.workshopId}`)).slice(0, 32);
}

export const MAINSITE_ISSUER = "https://www.joshpenzell.com";

export const PNW2_POLICY: AccessTokenPolicy = {
  issuer: MAINSITE_ISSUER,
  audience: "pnw2:e10466e1-025e-4530-8f10-a62efb7a9ea8",
  presentationId: 16460,
  workshopId: 9503,
  scope: ["slides:interact", "session:qa"],
  policyVersion: 1,
  maxLifetimeSeconds: 300,
  clockSkewSeconds: 30,
};
