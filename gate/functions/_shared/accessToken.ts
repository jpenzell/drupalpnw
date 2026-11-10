// STAGED — not deployed. Copied into supabase/functions/_shared/ only at activation.
// Verifies a MainSite-issued attendee access token (compact JWS) using WebCrypto only,
// so the same code runs in Deno (edge functions) and Bun (tests) with no dependencies.

export interface PublicJwk extends JsonWebKey {
  kid?: string;
  alg?: string;
}

export interface AccessTokenPolicy {
  issuer: string; // exact match
  audience: string; // exact match (string or member of array claim)
  scope: Record<string, string>; // e.g. { presentation: "16460", workshop: "9503" }
  maxLifetimeSeconds: number; // exp - iat ceiling (300 = five minutes)
  clockSkewSeconds: number;
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
const FORBIDDEN_CLAIMS = ["email", "name", "given_name", "family_name", "phone_number"];

function b64urlToBytes(s: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) throw new AccessTokenError("malformed");
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function parseJson(bytes: Uint8Array): Record<string, unknown> {
  try {
    const v = JSON.parse(new TextDecoder().decode(bytes));
    if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error();
    return v as Record<string, unknown>;
  } catch {
    throw new AccessTokenError("malformed");
  }
}

async function importKey(jwk: PublicJwk, alg: "EdDSA" | "ES256"): Promise<CryptoKey> {
  const { kid: _k, alg: _a, ...raw } = jwk;
  if (alg === "EdDSA") {
    if (raw.kty !== "OKP" || raw.crv !== "Ed25519") throw new AccessTokenError("unknown_kid");
    return crypto.subtle.importKey("jwk", raw, { name: "Ed25519" }, false, ["verify"]);
  }
  if (raw.kty !== "EC" || raw.crv !== "P-256") throw new AccessTokenError("unknown_kid");
  return crypto.subtle.importKey("jwk", raw, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
}

export async function verifyAccessToken(
  token: string,
  jwks: { keys: PublicJwk[] },
  policy: AccessTokenPolicy,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<VerifiedAccess> {
  if (typeof token !== "string" || token.length > 4096) throw new AccessTokenError("malformed");
  const parts = token.split(".");
  if (parts.length !== 3) throw new AccessTokenError("malformed");
  const [h, p, s] = parts;

  const header = parseJson(b64urlToBytes(h));
  const alg = header.alg;
  // The algorithm comes from our allow-list, never trusted from the token alone ("none", HS256 refused).
  if (typeof alg !== "string" || !(policy.allowedAlgs as ReadonlyArray<string>).includes(alg)) {
    throw new AccessTokenError("unsupported_alg");
  }
  const kid = header.kid;
  if (typeof kid !== "string" || !kid) throw new AccessTokenError("unknown_kid");
  const jwk = jwks.keys.find((k) => k.kid === kid);
  if (!jwk) throw new AccessTokenError("unknown_kid");
  if (jwk.alg && jwk.alg !== alg) throw new AccessTokenError("unsupported_alg");

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

  if (c.iss !== policy.issuer) throw new AccessTokenError("wrong_issuer");
  const aud = c.aud;
  const audOk = aud === policy.audience || (Array.isArray(aud) && aud.includes(policy.audience));
  if (!audOk) throw new AccessTokenError("wrong_audience");
  for (const [k, v] of Object.entries(policy.scope)) {
    if (c[k] === undefined || String(c[k]) !== v) throw new AccessTokenError("wrong_scope");
  }

  const { sub, jti, exp, iat } = c;
  if (typeof sub !== "string" || !sub || typeof jti !== "string" || !jti) throw new AccessTokenError("missing_claims");
  if (typeof exp !== "number" || typeof iat !== "number") throw new AccessTokenError("missing_claims");
  if (exp - iat > policy.maxLifetimeSeconds) throw new AccessTokenError("lifetime_too_long");
  const nbf = typeof c.nbf === "number" ? c.nbf : iat;
  if (nbf - policy.clockSkewSeconds > nowSeconds) throw new AccessTokenError("not_yet_valid");
  if (exp + policy.clockSkewSeconds <= nowSeconds) throw new AccessTokenError("expired");

  const scope: Record<string, string> = {};
  for (const k of Object.keys(policy.scope)) scope[k] = String(c[k]);
  const sessionCode = typeof c.session_code === "string" ? c.session_code.toUpperCase() : undefined;
  return { sub, jti, exp, iat, kid, scope, sessionCode };
}

/** Grant expiry is pinned to the token's own exp — never extended without a fresh verified token. */
export function grantExpiry(access: VerifiedAccess): Date {
  return new Date(access.exp * 1000);
}

/** Server-derived response identity: stable per lead + presentation, never chosen by the client. */
export async function participantKey(issuer: string, access: VerifiedAccess): Promise<string> {
  const input = `${issuer}|${access.sub}|${access.scope.presentation ?? ""}|${access.scope.workshop ?? ""}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return "lead_" + [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

export const PNW2_POLICY: AccessTokenPolicy = {
  issuer: "https://www.joshpenzell.com",
  audience: "pnw2-interactive",
  scope: { presentation: "16460", workshop: "9503" },
  maxLifetimeSeconds: 300,
  clockSkewSeconds: 60,
  allowedAlgs: ["EdDSA", "ES256"],
};
