// STAGED — copied into supabase/functions/_shared/ only at activation (gate/README.md).
// Verifies a MainSite-issued attendee access token (compact JWS) with WebCrypto only, so the
// same code runs in Deno (edge functions) and Bun (tests) with no dependencies.

export interface PublicJwk extends JsonWebKey {
  kid?: string;
  alg?: string;
}

export interface AccessTokenPolicy {
  issuer: string; // exact string match
  audience: string; // exact string match (array audiences are rejected)
  scope: Record<string, string>; // e.g. { presentation: "16460", workshop: "9503" } — all required
  maxLifetimeSeconds: number; // exp - iat ceiling (300 = five minutes)
  clockSkewSeconds: number; // tolerance for iat/nbf in the future only; exp gets none
  allowedAlgs: ReadonlyArray<"EdDSA" | "ES256">;
}

export interface VerifiedAccess {
  sub: string;
  jti: string;
  exp: number; // seconds since epoch — the grant can never outlive this
  iat: number;
  kid: string;
  scope: Record<string, string>;
  sessionCode?: string;
}

export type AccessError =
  | "malformed"
  | "unsupported_alg"
  | "unknown_kid"
  | "bad_signature"
  | "wrong_issuer"
  | "wrong_audience"
  | "wrong_scope"
  | "invalid_timestamps"
  | "not_yet_valid"
  | "expired"
  | "lifetime_too_long"
  | "missing_claims"
  | "personal_data_in_token";

export class AccessTokenError extends Error {
  constructor(public code: AccessError) {
    super(code);
  }
}

// Claims that would mean personal data travelled in the token; MainSite agreed not to send them.
const FORBIDDEN_CLAIMS = ["email", "name", "given_name", "family_name", "phone_number", "preferred_username"];

function b64urlToBytes(s: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) throw new AccessTokenError("malformed");
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  let bin: string;
  try {
    bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  } catch {
    throw new AccessTokenError("malformed");
  }
  const out = new Uint8Array(bin.length);
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

async function importKey(jwk: PublicJwk, alg: "EdDSA" | "ES256"): Promise<CryptoKey> {
  // Only public members are passed to WebCrypto; a JWK carrying "d" (private) is refused.
  if ("d" in jwk) throw new AccessTokenError("unknown_kid");
  if (alg === "EdDSA") {
    if (jwk.kty !== "OKP" || jwk.crv !== "Ed25519" || typeof jwk.x !== "string") throw new AccessTokenError("unknown_kid");
    return crypto.subtle.importKey("jwk", { kty: "OKP", crv: "Ed25519", x: jwk.x }, { name: "Ed25519" }, false, ["verify"]);
  }
  if (jwk.kty !== "EC" || jwk.crv !== "P-256" || typeof jwk.x !== "string" || typeof jwk.y !== "string") {
    throw new AccessTokenError("unknown_kid");
  }
  return crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", x: jwk.x, y: jwk.y },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"],
  );
}

const isTimestamp = (x: unknown): x is number => typeof x === "number" && Number.isSafeInteger(x) && x > 0;
const isShortString = (x: unknown, max = 200): x is string => typeof x === "string" && x.length > 0 && x.length <= max;

export async function verifyAccessToken(
  token: string,
  jwks: { keys: PublicJwk[] },
  policy: AccessTokenPolicy,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<VerifiedAccess> {
  if (typeof token !== "string" || token.length === 0 || token.length > 4096) throw new AccessTokenError("malformed");
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((p) => p.length === 0)) throw new AccessTokenError("malformed");
  const [h, p, s] = parts;

  const header = parseJson(b64urlToBytes(h));
  const alg = header.alg;
  // The algorithm must be on our allow-list ("none" and HS256 are never accepted).
  if (typeof alg !== "string" || !(policy.allowedAlgs as ReadonlyArray<string>).includes(alg)) {
    throw new AccessTokenError("unsupported_alg");
  }
  if ("crit" in header || "jku" in header || "x5u" in header || "jwk" in header) throw new AccessTokenError("malformed");
  if (header.typ !== undefined && header.typ !== "JWT") throw new AccessTokenError("malformed");
  const kid = header.kid;
  if (!isShortString(kid)) throw new AccessTokenError("unknown_kid");
  const jwk = jwks.keys.find((k) => k.kid === kid);
  if (!jwk) throw new AccessTokenError("unknown_kid");
  if (jwk.alg !== undefined && jwk.alg !== alg) throw new AccessTokenError("unsupported_alg");

  const key = await importKey(jwk, alg as "EdDSA" | "ES256");
  const data = new TextEncoder().encode(`${h}.${p}`);
  const sig = b64urlToBytes(s);
  const ok =
    alg === "EdDSA"
      ? await crypto.subtle.verify({ name: "Ed25519" }, key, sig, data)
      : await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, sig, data);
  if (!ok) throw new AccessTokenError("bad_signature");

  const c = parseJson(b64urlToBytes(p));
  for (const f of FORBIDDEN_CLAIMS) if (f in c) throw new AccessTokenError("personal_data_in_token");

  if (typeof c.iss !== "string" || c.iss !== policy.issuer) throw new AccessTokenError("wrong_issuer");
  if (typeof c.aud !== "string" || c.aud !== policy.audience) throw new AccessTokenError("wrong_audience");
  for (const [k, v] of Object.entries(policy.scope)) {
    const claim = c[k];
    const asText = typeof claim === "string" ? claim : Number.isSafeInteger(claim) ? String(claim) : null;
    if (asText !== v) throw new AccessTokenError("wrong_scope");
  }

  const { sub, jti, exp, iat, nbf } = c;
  if (!isShortString(sub) || !isShortString(jti)) throw new AccessTokenError("missing_claims");
  if (!isTimestamp(iat) || !isTimestamp(exp)) throw new AccessTokenError("invalid_timestamps");
  if (nbf !== undefined && !isTimestamp(nbf)) throw new AccessTokenError("invalid_timestamps");
  if (exp <= iat) throw new AccessTokenError("invalid_timestamps");
  if (nbf !== undefined && (nbf < iat || nbf >= exp)) throw new AccessTokenError("invalid_timestamps");
  if (exp - iat > policy.maxLifetimeSeconds) throw new AccessTokenError("lifetime_too_long");
  if (iat > nowSeconds + policy.clockSkewSeconds) throw new AccessTokenError("not_yet_valid");
  if (nbf !== undefined && nbf > nowSeconds + policy.clockSkewSeconds) throw new AccessTokenError("not_yet_valid");
  if (exp <= nowSeconds) throw new AccessTokenError("expired");

  let sessionCode: string | undefined;
  if (c.session_code !== undefined) {
    if (typeof c.session_code !== "string" || !/^[A-Za-z0-9]{4,8}$/.test(c.session_code)) {
      throw new AccessTokenError("malformed");
    }
    sessionCode = c.session_code.toUpperCase();
  }

  const scope: Record<string, string> = {};
  for (const k of Object.keys(policy.scope)) scope[k] = policy.scope[k];
  return { sub, jti, exp, iat, kid, scope, sessionCode };
}

/** Grant expiry is pinned to the token's own exp — never extended without a fresh verified token. */
export function grantExpiry(access: VerifiedAccess): Date {
  return new Date(access.exp * 1000);
}

export async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Server-derived response identity: stable per lead + presentation, never chosen by the client. */
export async function participantKey(issuer: string, access: VerifiedAccess): Promise<string> {
  const input = `${issuer}|${access.sub}|${access.scope.presentation ?? ""}|${access.scope.workshop ?? ""}`;
  return "lead_" + (await sha256Hex(input)).slice(0, 32);
}

export const PNW2_POLICY: AccessTokenPolicy = {
  issuer: "https://www.joshpenzell.com",
  audience: "pnw2-interactive",
  scope: { presentation: "16460", workshop: "9503" },
  maxLifetimeSeconds: 300,
  clockSkewSeconds: 60,
  allowedAlgs: ["EdDSA", "ES256"],
};
