// STAGED — not deployed. Deploy path at Stage 1: supabase/functions/redeem-access/index.ts
import { runtimeDeps } from "../_shared/runtime.ts";
import { handleRedeem } from "./handler.ts";

Deno.serve((req) => handleRedeem(req, runtimeDeps()));
