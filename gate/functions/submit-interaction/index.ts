// STAGED — not deployed. Deploy path at Stage 1: supabase/functions/submit-interaction/index.ts
import { runtimeDeps } from "../_shared/runtime.ts";
import { handleSubmit } from "./handler.ts";

Deno.serve((req) => handleSubmit(req, runtimeDeps()));
