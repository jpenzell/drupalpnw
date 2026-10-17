import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State = "loading" | "valid" | "already" | "invalid" | "done" | "error";

const Unsubscribe = () => {
  const [state, setState] = useState<State>("loading");
  const [submitting, setSubmitting] = useState(false);
  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    fetch(
      `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
      { headers: { apikey: SUPABASE_ANON_KEY } }
    )
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) return setState("invalid");
        if (data.valid === false && data.reason === "already_unsubscribed") {
          return setState("already");
        }
        if (data.valid) return setState("valid");
        setState("invalid");
      })
      .catch(() => setState("error"));
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ token }),
      });
      const data = await r.json().catch(() => ({}));
      if (data.success || data.reason === "already_unsubscribed") {
        setState("done");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        {state === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-muted-foreground">Checking your link…</p>
          </div>
        )}

        {state === "valid" && (
          <>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Unsubscribe from these emails?
            </h1>
            <p className="text-muted-foreground">
              You won't get any more messages from Josh's presentation list.
            </p>
            <button
              type="button"
              onClick={confirm}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm unsubscribe"}
            </button>
          </>
        )}

        {state === "done" && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              You're unsubscribed.
            </h1>
            <p className="text-muted-foreground">We won't email this address again.</p>
          </>
        )}

        {state === "already" && (
          <>
            <h1 className="text-3xl font-display font-bold text-foreground">
              You're already unsubscribed.
            </h1>
            <p className="text-muted-foreground">No further action needed.</p>
          </>
        )}

        {(state === "invalid" || state === "error") && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <X className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {state === "invalid" ? "Invalid link" : "Something went wrong"}
            </h1>
            <p className="text-muted-foreground">
              {state === "invalid"
                ? "This unsubscribe link isn't valid or has expired."
                : "Please try again in a moment."}
            </p>
          </>
        )}
      </div>
    </main>
  );
};

export default Unsubscribe;
