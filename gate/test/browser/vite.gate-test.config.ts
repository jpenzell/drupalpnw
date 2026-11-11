// Browser acceptance build: the exact candidate source with exactly two substitutions —
//   1. src/lib/gate/config.ts  → a generated copy with GATE_MODE = $GATE_TEST_MODE ("enforce" default,
//      or "dual"); nothing else changed
//   2. src/integrations/supabase/client.ts → fakeSupabase.ts (offline; no backend transport)
// Output goes to /tmp/gatetest/dist ("enforce") or /tmp/gatetest/dist-dual and is never deployed.
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");
const REAL_CONFIG = path.join(ROOT, "src/lib/gate/config.ts");
const REAL_CLIENT = path.join(ROOT, "src/integrations/supabase/client.ts");
const OUT = "/tmp/gatetest";
const MODE = process.env.GATE_TEST_MODE ?? "enforce";
if (MODE !== "enforce" && MODE !== "dual") throw new Error(`GATE_TEST_MODE must be enforce or dual, got ${MODE}`);

function enforcedConfig(): string {
  const src = readFileSync(REAL_CONFIG, "utf8");
  // Accepts the source at any stage ("off" or "dual"); exactly one GATE_MODE line must match.
  const line = /^export const GATE_MODE = "(off|dual|enforce)" as GateMode;$/m;
  if ((src.match(new RegExp(line.source, "gm")) ?? []).length !== 1) {
    throw new Error("GATE_MODE line not found — refusing to build an unverified variant");
  }
  const flipped = src.replace(line, `export const GATE_MODE = "${MODE}" as GateMode;`);
  mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, `config.${MODE}.ts`);
  writeFileSync(file, flipped);
  return file;
}

function swap(): Plugin {
  const config = enforcedConfig();
  const client = path.join(__dirname, "fakeSupabase.ts");
  return {
    name: "gate-acceptance-swap",
    enforce: "pre",
    async resolveId(source, importer, options) {
      const r = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (!r) return null;
      if (r.id === REAL_CONFIG) return config;
      if (r.id === REAL_CLIENT) return client;
      return null;
    },
  };
}

export default defineConfig({
  root: ROOT,
  plugins: [swap(), react()],
  resolve: { alias: { "@": path.join(ROOT, "src") } },
  build: { outDir: path.join(OUT, MODE === "enforce" ? "dist" : "dist-dual"), emptyOutDir: true, sourcemap: false },
  logLevel: "warn",
});
