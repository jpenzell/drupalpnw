// STAGED — not deployed. Deploy path at Stage 1: supabase/functions/create-presenter-session/index.ts
import { runtimeDeps } from "../_shared/runtime.ts";
import { handleCreatePresenterSession } from "./handler.ts";

Deno.serve((req) => handleCreatePresenterSession(req, runtimeDeps()));
