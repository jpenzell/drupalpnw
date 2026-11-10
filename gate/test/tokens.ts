// Synthetic signing keys and tokens for tests only. Nothing here talks to MainSite.
import type { PublicJwk } from "../functions/_shared/accessToken.ts";

export const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");

export async function keypair(alg: "EdDSA" | "ES256", kid: string) {
  const kp = (alg === "EdDSA"
    ? await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"])
    : await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"])) as CryptoKeyPair;
  const jwk = { ...(await crypto.subtle.exportKey("jwk", kp.publicKey)), kid, alg } as PublicJwk;
  const sign = async (header: object, claims: object) => {
    const data = `${enc(header)}.${enc(claims)}`;
    const bytes = new TextEncoder().encode(data);
    const sig = alg === "EdDSA"
      ? await crypto.subtle.sign({ name: "Ed25519" }, kp.privateKey, bytes)
      : await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, kp.privateKey, bytes);
    return `${data}.${Buffer.from(sig).toString("base64url")}`;
  };
  return { jwk, sign, header: { alg, kid, typ: "JWT" } };
}

export function claims(now: number, o: Record<string, unknown> = {}) {
  return {
    iss: "https://www.joshpenzell.com",
    aud: "pnw2-interactive",
    presentation: "16460",
    workshop: "9503",
    sub: "lead-opaque-1",
    jti: crypto.randomUUID(),
    iat: now,
    exp: now + 300,
    ...o,
  };
}
