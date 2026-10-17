import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel, User } from "@supabase/supabase-js";

interface Session {
  id: string;
  code: string;
  current_slide: string;
  is_active: boolean;
  created_at: string;
  presenter_id?: string;
}

interface SessionContextType {
  session: Session | null;
  isPresenter: boolean;
  isParticipant: boolean;
  isSoloMode: boolean;
  participantId: string;
  participantCount: number;
  isLoading: boolean;
  error: string | null;
  authReady: boolean;
  createSession: () => Promise<Session | null>;
  joinSession: (code: string) => Promise<boolean>;
  updateSlide: (slideId: string) => Promise<void>;
  leaveSession: () => void;
  endSession: (keepPresenterMode?: boolean) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | null>(null);

// Generate a random 4-character code
const generateCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isPresenter, setIsPresenter] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // The participant ID is now auth.uid()
  const participantId = authUser?.id ?? "";

  // Auto sign-in anonymously on mount
  useEffect(() => {
    const initAuth = async () => {
      // Check for existing session first
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession?.user) {
        setAuthUser(existingSession.user);
        setAuthReady(true);
        return;
      }

      // Sign in anonymously
      const { data, error: signInError } = await supabase.auth.signInAnonymously();
      if (signInError) {
        console.error("Anonymous sign-in failed:", signInError);
      } else if (data.user) {
        setAuthUser(data.user);
      }
      setAuthReady(true);
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
    });

    initAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Subscribe to session updates
  useEffect(() => {
    if (!session || !participantId) return;

    const sessionChannel = supabase
      .channel(`session:${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          setSession((prev) => prev ? { ...prev, ...payload.new } : null);
        }
      )
      .on("presence", { event: "sync" }, () => {
        const state = sessionChannel.presenceState();
        const presences = Object.values(state).flat() as unknown as Array<{ participant_id: string; is_presenter?: boolean }>;
        const participantOnlyCount = presences.filter(p => !p.is_presenter).length;
        setParticipantCount(participantOnlyCount);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await sessionChannel.track({ participant_id: participantId, is_presenter: isPresenter });
        }
      });

    setChannel(sessionChannel);

    return () => {
      sessionChannel.unsubscribe();
    };
  }, [session?.id, participantId, isPresenter]);

  const createSession = useCallback(async (): Promise<Session | null> => {
    if (!participantId) return null;
    setIsLoading(true);
    setError(null);

    try {
      let code = generateCode();
      let attempts = 0;
      
      while (attempts < 10) {
        const { data: existing } = await supabase
          .from("sessions")
          .select("id")
          .eq("code", code)
          .eq("is_active", true)
          .single();

        if (!existing) break;
        code = generateCode();
        attempts++;
      }

      const { data, error: insertError } = await supabase
        .from("sessions")
        .insert({ code, current_slide: "P1", presenter_id: participantId })
        .select()
        .single();

      if (insertError) throw insertError;

      setSession(data);
      setIsPresenter(true);
      localStorage.setItem("presenter_session_id", data.id);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [participantId]);

  const joinSession = useCallback(async (code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("sessions")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (fetchError || !data) {
        setError("Session not found");
        return false;
      }

      setSession(data);
      setIsPresenter(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join session");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSlide = useCallback(async (slideId: string): Promise<void> => {
    if (!session || !isPresenter) return;

    const { error: updateError } = await supabase
      .from("sessions")
      .update({ current_slide: slideId })
      .eq("id", session.id);

    if (updateError) {
      console.error("Failed to update slide:", updateError);
    }
  }, [session, isPresenter]);

  const leaveSession = useCallback(() => {
    if (channel) {
      channel.unsubscribe();
    }
    setSession(null);
    setIsPresenter(false);
    setParticipantCount(0);
    localStorage.removeItem("presenter_session_id");
  }, [channel]);

  const endSession = useCallback(async (keepPresenterMode = false) => {
    if (!session || !isPresenter) return;

    await supabase
      .from("sessions")
      .update({ is_active: false })
      .eq("id", session.id);

    if (channel) {
      channel.unsubscribe();
    }
    setSession(null);
    if (!keepPresenterMode) {
      setIsPresenter(false);
    }
    setParticipantCount(0);
    localStorage.removeItem("presenter_session_id");
  }, [session, isPresenter, channel]);

  // Check for existing presenter session on mount (after auth ready)
  useEffect(() => {
    if (!authReady || !participantId) return;

    const storedSessionId = localStorage.getItem("presenter_session_id");
    if (storedSessionId) {
      supabase
        .from("sessions")
        .select("*")
        .eq("id", storedSessionId)
        .eq("is_active", true)
        .single()
        .then(({ data }) => {
          if (data) {
            // Only restore if we're the presenter
            if (data.presenter_id === participantId) {
              setSession(data);
              setIsPresenter(true);
            } else {
              localStorage.removeItem("presenter_session_id");
            }
          } else {
            localStorage.removeItem("presenter_session_id");
          }
        });
    }
  }, [authReady, participantId]);

  const isSoloMode = !session && !isLoading;

  return (
    <SessionContext.Provider
      value={{
        session,
        isPresenter,
        isParticipant: !!session && !isPresenter,
        isSoloMode,
        participantId,
        participantCount,
        isLoading,
        error,
        authReady,
        createSession,
        joinSession,
        updateSlide,
        leaveSession,
        endSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
