// Synthetic keys and tokens only — no network, no live data.
import { test } from "bun:test";
import assert from "node:assert/strict";
import { AccessTokenError, PNW2_POLICY, grantExpiry, participantKey, verifyAccessToken } from "./accessToken.ts";
import { claims, enc, keypair } from "../../test/tokens.ts";

const NOW = 1_800_000_000;
const good = (o: Record<string, unknown> = {}) => claims(NOW, { jti: "jti-1", ...o });

async function expectCode(p: Promise<unknown>, code: string) {
  await assert.rejects(p, (e: unknown) => e instanceof AccessTokenError && (e as AccessTokenError).code === code);
}

async function setup() {
  const k = await keypair("EdDSA", "k1");
  const keys = { keys: [k.jwk] };
  const v = async (o: Record<string, unknown>, at = NOW, header: object = k.header) =>
    verifyAccessToken(await k.sign(header, good(o)), keys, PNW2_POLICY, at);
  return { k, keys, v };
}

test("accepts a valid EdDSA and ES256 token; grant expires exactly at token exp", async () => {
  for (const alg of ["EdDSA", "ES256"] as const) {
    const k = await keypair(alg, "k1");
    const v = await verifyAccessToken(await k.sign(k.header, good()), { keys: [k.jwk] }, PNW2_POLICY, NOW + 10);
    assert.equal(v.sub, "lead-opaque-1");
    assert.deepEqual(v.scope, { presentation: "16460", workshop: "9503" });
    assert.equal(grantExpiry(v).getTime(), (NOW + 300) * 1000);
  }
});

test("issuer and audience must match exactly", async () => {
  const { v } = await setup();
  for (const iss of ["https://joshpenzell.com", "https://www.joshpenzell.com/", "http://www.joshpenzell.com", 1, undefined]) {
    await expectCode(v({ iss }), "wrong_issuer");
  }
  for (const aud of ["other", "pnw2-interactive ", ["pnw2-interactive"], undefined]) {
    await expectCode(v({ aud }), "wrong_audience");
  }
});

test("presentation and workshop scope are required and exact", async () => {
  const { v } = await setup();
  assert.equal((await v({ presentation: 16460, workshop: 9503 })).sub, "lead-opaque-1"); // integer form accepted
  for (const o of [{ presentation: "1" }, { workshop: "1" }, { presentation: undefined }, { workshop: undefined },
                   { presentation: { v: "16460" } }, { presentation: 16460.5 }, { workshop: ["9503"] }]) {
    await expectCode(v(o), "wrong_scope");
  }
});

test("timestamps: non-integer, negative, zero, non-numeric, missing or misordered are rejected", async () => {
  const { v } = await setup();
  for (const o of [{ iat: NOW + 0.5 }, { exp: NOW + 299.9 }, { iat: -5 }, { iat: 0 }, { exp: "1800000300" },
                   { iat: null }, { exp: undefined }, { iat: 1e300 }, { exp: NOW }, { exp: NOW - 1 },
                   { nbf: NOW - 1 }, { nbf: NOW + 300 }, { nbf: 1.5 }, { nbf: "now" }]) {
    await expectCode(v(o), "invalid_timestamps");
  }
});

test("lifetime over five minutes, future iat/nbf and expiry are rejected", async () => {
  const { v } = await setup();
  await expectCode(v({ exp: NOW + 301 }), "lifetime_too_long");
  await expectCode(v({}, NOW - 61), "not_yet_valid"); // iat in the future beyond skew
  await expectCode(v({ nbf: NOW + 120 }), "not_yet_valid");
  await expectCode(v({}, NOW + 300), "expired"); // no grace after exp
  assert.ok(await v({}, NOW - 59)); // within the iat skew allowance
});

test("rejects alg none, HS256, unknown kid, header key injection, tampered payload, personal data", async () => {
  const { k, keys, v } = await setup();
  const t = await k.sign(k.header, good());
  await expectCode(verifyAccessToken(`${enc({ alg: "none", kid: "k1" })}.${enc(good())}.AAAA`, keys, PNW2_POLICY, NOW), "unsupported_alg");
  await expectCode(verifyAccessToken(`${enc({ alg: "HS256", kid: "k1" })}.${enc(good())}.AAAA`, keys, PNW2_POLICY, NOW), "unsupported_alg");
  await expectCode(v({}, NOW, { alg: "EdDSA", kid: "k2" }), "unknown_kid");
  await expectCode(v({}, NOW, { alg: "ES256", kid: "k1" }), "unsupported_alg"); // key pinned to EdDSA
  await expectCode(v({}, NOW, { alg: "EdDSA", kid: "k1", jku: "https://evil.example/jwks" }), "malformed");
  await expectCode(v({}, NOW, { alg: "EdDSA", kid: "k1", crit: ["x"] }), "malformed");
  const [h, , s] = t.split(".");
  await expectCode(verifyAccessToken(`${h}.${enc(good({ sub: "attacker" }))}.${s}`, keys, PNW2_POLICY, NOW), "bad_signature");
  await expectCode(verifyAccessToken(`${h}.${enc(good())}`, keys, PNW2_POLICY, NOW), "malformed");
  await expectCode(verifyAccessToken("a.b.c!", keys, PNW2_POLICY, NOW), "malformed");
  for (const f of ["email", "name", "given_name"]) await expectCode(v({ [f]: "x" }), "personal_data_in_token");
  await expectCode(v({ sub: "" }), "missing_claims");
  await expectCode(v({ jti: undefined }), "missing_claims");
  await expectCode(v({ session_code: "ab" }), "malformed");
  assert.equal((await v({ session_code: "abcd" })).sessionCode, "ABCD");
});

test("response identity is derived from the lead, not the client, and is stable across tokens", async () => {
  const { v } = await setup();
  const v1 = await v({ jti: "a" });
  const v2 = await v({ jti: "b" });
  const v3 = await v({ jti: "c", sub: "other-lead" });
  assert.equal(await participantKey(PNW2_POLICY.issuer, v1), await participantKey(PNW2_POLICY.issuer, v2));
  assert.notEqual(await participantKey(PNW2_POLICY.issuer, v1), await participantKey(PNW2_POLICY.issuer, v3));
  assert.match(await participantKey(PNW2_POLICY.issuer, v1), /^lead_[0-9a-f]{32}$/);
});
