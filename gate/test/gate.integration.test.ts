// Handlers + real SQL functions against a disposable local Postgres (gate/test/run.sh).
// Synthetic keys, synthetic users, no network, no live backend, no providers, no email.
import { afterAll, beforeAll, describe, test } from "bun:test";
import assert from "node:assert/strict";
import { PNW2_POLICY, type PublicJwk } from "../functions/_shared/accessToken.ts";
import type { GateDeps } from "../functions/_shared/gateHttp.ts";
import { checkInteractiveAccess, denyWithoutAccess } from "../functions/_shared/interactiveGuard.ts";
import { handleCreatePresenterSession } from "../functions/create-presenter-session/handler.ts";
import { handleRedeem } from "../functions/redeem-access/handler.ts";
import { handleSubmit } from "../functions/submit-interaction/handler.ts";
import { as, attempt, DB_TESTS_ENABLED, freshDb, rpcAdapter } from "./db.ts";
import { claims, keypair } from "./tokens.ts";

const ORIGIN = "https://drupalpnw.lovable.app";
const PASSWORD = "synthetic-stage-password";
const STAGES = ["test/baseline_schema.sql", "migrations/01_dormant_gate.sql", "data/stage1_config.sql", "data/stage3_enable_redeem.sql"];
const now = () => Math.floor(Date.now() / 1000);

describe.skipIf(!DB_TESTS_ENABLED)("gate handlers on local Postgres", () => {
  let db: Awaited<ReturnType<typeof freshDb>>;
  let deps: GateDeps;
  let key: Awaited<ReturnType<typeof keypair>>;
  const presenter = crypto.randomUUID();
  const bareAnon = crypto.randomUUID();
  let session: { id: string; code: string };
  let otherSession: { id: string; code: string };
  let pollId: string, closedPollId: string, sliderPollId: string, mcPollId: string, otherPollId: string;

  const post = (handler: (r: Request, d: GateDeps) => Promise<Response>, body: unknown, headers: Record<string, string> = {}) =>
    handler(new Request("https://fn.local/x", { method: "POST", headers: { Origin: ORIGIN, "content-type": "application/json", ...headers }, body: JSON.stringify(body) }), deps);
  const read = async (r: Response) => ({ status: r.status, body: (await r.json()) as Record<string, any> });
  const token = (o: Record<string, unknown> = {}) => key.sign(key.header, claims(now(), o));
  async function redeem(o: Record<string, unknown> = {}, code: string | null = session.code) {
    const body: Record<string, unknown> = { token: await token(o) };
    if (code !== null) body.session_code = code;
    return read(await post(handleRedeem, body));
  }

  beforeAll(async () => {
    db = await freshDb(STAGES);
    key = await keypair("EdDSA", "k1");
    deps = {
      admin: rpcAdapter(db.sql),
      getUserId: async (b) => (b.startsWith("user:") ? b.slice(5) : null), // stands in for getClaims()
      jwks: async () => ({ keys: [key.jwk as PublicJwk] }),
      policy: PNW2_POLICY,
      allowedOrigins: [ORIGIN],
      presentationPassword: PASSWORD,
      now,
    };
    await db.sql`INSERT INTO auth.users (id) VALUES (${presenter}), (${bareAnon})`;
  });
  afterAll(async () => { await db?.drop(); });

  // ---------- presenter proof ----------
  test("presenter: no verified login, wrong password, or unauthorized create are refused", async () => {
    assert.equal((await post(handleCreatePresenterSession, { action: "authorize", password: PASSWORD })).status, 401);
    assert.equal((await post(handleCreatePresenterSession, { action: "authorize", password: "nope" }, { Authorization: `Bearer user:${presenter}` })).status, 401);
    const r = await read(await post(handleCreatePresenterSession, { action: "create_session" }, { Authorization: `Bearer user:${presenter}` }));
    assert.equal(r.status, 403);
    assert.equal(r.body.error, "presenter_required");
  });

  test("presenter: existing password authorizes the login, then creates a bound session", async () => {
    const a = await read(await post(handleCreatePresenterSession, { action: "authorize", password: PASSWORD }, { Authorization: `Bearer user:${presenter}` }));
    assert.equal(a.status, 200);
    const c = await read(await post(handleCreatePresenterSession, { action: "create_session" }, { Authorization: `Bearer user:${presenter}` }));
    assert.equal(c.status, 200);
    session = c.body.session;
    assert.match(session.code, /^[A-Z2-9]{4}$/);
    const [ps] = await db.sql`SELECT presenter_user_id, presentation, workshop FROM public.presenter_sessions WHERE session_id = ${session.id}`;
    assert.deepEqual({ ...ps }, { presenter_user_id: presenter, presentation: "16460", workshop: "9503" });
    const c2 = await read(await post(handleCreatePresenterSession, { action: "create_session" }, { Authorization: `Bearer user:${presenter}` }));
    otherSession = c2.body.session;

    [{ id: pollId }] = await db.sql`INSERT INTO public.polls (session_id, slide_id, poll_type) VALUES (${session.id}, 'am-ball', 'text') RETURNING id`;
    [{ id: closedPollId }] = await db.sql`INSERT INTO public.polls (session_id, slide_id, poll_type, is_open) VALUES (${session.id}, 'closed', 'text', false) RETURNING id`;
    [{ id: sliderPollId }] = await db.sql`INSERT INTO public.polls (session_id, slide_id, poll_type, poll_config) VALUES (${session.id}, 'pct', 'slider', ${{ phrases: ["Slam dunk", "Rarely"], min: 0, max: 100 }}) RETURNING id`;
    [{ id: mcPollId }] = await db.sql`INSERT INTO public.polls (session_id, slide_id, poll_type, poll_config) VALUES (${session.id}, 'duck', 'multiple_choice', ${{ options: ["Duck", "Rabbit"] }}) RETURNING id`;
    [{ id: otherPollId }] = await db.sql`INSERT INTO public.polls (session_id, slide_id, poll_type) VALUES (${otherSession.id}, 'am-ball', 'text') RETURNING id`;
  });

  test("presenter: a bare anonymous sign-in owning a session is not a proven presenter", async () => {
    await db.sql`INSERT INTO public.sessions (code, presenter_id) VALUES ('BARE', ${bareAnon})`;
    const r = await redeem({}, "BARE");
    assert.equal(r.status, 409);
    assert.equal(r.body.error, "session_inactive");
    assert.equal(await checkInteractiveAccess(new Request("https://x", { headers: { Authorization: `Bearer user:${bareAnon}` } }), deps), null);
  });

  // ---------- redeem ----------
  test("redeem: valid token → grant expiring exactly at token exp, bound to the session", async () => {
    const t = claims(now());
    const r = await read(await post(handleRedeem, { token: await key.sign(key.header, t), session_code: session.code.toLowerCase() }));
    assert.equal(r.status, 200);
    assert.match(r.body.grant, /^[0-9a-f]{64}$/);
    assert.equal(r.body.session_id, session.id);
    assert.equal(new Date(r.body.expires_at).getTime(), t.exp * 1000);
    const [g] = await db.sql`SELECT expires_at, session_id, lead_ref FROM public.access_grants WHERE jti = ${t.jti}`;
    assert.equal(new Date(g.expires_at).getTime(), t.exp * 1000);
    assert.equal(g.lead_ref, "lead-opaque-1");
  });

  test("redeem: a replayed jti is refused, even after its grant was revoked", async () => {
    const t = await token({ jti: "replay-me" });
    assert.equal((await post(handleRedeem, { token: t, session_code: session.code })).status, 200);
    await db.sql`UPDATE public.access_grants SET revoked_at = now() WHERE jti = 'replay-me'`;
    const again = await read(await post(handleRedeem, { token: t, session_code: session.code }));
    assert.equal(again.status, 409);
    assert.equal(again.body.error, "replayed");
  });

  test("redeem: unbound, mismatched, inactive or foreign-event sessions are refused", async () => {
    assert.equal((await redeem({}, null)).body.error, "session_required");
    const mismatch = await read(await post(handleRedeem, { token: await token({ session_code: session.code }), session_code: otherSession.code }));
    assert.equal(mismatch.status, 403);
    assert.equal((await redeem({}, "ZZZZ")).body.error, "session_inactive");
    await db.sql`UPDATE public.presenter_sessions SET workshop = '1' WHERE session_id = ${otherSession.id}`;
    assert.equal((await redeem({}, otherSession.code)).body.error, "session_inactive");
    await db.sql`UPDATE public.presenter_sessions SET workshop = '9503' WHERE session_id = ${otherSession.id}`;
  });

  test("redeem: origin must be exact and present; disabled gate answers not_configured", async () => {
    const t = await token();
    const bad = await handleRedeem(new Request("https://fn.local", { method: "POST", headers: { Origin: "https://evil.example" }, body: JSON.stringify({ token: t, session_code: session.code }) }), deps);
    assert.equal(bad.status, 403);
    const none = await handleRedeem(new Request("https://fn.local", { method: "POST", body: JSON.stringify({ token: t, session_code: session.code }) }), deps);
    assert.equal(none.status, 403);
    await db.sql`UPDATE public.gate_config SET redeem_enabled = false`;
    assert.equal((await redeem()).body.error, "not_configured");
    await db.sql`UPDATE public.gate_config SET redeem_enabled = true`;
  });

  test("redeem: a token signed by an unknown key or with the wrong audience is refused", async () => {
    const other = await keypair("EdDSA", "k1");
    const forged = await read(await post(handleRedeem, { token: await other.sign(other.header, claims(now())), session_code: session.code }));
    assert.equal(forged.body.error, "bad_signature");
    assert.equal((await redeem({ aud: "other" })).body.error, "wrong_audience");
  });

  // ---------- submit ----------
  test("poll answer is written with the server-derived identity and read back", async () => {
    const { body: g } = await redeem();
    const r = await read(await post(handleSubmit, { action: "poll_response", poll_id: pollId, value: { text: "red ball" } }, { "x-pnw2-grant": g.grant }));
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.equal(r.body.data.participant_id, g.participant_key);
    const again = await read(await post(handleSubmit, { action: "poll_response", poll_id: pollId, value: { text: "blue ball" } }, { "x-pnw2-grant": g.grant }));
    assert.equal(again.body.data.id, r.body.data.id); // upsert, one answer per lead
    const mine = await read(await post(handleSubmit, { action: "my_responses", poll_id: pollId }, { "x-pnw2-grant": g.grant }));
    assert.equal(mine.body.data.length, 1);
    assert.equal(mine.body.data[0].value.text, "blue ball");
  });

  test("same lead across renewals keeps one identity", async () => {
    const a = await redeem({ sub: "lead-renew" });
    const b = await redeem({ sub: "lead-renew" });
    assert.notEqual(a.body.grant, b.body.grant);
    assert.equal(a.body.participant_key, b.body.participant_key);
  });

  test("identity or session fields from the caller are refused", async () => {
    const { body: g } = await redeem();
    for (const field of ["participant_id", "session_id", "added_by", "participant_key"]) {
      const r = await read(await post(handleSubmit, { action: "poll_response", poll_id: pollId, value: { text: "x" }, [field]: "attacker" }, { "x-pnw2-grant": g.grant }));
      assert.equal(r.status, 400);
      assert.equal(r.body.error, "identity_not_allowed");
    }
  });

  test("cross-session poll, closed poll and missing grant are refused", async () => {
    const { body: g } = await redeem();
    const cross = await read(await post(handleSubmit, { action: "poll_response", poll_id: otherPollId, value: { text: "x" } }, { "x-pnw2-grant": g.grant }));
    assert.equal(cross.body.error, "wrong_session");
    assert.equal((await read(await post(handleSubmit, { action: "my_responses", poll_id: otherPollId }, { "x-pnw2-grant": g.grant }))).body.error, "wrong_session");
    const closed = await read(await post(handleSubmit, { action: "poll_response", poll_id: closedPollId, value: { text: "x" } }, { "x-pnw2-grant": g.grant }));
    assert.equal(closed.body.error, "poll_closed");
    assert.equal((await post(handleSubmit, { action: "poll_response", poll_id: pollId, value: { text: "x" } })).status, 401);
    assert.equal((await post(handleSubmit, { action: "poll_response", poll_id: pollId, value: { text: "x" } }, { "x-pnw2-grant": "f".repeat(64) })).status, 401);
  });

  test("payloads are validated against the poll type and config", async () => {
    const { body: g } = await redeem();
    const send = async (poll: string, value: unknown) =>
      (await read(await post(handleSubmit, { action: "poll_response", poll_id: poll, value }, { "x-pnw2-grant": g.grant }))).body;
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

  test("expired, revoked and ended-session grants stop working", async () => {
    const expired = await redeem({ sub: "lead-exp" });
    await db.sql`UPDATE public.access_grants SET expires_at = now() - interval '1 second' WHERE participant_key = ${expired.body.participant_key}`;
    assert.equal((await read(await post(handleSubmit, { action: "poll_response", poll_id: pollId, value: { text: "x" } }, { "x-pnw2-grant": expired.body.grant }))).body.error, "grant_invalid");

    const revoked = await redeem({ sub: "lead-rev" });
    const n = await deps.admin.rpc("gate_revoke_lead", { p_lead_ref: "lead-rev" });
    assert.ok((n.data as number) >= 1);
    assert.equal((await read(await post(handleSubmit, { action: "poll_response", poll_id: pollId, value: { text: "x" } }, { "x-pnw2-grant": revoked.body.grant }))).body.error, "grant_invalid");

    const c = await read(await post(handleCreatePresenterSession, { action: "create_session" }, { Authorization: `Bearer user:${presenter}` }));
    const ending = await redeem({ sub: "lead-end" }, c.body.session.code);
    const [{ id: endPoll }] = await db.sql`INSERT INTO public.polls (session_id, slide_id, poll_type) VALUES (${c.body.session.id}, 'p', 'text') RETURNING id`;
    await db.sql`UPDATE public.sessions SET is_active = false WHERE id = ${c.body.session.id}`;
    assert.equal((await read(await post(handleSubmit, { action: "poll_response", poll_id: endPoll, value: { text: "x" } }, { "x-pnw2-grant": ending.body.grant }))).body.error, "grant_invalid");
  });

  test("story: volunteering is one-per-lead, capped, and lottery entries land in the pool", async () => {
    await db.sql`INSERT INTO public.story_game_state (session_id, max_volunteers, current_writer_position) VALUES (${session.id}, 2, 1)`;
    const vol = async (sub: string, mode: string, name = "Writer") => {
      const { body: g } = await redeem({ sub });
      return { g, r: await read(await post(handleSubmit, { action: "story_volunteer", name, mode }, { "x-pnw2-grant": g.grant })) };
    };
    const a = await vol("lead-a", "slot", "  Ada  ");
    assert.equal(a.r.body.data.position, 1);
    assert.equal(a.r.body.data.participant_name, "Ada");
    assert.equal(a.r.body.data.participant_id, a.g.participant_key);
    assert.equal((await vol("lead-a", "slot")).r.body.data.id, a.r.body.data.id);
    assert.equal((await vol("lead-b", "slot")).r.body.data.position, 2);
    assert.equal((await vol("lead-c", "slot")).r.body.error, "full");
    assert.equal((await vol("lead-d", "lottery")).r.body.data.position, 1001);
    assert.equal((await vol("lead-e", "slot", "   ")).r.body.error, "invalid_name");
    assert.equal((await vol("lead-e", "slot", "x".repeat(41))).r.body.error, "invalid_name");
  });

  test("story: only the writer whose turn it is can add a word, and the turn advances", async () => {
    const a = await redeem({ sub: "lead-a" });
    const b = await redeem({ sub: "lead-b" });
    const word = async (grant: string, w: string) => read(await post(handleSubmit, { action: "story_word", word: w }, { "x-pnw2-grant": grant }));
    assert.equal((await word(b.body.grant, "Hello")).body.error, "not_your_turn");
    const w1 = await word(a.body.grant, " Once ");
    assert.equal(w1.body.data.word, "Once");
    assert.equal(w1.body.data.added_by, a.body.participant_key);
    assert.equal((await word(a.body.grant, "again")).body.error, "not_your_turn");
    assert.equal((await word(b.body.grant, "upon")).body.data.position, 2);
    const [gs] = await db.sql`SELECT current_writer_position FROM public.story_game_state WHERE session_id = ${session.id}`;
    assert.equal(gs.current_writer_position, 1);
    assert.equal((await read(await post(handleSubmit, { action: "story_word", word: "x", added_by: "presenter" }, { "x-pnw2-grant": a.body.grant }))).body.error, "identity_not_allowed");
  });

  test("unknown actions are refused", async () => {
    const { body: g } = await redeem();
    for (const action of ["story_topic_vote", "big_idea", "connect", undefined]) {
      assert.equal((await read(await post(handleSubmit, { action }, { "x-pnw2-grant": g.grant }))).body.error, "unknown_action");
    }
  });

  // ---------- paid-function guard ----------
  test("paid guard: grant or password-authorized presenter only; origin enforced", async () => {
    const { body: g } = await redeem();
    const req = (h: Record<string, string>) => new Request("https://fn.local", { method: "POST", headers: { Origin: ORIGIN, ...h } });
    assert.equal((await checkInteractiveAccess(req({ "x-pnw2-grant": g.grant }), deps))?.kind, "attendee");
    assert.equal((await checkInteractiveAccess(req({ Authorization: `Bearer user:${presenter}` }), deps))?.kind, "presenter");
    assert.equal(await checkInteractiveAccess(req({ Authorization: `Bearer user:${bareAnon}` }), deps), null);
    assert.equal(await checkInteractiveAccess(req({ Authorization: "Bearer sb_publishable_anon" }), deps), null);
    assert.equal(await checkInteractiveAccess(req({ "x-pnw2-grant": "0".repeat(64) }), deps), null);
    assert.equal(await checkInteractiveAccess(req({}), deps), null);
    assert.equal((await denyWithoutAccess(req({}), deps))?.status, 401);
    assert.equal(await denyWithoutAccess(req({ "x-pnw2-grant": g.grant }), deps), null);
    const evil = new Request("https://fn.local", { method: "POST", headers: { Origin: "https://evil.example", "x-pnw2-grant": g.grant } });
    assert.equal((await denyWithoutAccess(evil, deps))?.status, 403);
    await db.sql`UPDATE public.presenter_authorizations SET expires_at = now() - interval '1 second' WHERE user_id = ${presenter}`;
    assert.equal(await checkInteractiveAccess(req({ Authorization: `Bearer user:${presenter}` }), deps), null);
    await db.sql`UPDATE public.presenter_authorizations SET expires_at = now() + interval '1 hour' WHERE user_id = ${presenter}`;
  });

  // ---------- privileges ----------
  test("browser roles cannot call gate functions or read gate tables", async () => {
    for (const role of ["anon", "authenticated"] as const) {
      const uid = role === "authenticated" ? presenter : null;
      for (const stmt of [
        "SELECT public.gate_authorize_presenter(gen_random_uuid())",
        "SELECT public.gate_create_presenter_session(gen_random_uuid())",
        "SELECT public.gate_check_access(NULL, gen_random_uuid())",
        "SELECT public.gate_submit_poll_response('x', gen_random_uuid(), '{}')",
        "SELECT public.gate_revoke_lead('x')",
        "SELECT * FROM public.access_grants",
        "SELECT * FROM public.presenter_authorizations",
        "SELECT * FROM public.gate_config",
      ]) {
        const err = await attempt(db.sql, role, uid, (tx) => tx.unsafe(stmt));
        assert.match(err ?? "", /permission denied/, `${role}: ${stmt}`);
      }
    }
    const n = await as(db.sql, "service_role", null, (tx) => tx`SELECT count(*)::int AS n FROM public.access_grants`);
    assert.ok((n as Array<{ n: number }>)[0].n > 0);
  });
});
