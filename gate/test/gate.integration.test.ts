// Handlers + real SQL functions against a disposable local Postgres (gate/test/run.sh), with a
// controllable stand-in for MainSite introspection. Synthetic keys/users only; no network,
// no live backend, no providers, no email.
import { afterAll, beforeAll, describe, test } from "bun:test";
import assert from "node:assert/strict";
import { PNW2_POLICY, type VerifiedAccess } from "../functions/_shared/accessToken.ts";
import type { GateDeps } from "../functions/_shared/gateHttp.ts";
import type { IntrospectResult } from "../functions/_shared/mainsite.ts";
import { checkInteractiveAccess, denyWithoutAccess } from "../functions/_shared/interactiveGuard.ts";
import { handleCreatePresenterSession } from "../functions/create-presenter-session/handler.ts";
import { handleSubmit } from "../functions/submit-interaction/handler.ts";
import { as, attempt, DB_TESTS_ENABLED, file, freshDb, rpcAdapter } from "./db.ts";
import { claims, keypair } from "./tokens.ts";

const ORIGIN = "https://drupalpnw.lovable.app";
const PASSWORD = "synthetic-stage-password";
const STAGES = ["test/baseline_schema.sql", "migrations/01_dormant_gate.sql", "data/stage1_config.sql", "data/stage3_enable_interactive.sql", "migrations/02_enforce.sql"];
const now = () => Math.floor(Date.now() / 1000);

describe.skipIf(!DB_TESTS_ENABLED)("gate handlers on local Postgres (final MainSite contract)", () => {
  let db: Awaited<ReturnType<typeof freshDb>>;
  let deps: GateDeps;
  let key: Awaited<ReturnType<typeof keypair>>;
  const presenter = crypto.randomUUID();
  const bareAnon = crypto.randomUUID();
  // Stand-in for MainSite's introspection: per-capture state, call counter, outage switch.
  const revoked = new Set<string>();
  let introspectCalls = 0;
  let policyDown = false;
  let session: { id: string; code: string };
  let pollId: string, closedPollId: string, sliderPollId: string, mcPollId: string, oldPollId: string;

  const post = (handler: (r: Request, d: GateDeps) => Promise<Response>, body: unknown, headers: Record<string, string> = {}) =>
    handler(new Request("https://fn.local/x", { method: "POST", headers: { Origin: ORIGIN, "content-type": "application/json", ...headers }, body: JSON.stringify(body) }), deps);
  const read = async (r: Response) => ({ status: r.status, body: (await r.json()) as Record<string, any> });
  const token = (o: Record<string, unknown> = {}) => key.sign(key.header, claims(now(), o));
  const act = async (tok: string, body: Record<string, unknown>) => read(await post(handleSubmit, body, { Authorization: `Bearer ${tok}` }));
  const presenterCall = async (body: Record<string, unknown>, user = presenter) =>
    read(await post(handleCreatePresenterSession, body, { Authorization: `Bearer user:${user}` }));

  beforeAll(async () => {
    db = await freshDb(STAGES);
    key = await keypair("kid-synthetic-000000000");
    deps = {
      admin: rpcAdapter(db.sql),
      getUserId: async (b) => (b.startsWith("user:") ? b.slice(5) : null), // stands in for getClaims()
      jwks: async () => ({ keys: [key.jwk] }),
      async introspect(_t: string, access: VerifiedAccess): Promise<IntrospectResult> {
        introspectCalls++;
        if (policyDown) return { active: false, reason: "unavailable" };
        return revoked.has(access.sub) ? { active: false, reason: "inactive" } : { active: true };
      },
      policy: PNW2_POLICY,
      allowedOrigins: [ORIGIN],
      presentationPassword: PASSWORD,
      now,
    };
    await db.sql`INSERT INTO auth.users (id) VALUES (${presenter}), (${bareAnon})`;
  });
  afterAll(async () => { await db?.drop(); });

  // ---------- presenter proof (host authority independent of attendee tokens) ----------
  test("presenter: no login, wrong password, attendee token, or unauthorized create are refused", async () => {
    assert.equal((await post(handleCreatePresenterSession, { action: "authorize", password: PASSWORD })).status, 401);
    assert.equal((await presenterCall({ action: "authorize", password: "nope" })).status, 401);
    const asAttendee = await read(await post(handleCreatePresenterSession, { action: "authorize", password: PASSWORD }, { Authorization: `Bearer ${await token()}` }));
    assert.equal(asAttendee.status, 403);
    assert.equal(asAttendee.body.error, "attendee_token_not_allowed");
    assert.equal((await presenterCall({ action: "create_session" })).body.error, "presenter_required");
  });

  test("post-event, no live session: deck entry and paid demos work; live writes say not running; nothing is created", async () => {
    const [{ n: before }] = await db.sql`SELECT count(*)::int AS n FROM public.sessions`;
    const t = await token();
    const id = await act(t, { action: "identify" });
    assert.equal(id.status, 200);
    assert.equal(id.body.data.session, null);
    assert.match(id.body.data.participant_key, /^lead_[0-9a-f]{32}$/);
    const paid = new Request("https://fn.local", { method: "POST", headers: { Origin: ORIGIN, Authorization: `Bearer ${t}` } });
    assert.equal((await checkInteractiveAccess(paid, deps))?.kind, "attendee");
    assert.equal(await denyWithoutAccess(paid, deps), null);
    for (const body of [{ action: "poll_response", poll_id: crypto.randomUUID(), value: { text: "x" } },
                        { action: "story_volunteer", name: "Ada", mode: "slot" }, { action: "story_word", word: "x" },
                        { action: "my_responses", poll_id: crypto.randomUUID() }]) {
      const r = await act(t, body);
      assert.equal(r.status, 409, body.action);
      assert.equal(r.body.error, "session_inactive", body.action);
    }
    const [{ n: after }] = await db.sql`SELECT count(*)::int AS n FROM public.sessions`;
    assert.equal(after, before); // never auto-creates a presenter/session
    // ...and an attendee token still cannot reach host actions without a live session
    assert.equal((await read(await post(handleCreatePresenterSession, { action: "create_session" }, { Authorization: `Bearer ${t}` }))).status, 403);
  });

  test("presenter status reflects only a password authorization", async () => {
    assert.equal((await presenterCall({ action: "status" })).body.authorized_until, null);
    assert.equal((await presenterCall({ action: "status" }, bareAnon)).body.authorized_until, null);
    assert.equal((await read(await post(handleCreatePresenterSession, { action: "status" }))).status, 401);
  });

  test("presenter: existing password authorizes the login, then creates the canonical event session", async () => {
    assert.equal((await presenterCall({ action: "authorize", password: PASSWORD })).status, 200);
    assert.ok((await presenterCall({ action: "status" })).body.authorized_until);
    const c = await presenterCall({ action: "create_session" });
    assert.equal(c.status, 200);
    oldPollId = (await db.sql`INSERT INTO public.polls (session_id, slide_id, poll_type) VALUES (${c.body.session.id}, 'old', 'text') RETURNING id`)[0].id;
    const c2 = await presenterCall({ action: "create_session" }); // newest becomes canonical
    session = c2.body.session;
    const [cfg] = await db.sql`SELECT canonical_session_id FROM public.gate_config`;
    assert.equal(cfg.canonical_session_id, session.id);
    const [ps] = await db.sql`SELECT presenter_user_id, presentation_id, workshop_id FROM public.presenter_sessions WHERE session_id = ${session.id}`;
    assert.deepEqual({ ...ps }, { presenter_user_id: presenter, presentation_id: 16460, workshop_id: 9503 });
    [{ id: pollId }] = await db.sql`INSERT INTO public.polls (session_id, slide_id, poll_type) VALUES (${session.id}, 'am-ball', 'text') RETURNING id`;
    [{ id: closedPollId }] = await db.sql`INSERT INTO public.polls (session_id, slide_id, poll_type, is_open) VALUES (${session.id}, 'closed', 'text', false) RETURNING id`;
    [{ id: sliderPollId }] = await db.sql`INSERT INTO public.polls (session_id, slide_id, poll_type, poll_config) VALUES (${session.id}, 'pct', 'slider', ${{ phrases: ["Slam dunk", "Rarely"], min: 0, max: 100 }}) RETURNING id`;
    [{ id: mcPollId }] = await db.sql`INSERT INTO public.polls (session_id, slide_id, poll_type, poll_config) VALUES (${session.id}, 'duck', 'multiple_choice', ${{ options: ["Duck", "Rabbit"] }}) RETURNING id`;
  });

  test("a bare anonymous sign-in owning a session is neither presenter nor the attendee live session", async () => {
    await db.sql`INSERT INTO public.sessions (code, presenter_id) VALUES ('BARE', ${bareAnon})`;
    const r = new Request("https://x", { headers: { Origin: ORIGIN, Authorization: `Bearer user:${bareAnon}` } });
    assert.equal(await checkInteractiveAccess(r, deps), null);
  });

  // ---------- attendee verification + per-action introspection ----------
  test("identify binds to the server-chosen canonical session and derives identity", async () => {
    const r = await act(await token(), { action: "identify" });
    assert.equal(r.status, 200);
    assert.equal(r.body.data.session.id, session.id);
    assert.match(r.body.data.participant_key, /^lead_[0-9a-f]{32}$/);
  });

  test("a token is reusable within its lifetime, and introspection runs on every action (no caching)", async () => {
    const t = await token();
    const before = introspectCalls;
    for (let i = 0; i < 3; i++) assert.equal((await act(t, { action: "poll_response", poll_id: pollId, value: { text: `v${i}` } })).status, 200);
    assert.equal(introspectCalls - before, 3);
  });

  test("revocation takes effect on the very next action", async () => {
    const sub = crypto.randomUUID();
    const t = await token({ sub });
    assert.equal((await act(t, { action: "identify" })).status, 200);
    revoked.add(sub);
    const r = await act(t, { action: "poll_response", poll_id: pollId, value: { text: "x" } });
    assert.equal(r.status, 401);
    assert.equal(r.body.error, "access_revoked");
  });

  test("policy service unavailable fails closed for actions and paid functions", async () => {
    const t = await token();
    policyDown = true;
    try {
      const r = await act(t, { action: "poll_response", poll_id: pollId, value: { text: "x" } });
      assert.equal(r.status, 503);
      assert.equal(r.body.error, "policy_unavailable");
      const paid = new Request("https://fn.local", { method: "POST", headers: { Origin: ORIGIN, Authorization: `Bearer ${t}` } });
      assert.equal((await denyWithoutAccess(paid, deps))?.status, 401);
    } finally {
      policyDown = false;
    }
    const jwksDown = { ...deps, jwks: async () => { throw new Error("down"); } };
    const r2 = await handleSubmit(new Request("https://fn.local", { method: "POST", headers: { Origin: ORIGIN, Authorization: `Bearer ${t}` }, body: JSON.stringify({ action: "identify" }) }), jwksDown);
    assert.equal(r2.status, 503);
  });

  test("missing, forged, expired, cross-event and wrong-audience tokens are denied before introspection", async () => {
    const before = introspectCalls;
    assert.equal((await read(await post(handleSubmit, { action: "identify" }))).status, 401);
    const other = await keypair(key.jwk.kid!);
    assert.equal((await act(await other.sign(other.header, claims(now())), { action: "identify" })).body.error, "bad_signature");
    assert.equal((await act(await key.sign(key.header, claims(now() - 400)), { action: "identify" })).body.error, "expired");
    assert.equal((await act(await token({ workshop_id: 1 }), { action: "identify" })).body.error, "wrong_event");
    assert.equal((await act(await token({ presentation_id: 1 }), { action: "identify" })).body.error, "wrong_event");
    assert.equal((await act(await token({ aud: "pnw2:other" }), { action: "identify" })).body.error, "wrong_audience");
    assert.equal(introspectCalls, before);
  });

  test("origin must be exact and present", async () => {
    const t = await token();
    for (const headers of [{ Origin: "https://evil.example" }, {}] as Array<Record<string, string>>) {
      const r = await handleSubmit(new Request("https://fn.local", { method: "POST", headers: { ...headers, Authorization: `Bearer ${t}` }, body: JSON.stringify({ action: "identify" }) }), deps);
      assert.equal(r.status, 403);
    }
  });

  // ---------- server-side binding & identity ----------
  test("poll answer is written with the server-derived identity, upserted, and read back", async () => {
    const t = await token();
    const r = await act(t, { action: "poll_response", poll_id: pollId, value: { text: "red ball" } });
    assert.equal(r.status, 200);
    assert.match(r.body.data.participant_id, /^lead_/);
    assert.equal(new Date(r.body.expires_at).getTime() <= (now() + 300) * 1000, true);
    const again = await act(t, { action: "poll_response", poll_id: pollId, value: { text: "blue ball" } });
    assert.equal(again.body.data.id, r.body.data.id);
    const mine = await act(t, { action: "my_responses", poll_id: pollId });
    assert.equal(mine.body.data.length, 1);
    assert.equal(mine.body.data[0].value.text, "blue ball");
  });

  test("same capture across renewed tokens keeps one identity; different captures differ", async () => {
    const sub = crypto.randomUUID();
    const a = await act(await token({ sub }), { action: "identify" });
    const b = await act(await token({ sub }), { action: "identify" });
    const c = await act(await token(), { action: "identify" });
    assert.equal(a.body.data.participant_key, b.body.data.participant_key);
    assert.notEqual(a.body.data.participant_key, c.body.data.participant_key);
  });

  test("caller-supplied identity or session fields are refused", async () => {
    const t = await token();
    for (const field of ["participant_id", "session_id", "session_code", "code", "added_by", "participant_key", "presenter_id"]) {
      const r = await act(t, { action: "poll_response", poll_id: pollId, value: { text: "x" }, [field]: "attacker" });
      assert.equal(r.body.error, "identity_not_allowed", field);
    }
  });

  test("polls outside the canonical session (older or arbitrary sessions) are refused", async () => {
    const [old] = await db.sql`SELECT is_active FROM public.sessions WHERE id = (SELECT session_id FROM public.polls WHERE id = ${oldPollId})`;
    assert.equal(old.is_active, true); // older sessions are left alone, never closed
    const t = await token();
    assert.equal((await act(t, { action: "poll_response", poll_id: oldPollId, value: { text: "x" } })).body.error, "wrong_session");
    assert.equal((await act(t, { action: "my_responses", poll_id: oldPollId })).body.error, "wrong_session");
    assert.equal((await act(t, { action: "poll_response", poll_id: closedPollId, value: { text: "x" } })).body.error, "poll_closed");
    assert.equal((await act(t, { action: "poll_response", poll_id: crypto.randomUUID(), value: { text: "x" } })).body.error, "poll_not_found");
  });

  test("payloads are validated against the poll type and config", async () => {
    const t = await token();
    const send = async (poll: string, value: unknown) => (await act(t, { action: "poll_response", poll_id: poll, value })).body;
    assert.equal((await send(sliderPollId, { "Slam dunk": 90, Rarely: 15 })).ok, true);
    assert.equal((await send(sliderPollId, { "Slam dunk": 101 })).error, "invalid_value");
    assert.equal((await send(sliderPollId, { "Slam dunk": -1 })).error, "invalid_value");
    assert.equal((await send(mcPollId, { answer: "Duck" })).ok, true);
    assert.equal((await send(mcPollId, { answer: "Giraffe" })).error, "invalid_value");
    assert.equal((await send(pollId, { nested: { a: 1 } })).error, "invalid_value");
    assert.equal((await send(pollId, {})).error, "invalid_value");
    assert.equal((await send(pollId, { text: "x".repeat(501) })).error, "invalid_value");
    assert.equal((await send(pollId, ["array"])).error, "invalid_value");
    assert.equal((await send(pollId, { choices: ["a", "b"] })).ok, true);
  });

  test("story: volunteering is one-per-capture, capped, and lottery entries land in the pool", async () => {
    await db.sql`INSERT INTO public.story_game_state (session_id, max_volunteers, current_writer_position) VALUES (${session.id}, 2, 1)`;
    const subs = { a: crypto.randomUUID(), b: crypto.randomUUID(), c: crypto.randomUUID(), d: crypto.randomUUID() };
    (globalThis as any).__subs = subs;
    const vol = async (sub: string, mode: string, name = "Writer") => act(await token({ sub }), { action: "story_volunteer", name, mode });
    const a = await vol(subs.a, "slot", "  Ada  ");
    assert.equal(a.body.data.position, 1);
    assert.equal(a.body.data.participant_name, "Ada");
    assert.equal((await vol(subs.a, "slot")).body.data.id, a.body.data.id);
    assert.equal((await vol(subs.b, "slot")).body.data.position, 2);
    assert.equal((await vol(subs.c, "slot")).body.error, "full");
    assert.equal((await vol(subs.d, "lottery")).body.data.position, 1001);
    assert.equal((await vol(subs.c, "slot", "   ")).body.error, "invalid_name");
  });

  test("story: only the writer whose turn it is can add a word, and the turn advances", async () => {
    const subs = (globalThis as any).__subs;
    const ta = await token({ sub: subs.a });
    const tb = await token({ sub: subs.b });
    assert.equal((await act(tb, { action: "story_word", word: "Hello" })).body.error, "not_your_turn");
    const w1 = await act(ta, { action: "story_word", word: " Once " });
    assert.equal(w1.body.data.word, "Once");
    assert.equal((await act(ta, { action: "story_word", word: "again" })).body.error, "not_your_turn");
    assert.equal((await act(tb, { action: "story_word", word: "upon" })).body.data.position, 2);
    const [gs] = await db.sql`SELECT current_writer_position FROM public.story_game_state WHERE session_id = ${session.id}`;
    assert.equal(gs.current_writer_position, 1);
  });

  test("unknown actions are refused without spending an introspection", async () => {
    const before = introspectCalls;
    const t = await token();
    for (const action of ["story_topic_vote", "big_idea", "connect", "create_session", undefined]) {
      assert.equal((await act(t, { action })).body.error, "unknown_action");
    }
    assert.equal(introspectCalls, before);
  });

  // ---------- paid-function guard ----------
  test("paid guard: verified+introspected attendee or password-authorized presenter only", async () => {
    const req = (h: Record<string, string>) => new Request("https://fn.local", { method: "POST", headers: { Origin: ORIGIN, ...h } });
    const t = await token();
    assert.equal((await checkInteractiveAccess(req({ Authorization: `Bearer ${t}` }), deps))?.kind, "attendee");
    assert.equal((await checkInteractiveAccess(req({ Authorization: `Bearer user:${presenter}` }), deps))?.kind, "presenter");
    assert.equal(await checkInteractiveAccess(req({ Authorization: `Bearer user:${bareAnon}` }), deps), null);
    assert.equal(await checkInteractiveAccess(req({ Authorization: "Bearer sb_publishable_anon" }), deps), null);
    assert.equal(await checkInteractiveAccess(req({ Authorization: `Bearer ${await token({ exp: now() - 1, iat: now() - 100, nbf: now() - 100 })}` }), deps), null);
    assert.equal(await checkInteractiveAccess(req({}), deps), null);
    assert.equal((await denyWithoutAccess(req({}), deps))?.status, 401);
    assert.equal(await denyWithoutAccess(req({ Authorization: `Bearer ${t}` }), deps), null);
    const evil = new Request("https://fn.local", { method: "POST", headers: { Origin: "https://evil.example", Authorization: `Bearer ${t}` } });
    assert.equal((await denyWithoutAccess(evil, deps))?.status, 403);
    await db.sql`UPDATE public.presenter_authorizations SET expires_at = now() - interval '1 second' WHERE user_id = ${presenter}`;
    assert.equal(await checkInteractiveAccess(req({ Authorization: `Bearer user:${presenter}` }), deps), null);
    await db.sql`UPDATE public.presenter_authorizations SET expires_at = now() + interval '1 hour' WHERE user_id = ${presenter}`;
  });

  // ---------- rollback = maintenance ----------
  test("rollback maintenance denies every attendee action and attendee paid call; presenter unaffected", async () => {
    await db.sql.unsafe(file("data/rollback_maintenance.sql"));
    const t = await token();
    for (const body of [{ action: "identify" }, { action: "poll_response", poll_id: pollId, value: { text: "x" } }, { action: "story_word", word: "x" }]) {
      const r = await act(t, body);
      assert.equal(r.status, 503);
      assert.equal(r.body.error, "maintenance");
    }
    const req = (h: Record<string, string>) => new Request("https://fn.local", { method: "POST", headers: { Origin: ORIGIN, ...h } });
    assert.equal(await checkInteractiveAccess(req({ Authorization: `Bearer ${t}` }), deps), null);
    assert.equal((await checkInteractiveAccess(req({ Authorization: `Bearer user:${presenter}` }), deps))?.kind, "presenter");
    // No old anonymous write path comes back.
    const err = await attempt(db.sql, "anon", null, (tx) => tx`INSERT INTO public.responses (poll_id, participant_id, value) VALUES (${pollId}, 'made-up', '{"x":1}')`);
    assert.match(err ?? "allowed", /row-level security/);
    await db.sql.unsafe(file("data/stage3_enable_interactive.sql"));
  });

  // ---------- privileges ----------
  test("browser roles cannot call gate functions or read gate tables", async () => {
    for (const role of ["anon", "authenticated"] as const) {
      const uid = role === "authenticated" ? presenter : null;
      for (const stmt of [
        "SELECT public.gate_authorize_presenter(gen_random_uuid())",
        "SELECT public.gate_create_presenter_session(gen_random_uuid())",
        "SELECT public.gate_check_access(NULL, gen_random_uuid())",
        "SELECT public.gate_identify('lead_00000000000000000000000000000000')",
        "SELECT public.gate_submit_poll_response('lead_00000000000000000000000000000000', gen_random_uuid(), '{}')",
        "SELECT public.gate_attendee_session('lead_00000000000000000000000000000000')",
        "SELECT public.gate_require_enabled('lead_00000000000000000000000000000000')",
        "SELECT public.gate_canonical_session()",
        "SELECT public.gate_presenter_status(gen_random_uuid())",
        "SELECT * FROM public.presenter_authorizations",
        "SELECT * FROM public.presenter_sessions",
        "SELECT * FROM public.gate_config",
      ]) {
        const err = await attempt(db.sql, role, uid, (tx) => tx.unsafe(stmt));
        assert.match(err ?? "", /permission denied/, `${role}: ${stmt}`);
      }
    }
    const n = await as(db.sql, "service_role", null, (tx) => tx`SELECT count(*)::int AS n FROM public.presenter_sessions`);
    assert.ok((n as Array<{ n: number }>)[0].n > 0);
  });
});
