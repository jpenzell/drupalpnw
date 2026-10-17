import { useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { usePoll } from "@/contexts/PollContext";

type PollType = "multiple_choice" | "slider" | "text";

/**
 * Shared live-poll wiring for the All Minds experiments: the presenter
 * opens (or reuses) one poll per key; participants keep looking until it exists.
 * Values live in the existing polls/responses tables.
 */
export function useLivePoll(pollKey: string, type: PollType, config: Record<string, unknown> = {}) {
  const { session, isPresenter, isParticipant } = useSession();
  const poll = usePoll();
  const { currentPoll, responses, myResponse, createPoll, getPollForSlide, submitResponse } = poll;

  useEffect(() => {
    if (!session) return;
    if (isPresenter) {
      createPoll(pollKey, type, config);
      return;
    }
    let cancelled = false;
    let timer = 0;
    const find = async () => {
      const p = await getPollForSlide(pollKey);
      if (!p && !cancelled) timer = window.setTimeout(find, 2000);
    };
    timer = window.setTimeout(find, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, isPresenter, pollKey]);

  const active = currentPoll?.slide_id === pollKey;
  return {
    poll: active ? currentPoll : null,
    responses: active ? responses : [],
    mine: active ? myResponse : null,
    active,
    submit: submitResponse,
    isPresenter,
    isParticipant,
  };
}
