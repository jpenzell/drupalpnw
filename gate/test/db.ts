// Disposable local Postgres helpers for gate tests. Refuses anything but the local test server,
// and never reads the sandbox PG* environment (which points at the real project backend).
import { SQL } from "bun";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Rpc, RpcResult } from "../functions/_shared/gateHttp.ts";

export const PG_PORT = 54329;
export const DB_TESTS_ENABLED = process.env.PNW2_GATE_PG === "local";

const GATE = join(import.meta.dir, "..");
export const file = (rel: string) => readFileSync(join(GATE, rel), "utf8");

function connect(database: string) {
  return new SQL({
    hostname: "127.0.0.1",
    port: PG_PORT,
    username: "pgtest",
    password: "local-trust",
    database,
    tls: false,
    max: 4,
  });
}

export async function freshDb(stages: string[]) {
  const name = `gate_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const admin = connect("postgres");
  await admin.unsafe(`CREATE DATABASE ${name}`);
  await admin.close();
  const sql = connect(name);
  for (const s of stages) await sql.unsafe(file(s));
  return {
    sql,
    name,
    async drop() {
      await sql.close();
      const a = connect("postgres");
      await a.unsafe(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
      await a.close();
    },
  };
}

export type Tx = SQL;

/** Run `fn` inside a transaction as a Supabase role, with auth.uid() = sub. */
export async function as<T>(sql: SQL, role: "anon" | "authenticated" | "service_role", sub: string | null, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return sql.begin(async (tx) => {
    await tx.unsafe(`SET LOCAL ROLE ${role}`);
    if (sub) await tx`SELECT set_config('request.jwt.claim.sub', ${sub}, true)`;
    return fn(tx as unknown as Tx);
  }) as Promise<T>;
}

/** Like as(), but resolves to the error message (or null when the statement succeeded). */
export async function attempt(sql: SQL, role: "anon" | "authenticated" | "service_role", sub: string | null, fn: (tx: Tx) => Promise<unknown>): Promise<string | null> {
  try {
    await as(sql, role, sub, fn);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

/** supabase-js-compatible rpc() executing as service_role against the real local functions. */
export function rpcAdapter(sql: SQL): Rpc {
  return {
    async rpc(fn: string, args: Record<string, unknown>): Promise<RpcResult> {
      if (!/^[a-z_]+$/.test(fn)) throw new Error("bad fn");
      const keys = Object.keys(args);
      // Objects go through as-is (Bun encodes them as JSON for jsonb), mirroring supabase-js.
      const values = keys.map((k) => args[k]);
      const call = `SELECT public.${fn}(${keys.map((k, i) => `${k} => $${i + 1}`).join(", ")}) AS r`;
      try {
        const rows = await as(sql, "service_role", null, (tx) => tx.unsafe(call, values as never[]));
        return { data: (rows as Array<{ r: unknown }>)[0]?.r ?? null, error: null };
      } catch (e) {
        return { data: null, error: { message: (e as Error).message } };
      }
    },
  };
}

export async function policySnapshot(sql: SQL): Promise<string[]> {
  const rows = await sql`
    SELECT tablename, policyname, cmd, roles::text AS roles, coalesce(qual, '') AS qual, coalesce(with_check, '') AS chk
    FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname`;
  return (rows as Array<Record<string, string>>).map((r) => `${r.tablename}|${r.policyname}|${r.cmd}|${r.roles}|${r.qual}|${r.chk}`);
}
