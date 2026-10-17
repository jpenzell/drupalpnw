import { useState } from "react";
import { Linkedin, Presentation, Coffee, Check, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LINKEDIN_URL = "https://www.linkedin.com/in/josh-penzell/";

const schema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email" })
    .max(255)
    .optional()
    .or(z.literal("")),
  note: z.string().trim().max(1000).optional(),
});

const Connect = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [wantsSlides, setWantsSlides] = useState(false);
  const [wantsFollowup, setWantsFollowup] = useState(false);
  const [linkedinClicked, setLinkedinClicked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const needsEmail = wantsSlides || wantsFollowup;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wantsSlides && !wantsFollowup && !linkedinClicked) {
      toast.error("Pick at least one option above.");
      return;
    }
    if (needsEmail && !email.trim()) {
      toast.error("Email is required for slides or a follow-up.");
      return;
    }
    const parsed = schema.safeParse({ name, email, note });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first?.message ?? "Please check your inputs.");
      return;
    }

    setSubmitting(true);
    const submissionId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const submittedAt = new Date().toISOString();

    const { error } = await supabase.from("connect_submissions").insert({
      name: name.trim() || null,
      email: email.trim() || null,
      note: note.trim() || null,
      wants_slides: wantsSlides,
      wants_followup: wantsFollowup,
      linkedin_clicked: linkedinClicked,
      user_agent: navigator.userAgent,
    });
    if (error) {
      setSubmitting(false);
      console.error("connect insert failed", error);
      toast.error("Something went wrong. Try again?");
      return;
    }

    const { error: notifyError } = await supabase.functions.invoke(
      "send-connect-notification",
      {
        body: {
          idempotencyKey: `connect-${submissionId}`,
          name: name.trim() || null,
          email: email.trim() || null,
          note: note.trim() || null,
          wantsSlides,
          wantsFollowup,
          linkedinClicked,
          submittedAt,
          userAgent: navigator.userAgent,
        },
      },
    );

    setSubmitting(false);

    if (notifyError) {
      console.error("notify failed", notifyError);
      toast.error("Your details were saved, but the notification failed. Please try again.");
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Thanks — you're on the list.
          </h1>
          <p className="text-muted-foreground">
            Josh will be in touch. Now go imagine.
          </p>
          {!linkedinClicked && (
            <a
              href={LINKEDIN_URL}
              className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"
            >
              <Linkedin className="w-4 h-4" /> Connect on LinkedIn
            </a>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10">
      <div className="max-w-md mx-auto space-y-8">
        <header className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-widest text-primary font-semibold">
            Rehearsing the Future
          </p>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Stay in touch with Josh
          </h1>
          <p className="text-muted-foreground text-sm">
            Pick what you'd like — fill in your details once.
          </p>
        </header>

        <a
          href={LINKEDIN_URL}
          onClick={() => setLinkedinClicked(true)}
          className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-colors ${
            linkedinClicked
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary"
          }`}
        >
          <Linkedin className="w-6 h-6 text-primary shrink-0" />
          <div className="text-left flex-1">
            <div className="font-semibold text-foreground">Connect on LinkedIn</div>
            <div className="text-xs text-muted-foreground">Opens Josh's profile in a new tab</div>
          </div>
          {linkedinClicked && <Check className="w-5 h-5 text-primary" />}
        </a>

        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset className="space-y-3">
            <legend className="sr-only">Choose what to receive</legend>

            <label
              className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${
                wantsSlides ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <input
                type="checkbox"
                checked={wantsSlides}
                onChange={(e) => setWantsSlides(e.target.checked)}
                className="mt-1 w-5 h-5 accent-primary"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Presentation className="w-5 h-5 text-primary" />
                  Email me when the slides go live
                </div>
                <div className="text-xs text-muted-foreground mt-1">One email. No list.</div>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${
                wantsFollowup ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <input
                type="checkbox"
                checked={wantsFollowup}
                onChange={(e) => setWantsFollowup(e.target.checked)}
                className="mt-1 w-5 h-5 accent-primary"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Coffee className="w-5 h-5 text-primary" />
                  I'd like a follow-up conversation
                </div>
                <div className="text-xs text-muted-foreground mt-1">Josh will reach out personally.</div>
              </div>
            </label>
          </fieldset>

          {(needsEmail || name || email || note) && (
            <div className="space-y-3 pt-2">
              <div>
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email {needsEmail && <span className="text-destructive">*</span>}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  required={needsEmail}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="you@company.com"
                />
              </div>
              {wantsFollowup && (
                <div>
                  <label htmlFor="note" className="text-sm font-medium text-foreground">
                    What do you want to talk about?{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="A sentence or two helps Josh prep."
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Submitting…
              </>
            ) : (
              "Send to Josh"
            )}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            Your details go directly to Josh. No newsletter, no sharing.
          </p>
        </form>
      </div>
    </main>
  );
};

export default Connect;
