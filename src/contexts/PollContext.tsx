import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./SessionContext";
import { Json } from "@/integrations/supabase/types";

type PollType = "multiple_choice" | "slider" | "text";

interface Poll {
  id: string;
  session_id: string;
  slide_id: string;
  poll_type: PollType;
  poll_config: Json;
  is_open: boolean;
  created_at: string;
}

interface PollResponse {
  id: string;
  poll_id: string;
  participant_id: string;
  value: Json;
  created_at: string;
}

interface PollContextType {
  currentPoll: Poll | null;
  responses: PollResponse[];
  myResponse: PollResponse | null;
  isLoading: boolean;
  error: string | null;
  createPoll: (slideId: string, pollType: PollType, config?: Record<string, unknown>) => Promise<Poll | null>;
  openPoll: (pollId: string) => Promise<void>;
  closePoll: (pollId: string) => Promise<void>;
  submitResponse: (value: Record<string, unknown>) => Promise<boolean>;
  getPollForSlide: (slideId: string) => Promise<Poll | null>;
  clearResponses: (pollId: string) => Promise<void>;
}

const PollContext = createContext<PollContextType | null>(null);

export const PollProvider = ({ children }: { children: ReactNode }) => {
  const { session, participantId } = useSession();
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [responses, setResponses] = useState<PollResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to poll responses
  useEffect(() => {
    if (!currentPoll) {
      setResponses([]);
      return;
    }

    // Fetch initial responses
    supabase
      .from("responses")
      .select("*")
      .eq("poll_id", currentPoll.id)
      .then(({ data }) => {
        if (data) setResponses(data as PollResponse[]);
      });

    // Subscribe to new responses
    const channel = supabase
      .channel(`poll:${currentPoll.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "responses",
          filter: `poll_id=eq.${currentPoll.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setResponses((prev) => [...prev, payload.new as PollResponse]);
          } else if (payload.eventType === "UPDATE") {
            setResponses((prev) =>
              prev.map((r) => (r.id === payload.new.id ? (payload.new as PollResponse) : r))
            );
          } else if (payload.eventType === "DELETE") {
            setResponses((prev) => prev.filter((r) => r.id !== (payload.old as PollResponse).id));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "polls",
          filter: `id=eq.${currentPoll.id}`,
        },
        (payload) => {
          setCurrentPoll((prev) => (prev ? { ...prev, ...(payload.new as Poll) } : null));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentPoll?.id]);

  const createPoll = useCallback(
    async (slideId: string, pollType: PollType, config: Record<string, unknown> = {}): Promise<Poll | null> => {
      if (!session) return null;
      setIsLoading(true);
      setError(null);

      try {
        // Check if poll already exists for this slide
        const { data: existing } = await supabase
          .from("polls")
          .select("*")
          .eq("session_id", session.id)
          .eq("slide_id", slideId)
          .single();

        if (existing) {
          setCurrentPoll(existing as Poll);
          return existing as Poll;
        }

        const { data, error: insertError } = await supabase
          .from("polls")
          .insert({
            session_id: session.id,
            slide_id: slideId,
            poll_type: pollType,
            poll_config: config as Json,
            is_open: true,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const poll = data as Poll;
        setCurrentPoll(poll);
        return poll;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create poll");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const getPollForSlide = useCallback(
    async (slideId: string): Promise<Poll | null> => {
      if (!session) return null;

      const { data } = await supabase
        .from("polls")
        .select("*")
        .eq("session_id", session.id)
        .eq("slide_id", slideId)
        .single();

      if (data) {
        const poll = data as Poll;
        setCurrentPoll(poll);
        return poll;
      }
      return null;
    },
    [session]
  );

  const openPoll = useCallback(async (pollId: string): Promise<void> => {
    await supabase.from("polls").update({ is_open: true }).eq("id", pollId);
  }, []);

  const closePoll = useCallback(async (pollId: string): Promise<void> => {
    await supabase.from("polls").update({ is_open: false }).eq("id", pollId);
  }, []);

  const submitResponse = useCallback(
    async (value: Record<string, unknown>): Promise<boolean> => {
      if (!currentPoll || !currentPoll.is_open) return false;

      try {
        const { error: upsertError } = await supabase.from("responses").upsert(
          {
            poll_id: currentPoll.id,
            participant_id: participantId,
            value: value as Json,
          },
          {
            onConflict: "poll_id,participant_id",
          }
        );

        if (upsertError) throw upsertError;
        return true;
      } catch (err) {
        console.error("Failed to submit response:", err);
        return false;
      }
    },
    [currentPoll, participantId]
  );

  const clearResponses = useCallback(async (pollId: string): Promise<void> => {
    await supabase.from("responses").delete().eq("poll_id", pollId);
    setResponses([]);
  }, []);

  const myResponse = responses.find((r) => r.participant_id === participantId) || null;

  return (
    <PollContext.Provider
      value={{
        currentPoll,
        responses,
        myResponse,
        isLoading,
        error,
        createPoll,
        openPoll,
        closePoll,
        submitResponse,
        getPollForSlide,
        clearResponses,
      }}
    >
      {children}
    </PollContext.Provider>
  );
};

export const usePoll = () => {
  const context = useContext(PollContext);
  if (!context) {
    throw new Error("usePoll must be used within a PollProvider");
  }
  return context;
};
