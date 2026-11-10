// Synthetic keys and tokens only — no network, no live data.
import { test } from "node:test";
import assert from "node:assert/strict";
import { AccessTokenError, PNW2_POLICY, grantExpiry, participantKey, verifyAccessToken } from "./accessToken";

const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
const NOW = 1_800_000_000;

async function keypair(alg: "EdDSA" | "ES256", kid: string) {
  const kp = (alg === "EdDSA"
    ? await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"])
    : await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"])) as CryptoKeyPair;
  const jwk = { ...(await crypto.subtle.exportKey("jwk", kp.publicKey)), kid, alg };
  const sign = async (header: object, claims: object) => {
    const data = `${enc(header)}.${enc(claims)}`;
    const sig = alg === "EdDSA"
      ? await crypto.subtle.sign({ name: "Ed25519" }, kp.privateKey, new TextEncoder().encode(data))
      : await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, kp.privateKey, new TextEncoder().encode(data));
    return `${data}.${Buffer.from(sig).toString("base64url")}`;
  };
  return { jwk, sign };
}

const good = (o: Record<string, unknown> = {}) => ({
  iss: "https://www.joshpenzell.com", aud: "pnw2-interactive", presentation: "16460", workshop: "9503",
  sub: "lead-opaque-1", jti: "jti-1", iat: NOW, exp: NOW + 300, ...o,
});

async function expectCode(p: Promise<unknown>, code: string) {
  await assert.rejects(p, (e: unknown) => e instanceof AccessTokenError && e.code === code);
}

test("accepts a valid EdDSA and ES256 token; grant expires exactly at token exp", async () => {
  for (const alg of ["EdDSA", "ES256"] as const) {
    const k = await keypair(alg, "k1");
    const v = await verifyAccessToken(await k.sign({ alg, kid: "k1" }, good()), { keys: [k.jwk] }, PNW2_POLICY, NOW + 10);
    assert.equal(v.sub, "lead-opaque-1");
    assert.equal(grantExpiry(v).getTime(), (NOW + 300) * 1000);
  }
});

test("rejects wrong issuer, audience, presentation, workshop", async () => {
  const k = await keypair("EdDSA", "k1");
  const keys = { keys: [k.jwk] };
  const h = { alg: "EdDSA", kid: "k1" };
  await expectCode(verifyAccessToken(await k.sign(h, good({ iss: "https://joshpenzell.com" })), keys, PNW2_POLICY, NOW), "wrong_issuer");
  await expectCode(verifyAccessToken(await k.sign(h, good({ aud: "other" })), keys, PNW2_POLICY, NOW), "wrong_audience");
  await expectCode(verifyAccessToken(await k.sign(h, good({ presentation: "1" })), keys, PNW2_POLICY, NOW), "wrong_scope");
  await expectCode(verifyAccessToken(await k.sign(h, good({ workshop: "1" })), keys, PNW2_POLICY, NOW), "wrong_scope");
});

test("rejects tokens living longer than five minutes, expired, or not yet valid", async () => {
  const k = await keypair("EdDSA", "k1");
  const keys = { keys: [k.jwk] };
  const h = { alg: "EdDSA", kid: "k1" };
  await expectCode(verifyAccessToken(await k.sign(h, good({ exp: NOW + 301 })), keys, PNW2_POLICY, NOW), "lifetime_too_long");
  await expectCode(verifyAccessToken(await k.sign(h, good()), keys, PNW2_POLICY, NOW + 300 + 60), "expired");
  await expectCode(verifyAccessToken(await k.sign(h, good({ nbf: NOW + 120 })), keys, PNW2_POLICY, NOW), "not_yet_valid");
});

test("rejects alg none, HS256, unknown kid, tampered signature, personal data", async () => {
  const k = await keypair("EdDSA", "k1");
  const keys = { keys: [k.jwk] };
  const t = await k.sign({ alg: "EdDSA", kid: "k1" }, good());
  await expectCode(verifyAccessToken(`${enc({ alg: "none", kid: "k1" })}.${enc(good())}.`, keys, PNW2_POLICY, NOW), "unsupported_alg");
  await expectCode(verifyAccessToken(`${enc({ alg: "HS256", kid: "k1" })}.${enc(good())}.AAAA`, keys, PNW2_POLICY, NOW), "unsupported_alg");
  await expectCode(verifyAccessToken(await k.sign({ alg: "EdDSA", kid: "k2" }, good()), keys, PNW2_POLICY, NOW), "unknown_kid");
  const [h, , s] = t.split(".");
  await expectCode(verifyAccessToken(`${h}.${enc(good({ sub: "attacker" }))}.${s}`, keys, PNW2_POLICY, NOW), "bad_signature");
  await expectCode(verifyAccessToken(await k.sign({ alg: "EdDSA", kid: "k1" }, good({ email: "a@b.c" })), keys, PNW2_POLICY, NOW), "personal_data_in_token");
});

test("response identity is derived from the lead, not the client", async () => {
  const k = await keypair("EdDSA", "k1");
  const v1 = await verifyAccessToken(await k.sign({ alg: "EdDSA", kid: "k1" }, good({ jti: "a" })), { keys: [k.jwk] }, PNW2_POLICY, NOW);
  const v2 = await verifyAccessToken(await k.sign({ alg: "EdDSA", kid: "k1" }, good({ jti: "b" })), { keys: [k.jwk] }, PNW2_POLICY, NOW);
  assert.equal(await participantKey(PNW2_POLICY.issuer, v1), await participantKey(PNW2_POLICY.issuer, v2));
  assert.match(await participantKey(PNW2_POLICY.issuer, v1), /^lead_[0-9a-f]{32}$/);
});
