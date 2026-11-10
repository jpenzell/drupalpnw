// RLS before/after enforcement and exact rollback, on a disposable local Postgres.
import { afterAll, beforeAll, describe, test } from "bun:test";
import assert from "node:assert/strict";
import { as, attempt, DB_TESTS_ENABLED, file, freshDb, policySnapshot, rpcAdapter } from "./db.ts";

const RLS = /row-level security|permission denied/;

describe.skipIf(!DB_TESTS_ENABLED)("RLS: dormant → enforce → rollback", () => {
  let db: Awaited<ReturnType<typeof freshDb>>;
  let baseline: string[];
  const presenter = crypto.randomUUID();
  const legacyPresenter = crypto.randomUUID();
  const attendee = crypto.randomUUID();
  let sessionId: string, pollId: string, legacySessionId: string, legacyPollId: string;

  beforeAll(async () => {
    db = await freshDb(["test/baseline_schema.sql"]);
    baseline = await policySnapshot(db.sql);
    await db.sql.unsafe(file("migrations/01_dormant_gate.sql"));
    await db.sql.unsafe(file("data/stage1_config.sql"));
    await db.sql`INSERT INTO auth.users (id) VALUES (${presenter}), (${legacyPresenter}), (${attendee})`;
    const rpc = rpcAdapter(db.sql);
    await rpc.rpc("gate_authorize_presenter", { p_user: presenter });
    const s = await rpc.rpc("gate_create_presenter_session", { p_user: presenter });
    sessionId = (s.data as { id: string }).id;
    [{ id: pollId }] = await db.sql`INSERT INTO public.polls (session_id, slide_id, poll_type) VALUES (${sessionId}, 'p', 'text') RETURNING id`;
    [{ id: legacySessionId }] = await db.sql`INSERT INTO public.sessions (code, presenter_id) VALUES ('OLD1', ${legacyPresenter}) RETURNING id`;
    [{ id: legacyPollId }] = await db.sql`INSERT INTO public.polls (session_id, slide_id, poll_type) VALUES (${legacySessionId}, 'p', 'text') RETURNING id`;
  });
  afterAll(async () => { await db?.drop(); });

  test("dormant stage leaves today's access unchanged (incl. today's unauthenticated writes)", async () => {
    assert.deepEqual(await policySnapshot(db.sql), baseline);
    assert.equal(await attempt(db.sql, "anon", null, (tx) => tx`INSERT INTO public.responses (poll_id, participant_id, value) VALUES (${pollId}, 'made-up-id', '{"x":1}')`), null);
    assert.equal(await attempt(db.sql, "authenticated", attendee, (tx) => tx`INSERT INTO public.sessions (code, presenter_id) VALUES ('SELF', ${attendee})`), null);
    assert.equal(await attempt(db.sql, "anon", null, (tx) => tx`INSERT INTO public.connect_submissions (name) VALUES ('synthetic')`), null);
    await db.sql`DELETE FROM public.responses; DELETE FROM public.sessions WHERE code = 'SELF'; DELETE FROM public.connect_submissions`.simple();
  });

  test("enforce: every direct attendee write path is closed", async () => {
    await db.sql.unsafe(file("migrations/02_enforce.sql"));
    const denied = async (role: "anon" | "authenticated", sub: string | null, q: (tx: any) => Promise<unknown>, label: string) =>
      assert.match((await attempt(db.sql, role, sub, q)) ?? "allowed", RLS, label);
    await denied("anon", null, (tx) => tx`INSERT INTO public.responses (poll_id, participant_id, value) VALUES (${pollId}, 'made-up-id', '{"x":1}')`, "anon response insert");
    await denied("authenticated", attendee, (tx) => tx`INSERT INTO public.responses (poll_id, participant_id, value) VALUES (${pollId}, ${attendee}, '{"x":1}')`, "own response insert");
    await denied("authenticated", attendee, (tx) => tx`INSERT INTO public.sessions (code, presenter_id) VALUES ('SELF', ${attendee})`, "session create");
    await denied("authenticated", attendee, (tx) => tx`INSERT INTO public.story_volunteers (session_id, participant_id, position) VALUES (${sessionId}, ${attendee}, 1)`, "volunteer");
    await denied("authenticated", attendee, (tx) => tx`INSERT INTO public.story_words (session_id, word, added_by, position) VALUES (${sessionId}, 'x', ${attendee}, 1)`, "word");
    await denied("authenticated", attendee, (tx) => tx`INSERT INTO public.story_topics (session_id, text, submitted_by) VALUES (${sessionId}, 'x', ${attendee})`, "topic");
    await denied("authenticated", attendee, (tx) => tx`INSERT INTO public.big_idea_submissions (session_id, user_id, photo_url) VALUES (${sessionId}, ${attendee}, 'x')`, "big idea");
    await denied("anon", null, (tx) => tx`INSERT INTO public.connect_submissions (name) VALUES ('synthetic')`, "legacy lead form");
    // The legacy owner of an old session is not a proven presenter for new response inserts.
    await denied("authenticated", legacyPresenter, (tx) => tx`INSERT INTO public.responses (poll_id, participant_id, value) VALUES (${legacyPollId}, 'manual-1', '{"x":1}')`, "unproven presenter");
    // Anonymous updates of existing answers are closed too.
    await db.sql`INSERT INTO public.responses (poll_id, participant_id, value) VALUES (${pollId}, 'lead_x', '{"x":1}')`;
    const rows = await as(db.sql, "anon", null, (tx) => tx`UPDATE public.responses SET value = '{"x":2}' WHERE poll_id = ${pollId} RETURNING id`);
    assert.equal((rows as unknown[]).length, 0);
  });

  test("enforce: proven presenter keeps stage operations", async () => {
    const ok = async (q: (tx: any) => Promise<unknown>, label: string) => assert.equal(await attempt(db.sql, "authenticated", presenter, q), null, label);
    await ok((tx) => tx`INSERT INTO public.responses (poll_id, participant_id, value) VALUES (${pollId}, 'manual-1', '{"number":7}')`, "manual stage entry");
    await ok((tx) => tx`INSERT INTO public.story_volunteers (session_id, participant_id, participant_name, position) VALUES (${sessionId}, 'voluntold-1', 'Brave Soul #1', 1)`, "voluntold");
    await ok((tx) => tx`UPDATE public.story_volunteers SET position = 2 WHERE session_id = ${sessionId}`, "lottery commit");
    await ok((tx) => tx`INSERT INTO public.story_words (session_id, word, added_by, position) VALUES (${sessionId}, 'Once', ${presenter}, 1)`, "presenter word");
    await ok((tx) => tx`INSERT INTO public.polls (session_id, slide_id, poll_type) VALUES (${sessionId}, 'p2', 'slider')`, "create poll");
    await ok((tx) => tx`UPDATE public.sessions SET current_slide = 'S1' WHERE id = ${sessionId}`, "advance slide");
    await ok((tx) => tx`DELETE FROM public.responses WHERE poll_id = ${pollId}`, "clear responses");
  });

  test("enforce: free/public reads are preserved", async () => {
    await db.sql`INSERT INTO public.responses (poll_id, participant_id, value) VALUES (${pollId}, 'lead_y', '{"x":1}')`;
    const s = await as(db.sql, "anon", null, (tx) => tx`SELECT id FROM public.sessions WHERE id = ${sessionId}`);
    const p = await as(db.sql, "anon", null, (tx) => tx`SELECT id FROM public.polls WHERE session_id = ${sessionId}`);
    const r = await as(db.sql, "anon", null, (tx) => tx`SELECT id FROM public.responses WHERE poll_id = ${pollId}`);
    const v = await as(db.sql, "authenticated", attendee, (tx) => tx`SELECT id FROM public.story_volunteers WHERE session_id = ${sessionId}`);
    assert.equal((s as unknown[]).length, 1);
    assert.ok((p as unknown[]).length >= 1);
    assert.equal((r as unknown[]).length, 1);
    assert.equal((v as unknown[]).length, 1);
  });

  test("rollback restores the exact baseline policies and today's behavior", async () => {
    await db.sql.unsafe(file("migrations/99_rollback_enforce.sql"));
    assert.deepEqual(await policySnapshot(db.sql), baseline);
    assert.equal(await attempt(db.sql, "anon", null, (tx) => tx`INSERT INTO public.responses (poll_id, participant_id, value) VALUES (${pollId}, 'made-up-2', '{"x":1}')`), null);
  });
});
