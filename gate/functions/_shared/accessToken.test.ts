// Synthetic keys and tokens only — no network, no live data.
import { test } from "bun:test";
import assert from "node:assert/strict";
import { AccessTokenError, looksLikeMainSiteToken, participantKey, PNW2_POLICY, verifyAccessToken } from "./accessToken.ts";
import { introspect, mainSiteEndpoints } from "./mainsite.ts";
import { claims, enc, keypair } from "../../test/tokens.ts";

const NOW = 1_800_000_000;
const SUB = "3f2b8c1e-6d4a-4b7e-9c2d-1a2b3c4d5e6f";

async function expectCode(p: Promise<unknown>, code: string) {
  await assert.rejects(p, (e: unknown) => e instanceof AccessTokenError && (e as AccessTokenError).code === code, code);
}

async function setup() {
  const k = await keypair("kid-24-chars-aaaaaaaaaaa");
  const keys = { keys: [k.jwk] };
  const v = async (o: Record<string, unknown> = {}, at = NOW, header: object = k.header) =>
    verifyAccessToken(await k.sign(header, claims(NOW, { sub: SUB, ...o })), keys, PNW2_POLICY, at);
  return { k, keys, v };
}

test("accepts a token shaped exactly like MainSite's signer, and reuse within its lifetime", async () => {
  const { v } = await setup();
  const a = await v();
  assert.equal(a.sub, SUB);
  assert.equal(a.exp, NOW + 300);
  assert.equal((await v({}, NOW + 299)).sub, SUB); // jti is a grant id, not single-use
});

test("pins EdDSA only: ES256, HS256, none and RS256 are refused", async () => {
  const { k, keys } = await setup();
  for (const alg of ["ES256", "HS256", "none", "RS256", "eddsa"]) {
    await expectCode(verifyAccessToken(`${enc({ alg, kid: k.jwk.kid })}.${enc(claims(NOW))}.AAAA`, keys, PNW2_POLICY, NOW), "unsupported_alg");
  }
  const ec = (await crypto.subtle.exportKey("jwk", ((await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign"])) as CryptoKeyPair).publicKey));
  await expectCode(verifyAccessToken(await k.sign(k.header, claims(NOW)), { keys: [{ ...ec, kid: k.jwk.kid }] }, PNW2_POLICY, NOW), "unknown_kid");
});

test("issuer, audience, event ids, scope and policy version are exact", async () => {
  const { v } = await setup();
  for (const iss of ["https://joshpenzell.com", "https://www.joshpenzell.com/", "http://www.joshpenzell.com"]) await expectCode(v({ iss }), "wrong_issuer");
  for (const aud of ["pnw2-interactive", "pnw2:e10466e1-025e-4530-8f10-a62efb7a9ea9", ["pnw2:e10466e1-025e-4530-8f10-a62efb7a9ea8"]]) await expectCode(v({ aud }), "wrong_audience");
  for (const o of [{ presentation_id: "16460" }, { presentation_id: 16461 }, { workshop_id: "9503" }, { workshop_id: 9503.0001 }, { presentation_id: undefined }]) await expectCode(v(o), "wrong_event");
  for (const scope of [["slides:interact"], ["slides:interact", "session:qa", "admin"], "slides:interact session:qa", ["slides:interact", "slides:interact"], undefined]) await expectCode(v({ scope }), "wrong_scope");
  assert.ok(await v({ scope: ["session:qa", "slides:interact"] }));
  for (const policy_version of [2, "1", 0, undefined]) await expectCode(v({ policy_version }), "wrong_policy");
});

test("sub and jti must be the same capture UUID", async () => {
  const { v } = await setup();
  await expectCode(v({ jti: crypto.randomUUID() }), "invalid_subject");
  await expectCode(v({ sub: "lead-1", jti: "lead-1" }), "invalid_subject");
  await expectCode(v({ jti: undefined }), "invalid_subject");
});

test("timestamps: non-integer, negative, zero, non-numeric, missing or misordered are rejected", async () => {
  const { v } = await setup();
  for (const o of [{ iat: NOW + 0.5 }, { exp: NOW + 299.9 }, { iat: -5 }, { iat: 0 }, { exp: "1800000300" }, { iat: null },
                   { nbf: undefined }, { exp: NOW }, { exp: NOW - 1 }, { nbf: NOW - 1 }, { nbf: NOW + 300 }, { iat: 1e300 }]) {
    await expectCode(v(o), "invalid_timestamps");
  }
});

test("lifetime over 300 s, future iat/nbf, and expiry are rejected", async () => {
  const { v } = await setup();
  await expectCode(v({ exp: NOW + 301 }), "lifetime_too_long");
  await expectCode(v({}, NOW - 31), "not_yet_valid");
  await expectCode(v({ nbf: NOW + 60 }), "not_yet_valid");
  await expectCode(v({}, NOW + 300), "expired");
});

test("unknown kid, header key injection, tampered payload, extra segments, personal data", async () => {
  const { k, keys, v } = await setup();
  await expectCode(v({}, NOW, { ...k.header, kid: "other" }), "unknown_kid");
  for (const extra of [{ jku: "https://evil.example" }, { jwk: {} }, { crit: ["b64"] }, { x5u: "x" }]) await expectCode(v({}, NOW, { ...k.header, ...extra }), "malformed");
  await expectCode(v({}, NOW, { ...k.header, typ: "at+jwt" }), "malformed");
  const [h, , s] = (await k.sign(k.header, claims(NOW, { sub: SUB }))).split(".");
  await expectCode(verifyAccessToken(`${h}.${enc(claims(NOW, { sub: crypto.randomUUID() }))}.${s}`, keys, PNW2_POLICY, NOW), "bad_signature");
  await expectCode(verifyAccessToken(`${h}.${enc(claims(NOW))}.${s}.x`, keys, PNW2_POLICY, NOW), "malformed");
  for (const f of ["email", "name", "consentMarketing", "company"]) await expectCode(v({ [f]: "x" }), "personal_data_in_token");
});

test("identity is derived from the capture UUID and event, stable across renewed tokens", async () => {
  const { v } = await setup();
  const a = await participantKey(PNW2_POLICY, await v());
  assert.equal(a, await participantKey(PNW2_POLICY, await v({ iat: NOW - 10, nbf: NOW - 10, exp: NOW + 290 })));
  assert.notEqual(a, await participantKey(PNW2_POLICY, await v({ sub: crypto.randomUUID(), jti: undefined }).catch(() => v({ sub: "00000000-0000-4000-8000-000000000000" }))));
  assert.match(a, /^lead_[0-9a-f]{32}$/);
});

test("endpoints are fixed to the pinned www issuer", () => {
  assert.deepEqual(mainSiteEndpoints(PNW2_POLICY.issuer), {
    jwks: "https://www.joshpenzell.com/api/drupal-access/jwks",
    introspect: "https://www.joshpenzell.com/api/drupal-access/introspect",
  });
  for (const bad of ["http://www.joshpenzell.com", "https://www.joshpenzell.com/x", "https://www.joshpenzell.com:8443"]) {
    assert.throws(() => mainSiteEndpoints(bad));
  }
});

test("introspection: exact POST + Bearer; only an exact positive answer passes; fail closed otherwise", async () => {
  const { v } = await setup();
  const access = await v();
  const seen: Array<{ url: string; init: RequestInit }> = [];
  const reply = (status: number, body: unknown) => async (url: string, init: RequestInit) => {
    seen.push({ url, init });
    return new Response(typeof body === "string" ? body : JSON.stringify(body), { status });
  };
  const ok = { active: true, sub: SUB, scope: ["slides:interact", "session:qa"], policy_version: 1 };
  assert.deepEqual(await introspect("TOKEN", access, PNW2_POLICY, reply(200, ok)), { active: true });
  assert.equal(seen[0].url, "https://www.joshpenzell.com/api/drupal-access/introspect");
  assert.equal(seen[0].init.method, "POST");
  assert.equal((seen[0].init.headers as Record<string, string>).Authorization, "Bearer TOKEN");
  assert.equal(seen[0].init.redirect, "error");
  const cases: Array<[number, unknown, string]> = [
    [200, { active: false }, "inactive"],
    [401, { active: false }, "inactive"],
    [200, { ...ok, sub: crypto.randomUUID() }, "mismatch"],
    [200, { ...ok, scope: ["session:qa"] }, "mismatch"],
    [200, { ...ok, policy_version: 2 }, "mismatch"],
    [200, { ...ok, active: "true" }, "inactive"],
    [404, { error: "Not active" }, "unavailable"],
    [429, { error: "rate" }, "unavailable"],
    [503, { error: "x" }, "unavailable"],
    [200, "<html>", "unavailable"],
  ];
  for (const [status, body, reason] of cases) {
    assert.deepEqual(await introspect("TOKEN", access, PNW2_POLICY, reply(status, body)), { active: false, reason }, JSON.stringify(body));
  }
  assert.deepEqual(await introspect("TOKEN", access, PNW2_POLICY, async () => { throw new TypeError("network"); }), { active: false, reason: "unavailable" });
});

test("routing hint: only EdDSA-headed bearers are treated as attendee tokens", async () => {
  const { k } = await setup();
  assert.equal(looksLikeMainSiteToken(await k.sign(k.header, claims(NOW))), true);
  assert.equal(looksLikeMainSiteToken(`${enc({ alg: "ES256", kid: "x" })}.e30.x`), false);
  assert.equal(looksLikeMainSiteToken("sb_publishable_x"), false);
});
