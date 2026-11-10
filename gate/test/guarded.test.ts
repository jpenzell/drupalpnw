// Checks the guarded copies of the paid functions: complete list, up to date with the live
// source, guard placed right after the preflight, no wildcard CORS left, nothing else changed.
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GUARD_IMPORT, GUARD_LINES, GUARDED_FUNCTIONS, outputPath, sourceOf, transform, UNGUARDED_FUNCTIONS } from "../scripts/generate-guarded.ts";

const LIVE = join(import.meta.dir, "..", "..", "supabase", "functions");
const PROVIDER = /ai\.gateway\.lovable\.dev|api\.anthropic\.com|api\.openai\.com|api\.perplexity\.ai/;

test("every deployed function that calls a paid provider is guarded, except free captions", () => {
  const dirs = readdirSync(LIVE).filter((d) => !d.startsWith("_"));
  const paid = dirs.filter((d) => PROVIDER.test(readFileSync(join(LIVE, d, "index.ts"), "utf8")));
  const expected = [...GUARDED_FUNCTIONS, "translate-caption"].sort();
  assert.deepEqual(paid.sort(), expected);
  assert.equal(GUARDED_FUNCTIONS.length, 12);
  for (const d of dirs) assert.ok((GUARDED_FUNCTIONS as readonly string[]).includes(d) || (UNGUARDED_FUNCTIONS as readonly string[]).includes(d) || d === "send-connect-notification", `unclassified function ${d}`);
});

for (const name of GUARDED_FUNCTIONS) {
  test(`${name}: staged copy is current and only adds the guard`, () => {
    const src = sourceOf(name);
    const out = readFileSync(outputPath(name), "utf8");
    assert.equal(out, transform(name, src), "stale — run bun ./gate/scripts/generate-guarded.ts");
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
      .replace(/(["'])Access-Control-Allow-Origin\1: PNW2_CORS_ORIGIN/, (_m, q) => `${q}Access-Control-Allow-Origin${q}: ${q}*${q}`)
      .replace(", x-pnw2-grant", "");
    assert.equal(restored, src);
  });
}

test("retired connect notification never sends email", () => {
  const out = readFileSync(join(import.meta.dir, "..", "functions", "send-connect-notification", "index.ts"), "utf8");
  assert.ok(!/sendLovableEmail|createClient|fetch\(/.test(out));
  assert.match(out, /status: 410/);
});
