// Prints the exact activation map (staged source → live destination, sha256) without copying
// anything. Run: bun gate/scripts/activation-map.ts
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GUARDED_FUNCTIONS } from "./generate-guarded.ts";

const ROOT = join(import.meta.dir, "../..");
const sha = (p: string) => createHash("sha256").update(readFileSync(join(ROOT, p))).digest("hex").slice(0, 16);
const rows: Array<[string, string, string, string, string]> = [];
const add = (stage: string, src: string, dest: string, note: string) =>
  rows.push([stage, src, dest, existsSync(join(ROOT, src)) ? sha(src) : "MISSING", note + (existsSync(join(ROOT, dest)) ? " (replaces existing)" : " (new)")]);

add("1", "gate/migrations/01_dormant_gate.sql", "migration tool (additive)", "tables + service-role-only functions");
add("1", "gate/data/stage1_config.sql", "data tool", "config row, maintenance");
for (const f of readdirSync(join(ROOT, "gate/functions/_shared")).filter((f) => !f.endsWith(".test.ts")).sort()) {
  add("1", `gate/functions/_shared/${f}`, `supabase/functions/_shared/${f}`, "shared");
}
for (const fn of ["submit-interaction", "create-presenter-session"]) {
  for (const f of ["index.ts", "handler.ts"]) add("1", `gate/functions/${fn}/${f}`, `supabase/functions/${fn}/${f}`, "new function");
}
add("2", "src/lib/gate/config.ts", "src/lib/gate/config.ts", 'GATE_MODE "off" → "dual", then publish');
add("3", "gate/data/stage3_enable_interactive.sql", "data tool", "interactive on");
for (const fn of GUARDED_FUNCTIONS) add("4", `gate/functions/${fn}/index.ts`, `supabase/functions/${fn}/index.ts`, "guarded copy");
add("4", "gate/functions/send-connect-notification/index.ts", "supabase/functions/send-connect-notification/index.ts", "retired (410, no email)");
add("4", "gate/migrations/02_enforce.sql", "migration tool", "closes direct attendee writes");
add("4", "src/lib/gate/config.ts", "src/lib/gate/config.ts", 'GATE_MODE "dual" → "enforce", then publish');
add("R", "gate/data/rollback_maintenance.sql", "data tool", "maintenance; reopens nothing");

console.log("| Stage | Staged source | Destination | sha256 (16) | Note |\n|---|---|---|---|---|");
for (const r of rows) console.log(`| ${r.join(" | ")} |`);
