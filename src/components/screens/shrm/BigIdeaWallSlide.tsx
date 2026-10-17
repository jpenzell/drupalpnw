import { useState, useEffect, useRef } from "react";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { Camera, Upload, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getPublicOrigin } from "@/lib/publicUrl";

interface BigIdea {
  id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
}

/**
 * S3b — The Big Idea wall.
 * Presenter / solo: live grid of all submissions for this session, with small QR.
 * Participant: photo capture/upload form.
 */
export const BigIdeaWallSlide = () => {
  const { session, isPresenter, isParticipant, participantId } = useSession();
  const [ideas, setIdeas] = useState<BigIdea[]>([]);

  // load + realtime
  useEffect(() => {
    if (!session) {
      setIdeas([]);
      return;
    }
    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from("big_idea_submissions")
        .select("id, photo_url, caption, created_at")
        .eq("session_id", session.id)
        .order("created_at", { ascending: false });
      if (!cancelled && !error && data) setIdeas(data);
    };

    load();

    const channel = supabase
      .channel(`big-ideas:${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "big_idea_submissions",
          filter: `session_id=eq.${session.id}`,
        },
        () => load(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [session?.id]);

  if (isParticipant) {
    return <ParticipantSubmit sessionId={session!.id} userId={participantId} />;
  }

  // Presenter / solo: wall view
  const joinUrl = session
    ? `${getPublicOrigin()}${window.location.pathname}?join=${session.code}`
    : null;

  return (
    <div className="flex-1 flex flex-col px-6 py-6 animate-fade-in overflow-hidden">
      <div className="flex items-start justify-between gap-6 mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-secondary font-semibold mb-2">
            The Wall of Big Ideas
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground leading-tight">
            What L&D is imagining{" "}
            <span className="text-primary">right now</span>
          </h2>
          <p className="text-base text-muted-foreground mt-2">
            {ideas.length} {ideas.length === 1 ? "idea" : "ideas"} so far —
            keep them coming.
          </p>
        </div>
        {session && joinUrl && (
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Join
              </p>
              <p className="text-2xl font-mono font-bold tracking-widest text-primary leading-tight">
                {session.code}
              </p>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-md">
              <QRCodeSVG value={joinUrl} size={88} level="M" />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {ideas.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-lg text-muted-foreground italic">
              {session
                ? "Waiting for the first big idea…"
                : "Start a session to start collecting ideas."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="aspect-square rounded-lg overflow-hidden border border-border shadow-md bg-muted animate-fade-in"
              >
                <img
                  src={idea.photo_url}
                  alt={idea.caption || "Big idea submission"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ----------------- Participant submit view -----------------

const ParticipantSubmit = ({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const submit = async () => {
    if (!file || !userId) return;
    setSubmitting(true);
    const toastId = toast.loading("Uploading your big idea…");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      // Path must be: <session>/<userId>/<filename> so storage RLS matches foldername[2]
      const path = `${sessionId}/${userId}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("big-idea-submissions")
        .upload(path, file, {
          contentType: file.type || "image/jpeg",
          cacheControl: "3600",
        });
      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("big-idea-submissions").getPublicUrl(path);

      const { error: dbErr } = await supabase
        .from("big_idea_submissions")
        .insert({
          session_id: sessionId,
          user_id: userId,
          photo_url: publicUrl,
        });
      if (dbErr) throw dbErr;

      toast.success("Your idea is on the wall!", { id: toastId });
      setDone(true);
    } catch (err: any) {
      console.error(err);
      toast.error(`Couldn't upload: ${err.message || "unknown error"}`, {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setFile(null);
    setDone(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl p-6 space-y-5">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold">
            Your Big Idea
          </p>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Snap something that captures it
          </h2>
        </div>

        {done ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/15 flex items-center justify-center">
              <Check className="w-7 h-7 text-primary" />
            </div>
            <p className="text-lg font-semibold text-foreground">
              On the wall!
            </p>
            <p className="text-sm text-muted-foreground">
              Look up at the main screen.
            </p>
            <Button variant="outline" onClick={reset} className="mt-2">
              Submit another
            </Button>
          </div>
        ) : !preview ? (
          <div className="space-y-3">
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFile}
              className="hidden"
            />
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
            <Button
              size="lg"
              className="w-full h-24 text-lg"
              onClick={() => cameraRef.current?.click()}
            >
              <Camera className="w-6 h-6 mr-2" /> Take Photo
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full h-16"
              onClick={() => galleryRef.current?.click()}
            >
              <Upload className="w-5 h-5 mr-2" /> Upload from Gallery
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <img
              src={preview}
              alt="Preview"
              className="w-full rounded-lg border border-border"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={reset}
                disabled={submitting}
              >
                Retake
              </Button>
              <Button
                className="flex-1"
                onClick={submit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…
                  </>
                ) : (
                  "Send to the wall"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
