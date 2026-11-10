import { test } from "bun:test";
import assert from "node:assert/strict";
import { createGateCore, type Invoker, type TokenSource } from "./gateCore";

function fakeTokens() {
  const subs = new Set<(t: string) => void>();
  let requests = 0;
  const src: TokenSource = { request: () => { requests++; }, onToken: (cb) => { subs.add(cb); return () => subs.delete(cb); } };
  return { src, send: async (t: string) => { for (const s of subs) await s(t); }, requests: () => requests };
}

function harness(mode: "off" | "dual" | "enforce", opts: { framed?: boolean } = {}) {
  let clock = 1_000_000;
  const timers: Array<{ fn: () => void; at: number }> = [];
  const calls: Array<{ name: string; opts: any }> = [];
  let redeemN = 0;
  const invoke: Invoker = async (name, o) => {
    calls.push({ name, opts: o });
    if (name === "redeem-access") {
      redeemN++;
      return { data: { grant: `g${redeemN}`, participant_key: "lead_k", session_id: "s1", expires_at: new Date(clock + 300_000).toISOString() }, error: null };
    }
    if (name === "submit-interaction") return { data: { ok: true, data: { id: "r1" } }, error: null };
    return { data: null, error: "nope" };
  };
  const tokens = fakeTokens();
  const core = createGateCore({
    mode, invoke, tokens: opts.framed === false ? null : tokens.src,
    now: () => clock,
    setTimer: (fn, ms) => { const t = { fn, at: clock + ms }; timers.push(t); return t; },
    clearTimer: (t) => { const i = timers.indexOf(t as any); if (i >= 0) timers.splice(i, 1); },
  });
  return { core, calls, tokens, advance: (ms: number) => { clock += ms; }, timers, clock: () => clock };
}

test("off mode: always the existing direct path, never a grant or header", async () => {
  const h = harness("off");
  assert.equal(await h.core.connect("ABCD"), null);
  assert.equal(await h.core.route(async () => "gated", async () => "direct", "blocked"), "direct");
  const opts = { body: 1 };
  assert.equal(h.core.withGrantHeader(opts), opts);
  assert.equal(h.calls.length, 0);
});

test("framed connect redeems the parent token and gated writes carry the grant", async () => {
  const h = harness("dual");
  const p = h.core.connect("abcd");
  await h.tokens.send("tok-1");
  const g = await p;
  assert.equal(g?.grant, "g1");
  assert.deepEqual(h.calls[0].opts.body, { token: "tok-1", session_code: "ABCD" });
  assert.equal(await h.core.route(async (gr) => gr.grant, async () => "direct", "blocked"), "g1");
  const r = await h.core.submit("poll_response", { poll_id: "p", value: { a: 1 } });
  assert.equal(r.ok, true);
  assert.equal(h.calls[1].opts.headers["x-pnw2-grant"], "g1");
  assert.deepEqual(h.core.withGrantHeader({ body: 1 })?.headers, { "x-pnw2-grant": "g1" });
});

test("grant is never used past its own expiry; renewal only via a fresh parent token", async () => {
  const h = harness("enforce");
  const p = h.core.connect("ABCD");
  await h.tokens.send("tok-1");
  await p;
  const before = h.tokens.requests();
  assert.equal(h.timers.length, 1);
  assert.equal(h.timers[0].at - h.clock(), 240_000); // renew 60s before the 5-minute expiry
  h.advance(240_000);
  h.timers[0].fn();
  assert.equal(h.tokens.requests(), before + 1);
  h.advance(60_000); // parent never answered → grant lapses, nothing extends it
  assert.equal(h.core.grant(), null);
  assert.equal(await h.core.route(async () => "gated", async () => "direct", "blocked"), "blocked");
  assert.equal((await h.core.submit("poll_response", {})).ok, false);
  await h.tokens.send("tok-2"); // a fresh token restores access with its own expiry
  assert.equal(h.core.grant()?.grant, "g2");
});

test("dual mode without a grant keeps the old path; enforce blocks it; standalone has no grant", async () => {
  assert.equal(await harness("dual").core.route(async () => "gated", async () => "direct", "blocked"), "direct");
  assert.equal(await harness("enforce").core.route(async () => "gated", async () => "direct", "blocked"), "blocked");
  assert.equal(await harness("enforce", { framed: false }).core.connect("ABCD"), null);
});

test("connect gives up when the parent sends no token", async () => {
  const h = harness("enforce");
  const p = h.core.connect("ABCD");
  h.timers[0].fn(); // wait timeout
  assert.equal(await p, null);
});
