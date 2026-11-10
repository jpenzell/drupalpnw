import { test } from "node:test";
import assert from "node:assert/strict";
import { clearAccessToken, getAccessToken, isEmbedded, startHandshake } from "./parentHandshake";

const ORIGIN = "https://www.joshpenzell.com";
const TYPE = "pnw2-interactive-access";
const tokenWithExp = (exp: number) => `x.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.y`;

function fakeWindow() {
  const parent = {};
  let listener: ((e: unknown) => void) | null = null;
  const posted: unknown[] = [];
  return {
    parent, posted,
    win: { parent, addEventListener: (_: string, l: any) => { listener = l; }, removeEventListener: () => { listener = null; } } as any,
    send: (e: object) => listener?.(e),
  };
}

test("accepts a token only from the exact parent origin and source window", () => {
  clearAccessToken();
  const f = fakeWindow();
  startHandshake({ parentOrigin: ORIGIN, messageType: TYPE }, { win: f.win, postToParent: (m) => f.posted.push(m) });
  const t = tokenWithExp(Math.floor(Date.now() / 1000) + 300);
  f.send({ origin: "https://joshpenzell.com", source: f.parent, data: { type: TYPE, token: t } });
  assert.equal(getAccessToken(), null);
  f.send({ origin: ORIGIN, source: {}, data: { type: TYPE, token: t } });
  assert.equal(getAccessToken(), null);
  f.send({ origin: ORIGIN, source: f.parent, data: { type: TYPE, token: t } });
  assert.equal(getAccessToken(), t);
  assert.deepEqual(f.posted, [{ type: `${TYPE}:request` }]);
});

test("an expired token is not returned (no silent extension)", () => {
  clearAccessToken();
  const f = fakeWindow();
  startHandshake({ parentOrigin: ORIGIN, messageType: TYPE }, { win: f.win, postToParent: () => {} });
  const exp = Math.floor(Date.now() / 1000) + 300;
  f.send({ origin: ORIGIN, source: f.parent, data: { type: TYPE, token: tokenWithExp(exp) } });
  assert.equal(getAccessToken(exp * 1000 + 1), null);
});

test("standalone (not framed) is detected so the page can redirect to MainSite", () => {
  const self = {};
  assert.equal(isEmbedded({ parent: self, self }), false);
  assert.equal(isEmbedded({ parent: {}, self }), true);
});
