// Synthetic signing keys and tokens for tests only — shaped exactly like MainSite's signer
// (candidate 9f83abd4): header {alg:"EdDSA",kid,typ:"JWT"}; claims as below. Never talks to MainSite.
import type { PublicJwk } from "../functions/_shared/accessToken.ts";

export const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");

export async function keypair(kid: string) {
  const kp = (await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"])) as CryptoKeyPair;
  const jwk = { ...(await crypto.subtle.exportKey("jwk", kp.publicKey)), kid, use: "sig", alg: "EdDSA" } as PublicJwk;
  const sign = async (header: object, claims: object) => {
    const data = `${enc(header)}.${enc(claims)}`;
    const sig = await crypto.subtle.sign({ name: "Ed25519" }, kp.privateKey, new TextEncoder().encode(data));
    return `${data}.${Buffer.from(sig).toString("base64url")}`;
  };
  return { jwk, sign, header: { alg: "EdDSA", kid, typ: "JWT" } };
}

export function claims(now: number, o: Record<string, unknown> = {}) {
  const id = (o.sub as string | undefined) ?? crypto.randomUUID();
  return {
    iss: "https://www.joshpenzell.com",
    aud: "pnw2:e10466e1-025e-4530-8f10-a62efb7a9ea8",
    sub: id,
    jti: id,
    presentation_id: 16460,
    workshop_id: 9503,
    scope: ["slides:interact", "session:qa"],
    policy_version: 1,
    iat: now,
    nbf: now,
    exp: now + 300,
    ...o,
  };
}
