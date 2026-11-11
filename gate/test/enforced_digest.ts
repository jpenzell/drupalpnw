// Prints the policy digest of baseline + 01_dormant + 02_enforce on the disposable local Postgres, using the
// same formula as the live readback (tablename|policyname|cmd|roles|qual|with_check, newline, ordered).
// Run: gate/test/pg-local.sh start && PNW2_GATE_PG=local bun gate/test/enforced_digest.ts; gate/test/pg-local.sh stop
import { freshDb } from "./db.ts";
const db = await freshDb(["test/baseline_schema.sql", "migrations/01_dormant_gate.sql", "migrations/02_enforce.sql"]);
const q = (where: string) => db.sql.unsafe(`select count(*)::int n, md5(string_agg(tablename||'|'||policyname||'|'||cmd||'|'||roles::text||'|'||coalesce(qual,'')||'|'||coalesce(with_check,''), E'\\n' order by tablename, policyname)) d from pg_policies where schemaname='public' ${where}`);
const deck = await q(`and tablename in ('sessions','polls','responses','story_game_state','story_topic_votes','story_topics','story_volunteers','story_words','big_idea_submissions','connect_submissions')`);
const all = await q("");
console.log(JSON.stringify({ deck: deck[0], all: all[0] }));
await db.drop();
