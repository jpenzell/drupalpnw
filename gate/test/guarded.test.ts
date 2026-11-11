// Checks the guarded copies of the paid functions: complete list, up to date with the live
// source, guard placed right after the preflight, no wildcard CORS left, nothing else changed.
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { deployedPath, GUARD_IMPORT, GUARD_LINES, GUARDED_FUNCTIONS, outputPath, sourceOf, transform, UNGUARDED_FUNCTIONS } from "../scripts/generate-guarded.ts";

const LIVE = join(import.meta.dir, "..", "..", "supabase", "functions");
const PROVIDER = /ai\.gateway\.lovable\.dev|api\.anthropic\.com|api\.openai\.com|api\.perplexity\.ai/;

test("every deployed function that calls a paid provider is guarded, except free captions", () => {
  const dirs = readdirSync(LIVE).filter((d) => !d.startsWith("_"));
  const paid = dirs.filter((d) => PROVIDER.test(readFileSync(join(LIVE, d, "index.ts"), "utf8")));
  const expected = [...GUARDED_FUNCTIONS, "translate-caption"].sort();
  assert.deepEqual(paid.sort(), expected);
  assert.equal(GUARDED_FUNCTIONS.length, 12);
  // The gate's own functions (deployed at Stage 1) call no provider; they are the gate itself.
  const GATE_OWN = ["submit-interaction", "create-presenter-session"];
  for (const d of dirs) assert.ok((GUARDED_FUNCTIONS as readonly string[]).includes(d) || (UNGUARDED_FUNCTIONS as readonly string[]).includes(d) || GATE_OWN.includes(d) || d === "send-connect-notification", `unclassified function ${d}`);
});

for (const name of GUARDED_FUNCTIONS) {
  test(`${name}: staged copy is current and only adds the guard`, () => {
    const src = sourceOf(name);
    const out = readFileSync(outputPath(name), "utf8");
    assert.equal(out, transform(name, src), "stale — run bun ./gate/scripts/generate-guarded.ts");
    // Stage 4: the deployed function is the guarded copy, byte for byte (never the unguarded original).
    assert.equal(readFileSync(deployedPath(name), "utf8"), out, "supabase/functions copy is not the guarded copy");
    assert.ok(!/Access-Control-Allow-Origin["']\s*:\s*["']\*["']/.test(out));
    assert.ok(out.includes(GUARD_IMPORT));
    const lines = out.split("\n");
    const opt = lines.findIndex((l) => /req\.method\s*===\s*["']OPTIONS["']/.test(l));
    const guard = lines.indexOf(GUARD_LINES[0]);
    assert.ok(guard > opt && guard - opt <= 3, "guard must immediately follow the preflight");
    // Removing the banner, import and guard and restoring CORS yields the original byte-for-byte.
    const restored = lines
      .slice(3)
      .filter((l) => l !== GUARD_IMPORT && !GUARD_LINES.includes(l))
      .join("\n")
      .replace(/(["'])Access-Control-Allow-Origin\1: PNW2_CORS_ORIGIN/, (_m, q) => `${q}Access-Control-Allow-Origin${q}: ${q}*${q}`);
    assert.equal(restored, src);
  });
}

test("retired connect notification never sends email", () => {
  const out = readFileSync(join(import.meta.dir, "..", "functions", "send-connect-notification", "index.ts"), "utf8");
  // Stage 4: the deployed notification is the retired 410 stub, byte for byte.
  assert.equal(readFileSync(join(LIVE, "send-connect-notification", "index.ts"), "utf8"), out);
  assert.ok(!/sendLovableEmail|createClient|fetch\(/.test(out));
  assert.match(out, /status: 410/);
});
