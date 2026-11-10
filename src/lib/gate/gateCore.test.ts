import { test } from "node:test";
import assert from "node:assert/strict";
import { createGateCore, type Invoker, type TokenSource } from "./gateCore";

function fakeTokens() {
  const subs = new Set<(t: string) => void>();
  let requests = 0;
  const src: TokenSource = { request: () => { requests++; }, onToken: (cb) => { subs.add(cb); return () => subs.delete(cb); } };
  return { src, send: async (t: string) => { for (const s of subs) await s(t); }, requests: () => requests };
}

const SESSION = { id: "s1", code: "ABCD", current_slide: "S1", is_active: true, created_at: "x" };

function harness(mode: "off" | "dual" | "enforce", opts: { framed?: boolean; deny?: boolean } = {}) {
  let clock = 1_000_000;
  const timers: Array<{ fn: () => void; at: number }> = [];
  const calls: Array<{ name: string; opts: any }> = [];
  const invoke: Invoker = async (name, o) => {
    calls.push({ name, opts: o });
    if (opts.deny) return { data: null, error: "401" };
    const exp = new Date(clock + 300_000).toISOString();
    if ((o.body as any)?.action === "identify") return { data: { ok: true, data: { participant_key: "lead_k", session: SESSION }, expires_at: exp }, error: null };
    return { data: { ok: true, data: { id: "r1" }, expires_at: exp }, error: null };
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

test("off mode: always the existing direct path; no handshake, no header", async () => {
  const h = harness("off");
  assert.equal(await h.core.connect(), null);
  assert.equal(h.tokens.requests(), 0);
  assert.equal(await h.core.route(async () => "gated", async () => "direct", "blocked"), "direct");
  const opts = { body: 1 };
  assert.equal(h.core.withAccessHeader(opts), opts);
  assert.equal(h.calls.length, 0);
});

test("framed connect: token from parent, verified by the server, canonical session returned", async () => {
  const h = harness("dual");
  const p = h.core.connect();
  await h.tokens.send("tok.1.sig");
  const a = await p;
  assert.equal(a?.session.code, "ABCD");
  assert.equal(a?.participantKey, "lead_k");
  assert.deepEqual(h.calls[0].opts, { body: { action: "identify" }, headers: { Authorization: "Bearer tok.1.sig" } });
  assert.equal(await h.core.route(async (x) => x.token, async () => "direct", "blocked"), "tok.1.sig");
  assert.equal((await h.core.submit("poll_response", { poll_id: "p", value: { a: 1 } })).ok, true);
  assert.equal(h.calls[1].opts.headers.Authorization, "Bearer tok.1.sig");
  assert.deepEqual((h.core.withAccessHeader({ body: 1 }) as { headers?: unknown })?.headers, { Authorization: "Bearer tok.1.sig" });
});

test("token never used past its expiry; renewal only via a fresh parent token", async () => {
  const h = harness("enforce");
  const p = h.core.connect();
  await h.tokens.send("tok.1.sig");
  await p;
  const before = h.tokens.requests();
  assert.equal(h.timers.length, 1);
  assert.equal(h.timers[0].at - h.clock(), 240_000); // renew 60 s before the 300 s expiry
  h.advance(240_000);
  h.timers[0].fn();
  assert.equal(h.tokens.requests(), before + 1);
  h.advance(60_000); // parent never answered → access lapses; nothing extends it
  assert.equal(h.core.access(), null);
  assert.equal(await h.core.route(async () => "gated", async () => "direct", "blocked"), "blocked");
  assert.equal((await h.core.submit("poll_response", {})).ok, false);
  await h.tokens.send("tok.2.sig");
  assert.equal(h.core.access()?.token, "tok.2.sig");
});

test("server denial (revoked / maintenance) leaves no access", async () => {
  const h = harness("enforce", { deny: true });
  const p = h.core.connect();
  await h.tokens.send("tok.1.sig");
  h.timers.find((t) => t.at - h.clock() === 8_000)?.fn();
  assert.equal(await p, null);
});

test("dual without access keeps the old path; enforce blocks; standalone gets no access", async () => {
  assert.equal(await harness("dual").core.route(async () => "gated", async () => "direct", "blocked"), "direct");
  assert.equal(await harness("enforce").core.route(async () => "gated", async () => "direct", "blocked"), "blocked");
  assert.equal(await harness("enforce", { framed: false }).core.connect(), null);
});
