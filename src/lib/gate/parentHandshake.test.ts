import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createParentChannel, defaultNonce, isEmbedded, REQUEST_TYPE, RESPONSE_TYPE } from "./parentHandshake";

const ORIGIN = "https://www.joshpenzell.com";
const TOKEN = "aaa.bbb.ccc";

function fakeWindow() {
  const parent = {};
  let listener: ((e: unknown) => void) | null = null;
  const posted: Array<{ msg: any; origin: string }> = [];
  let n = 0;
  const win = { parent, addEventListener: (_: string, l: any) => { listener = l; }, removeEventListener: () => { listener = null; } } as any;
  const ch = createParentChannel(ORIGIN, { win, postToParent: (msg, origin) => posted.push({ msg, origin }), randomNonce: () => `nonce-${++n}` });
  const got: string[] = [];
  ch.onToken((t) => got.push(t));
  return { parent, posted, ch, got, send: (e: object) => listener?.(e) };
}

test("request posts the exact contract message to the exact parent origin", () => {
  const f = fakeWindow();
  f.ch.request();
  assert.deepEqual(f.posted, [{ msg: { type: REQUEST_TYPE, nonce: "nonce-1" }, origin: ORIGIN }]);
  assert.equal(REQUEST_TYPE, "pnw:access-request");
  assert.equal(RESPONSE_TYPE, "pnw:access-response");
});

test("accepts a token only for exact origin, exact source, and an outstanding nonce — once", () => {
  const f = fakeWindow();
  f.ch.request();
  const ok = { origin: ORIGIN, source: f.parent, data: { type: RESPONSE_TYPE, nonce: "nonce-1", token: TOKEN } };
  f.send({ ...ok, origin: "https://joshpenzell.com" });
  f.send({ ...ok, source: {} });
  f.send({ ...ok, data: { ...ok.data, nonce: "nonce-999" } });
  f.send({ ...ok, data: { ...ok.data, type: "pnw:access-request" } });
  f.send({ ...ok, data: { ...ok.data, token: "not-a-jwt" } });
  assert.deepEqual(f.got, []);
  f.ch.request(); // nonce-2; the malformed reply above consumed nonce-1
  f.send({ ...ok, data: { ...ok.data, nonce: "nonce-2" } });
  assert.deepEqual(f.got, [TOKEN]);
  f.send({ ...ok, data: { ...ok.data, nonce: "nonce-2" } }); // replayed reply
  assert.deepEqual(f.got, [TOKEN]);
});

test("default nonces are random, URL-safe and within 128 chars", () => {
  const a = defaultNonce();
  assert.ok(a.length > 20 && a.length <= 128);
  assert.match(a, /^[A-Za-z0-9_-]+$/);
  assert.notEqual(a, defaultNonce());
});

test("gate code never touches storage, URLs or analytics", () => {
  for (const f of ["parentHandshake.ts", "gateCore.ts", "gateClient.ts"]) {
    const src = readFileSync(join(import.meta.dirname ?? __dirname, f), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, ""); // code only, not comments
    assert.ok(!/localStorage|sessionStorage|indexedDB|document\.cookie|history\.(push|replace)State|gtag|analytics/.test(src), f);
  }
});

test("standalone (not framed) is detected so the page can redirect to MainSite", () => {
  const self = {};
  assert.equal(isEmbedded({ parent: self, self }), false);
  assert.equal(isEmbedded({ parent: {}, self }), true);
});
