import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GATE_MODE, MAINSITE_CAPTURE_URL } from "@/lib/gate/config";
import { authorizePresenter, gate, isEmbeddedWindow, presenterAuthorized } from "@/lib/gate/gateClient";
import type { Access } from "@/lib/gate/gateCore";
import { entryDecision } from "@/lib/gate/standalone";

type State = "checking" | "open" | "denied";

const Shell = ({ children }: { children: ReactNode }) => (
  <main className="min-h-[100dvh] w-full flex items-center justify-center bg-background text-foreground p-6">
    <div className="w-full max-w-md space-y-5 text-center">{children}</div>
  </main>
);

function EventPageNotice({ expired = false }: { expired?: boolean }) {
  return (
    <Shell>
      <h1 className="font-display text-3xl font-semibold">AI for All Minds</h1>
      <p className="font-body text-muted-foreground">
        {expired
          ? "Your access to the interactive presentation has ended."
          : "The interactive presentation opens from the event page after you enter your name and email."}
      </p>
      <Button asChild size="lg">
        <a href={MAINSITE_CAPTURE_URL} target="_top" rel="noopener">Go to the event page</a>
      </Button>
      <p className="font-body text-sm text-muted-foreground">The recording and transcript there are free to everyone.</p>
    </Shell>
  );
}

function PresenterEntry({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    setBusy(true);
    setError("");
    const ok = await authorizePresenter(password);
    setBusy(false);
    if (ok) onDone();
    else setError("That password didn't work.");
  };
  return (
    <Shell>
      <h1 className="font-display text-3xl font-semibold">Presenter sign-in</h1>
      <p className="font-body text-muted-foreground">Enter the presentation password to open the stage deck.</p>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <Input type="password" autoComplete="current-password" aria-label="Presentation password"
          value={password} onChange={(e) => setPassword(e.target.value)} maxLength={100} />
        <Button type="submit" size="lg" className="w-full" disabled={busy || !password}>
          {busy ? "Checking…" : "Open the deck"}
        </Button>
        {error && <p role="alert" className="font-body text-sm text-destructive">{error}</p>}
      </form>
    </Shell>
  );
}

function NoLiveActivityNotice() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div role="status" className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-xl flex items-center justify-center gap-3 rounded-lg bg-secondary text-secondary-foreground px-4 py-2 font-body text-sm shadow-lg">
      <span>Live activity isn't running right now — explore the deck and demos on your own.</span>
      <button type="button" className="underline" onClick={() => setHidden(true)}>Dismiss</button>
    </div>
  );
}

/**
 * Whole-deck entry gate (active only when GATE_MODE is "enforce"). Framed visitors need a verified
 * MainSite token; standalone visitors need server-checked presenter authority, else they go to the
 * MainSite capture page. Backend checks remain the real enforcement; this keeps the UI honest.
 */
export function AccessGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const decision = entryDecision({ mode: GATE_MODE, embedded: isEmbeddedWindow(), pathname: location.pathname });
  const [state, setState] = useState<State>(decision === "render" ? "open" : "checking");
  const [access, setAccess] = useState<Access | null>(null);
  const [everOpen, setEverOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (decision === "render") { setState("open"); return; }
    if (decision === "presenter_login") { setState("checking"); return; }
    if (decision === "await_access") {
      const off = gate.listen((a) => {
        if (cancelled) return;
        setAccess(a);
        setState(a ? "open" : "denied");
      });
      void gate.connect().then((a) => {
        if (cancelled) return;
        setAccess(a);
        setState(a ? "open" : "denied");
        if (a) setEverOpen(true);
      });
      return () => { cancelled = true; off(); };
    }
    // check_presenter
    void presenterAuthorized().then((ok) => {
      if (cancelled) return;
      if (ok) setState("open");
      else window.location.replace(MAINSITE_CAPTURE_URL);
    });
    return () => { cancelled = true; };
  }, [decision]);

  if (decision === "presenter_login") return <PresenterEntry onDone={() => navigate("/", { replace: true })} />;
  if (state === "checking") {
    return <Shell><p role="status" className="font-body text-muted-foreground">Checking access…</p></Shell>;
  }
  if (state === "denied") return decision === "await_access" ? <EventPageNotice expired={everOpen} /> : null;
  return (
    <>
      {decision === "await_access" && access && !access.session && <NoLiveActivityNotice />}
      {children}
    </>
  );
}
