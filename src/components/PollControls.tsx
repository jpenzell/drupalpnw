import { usePoll } from "@/contexts/PollContext";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, BarChart3 } from "lucide-react";

interface PollControlsProps {
  slideId: string;
  pollType: "multiple_choice" | "slider" | "text";
  config?: Record<string, unknown>;
}

export const PollControls = ({ slideId, pollType, config }: PollControlsProps) => {
  const { isPresenter } = useSession();
  const { currentPoll, responses, createPoll, openPoll, closePoll, clearResponses } = usePoll();

  if (!isPresenter) return null;

  const handleTogglePoll = async () => {
    if (!currentPoll) {
      await createPoll(slideId, pollType, config);
    } else if (currentPoll.is_open) {
      await closePoll(currentPoll.id);
    } else {
      await openPoll(currentPoll.id);
    }
  };

  const handleReset = async () => {
    if (currentPoll) {
      await clearResponses(currentPoll.id);
    }
  };

  const isOpen = currentPoll?.is_open;
  const responseCount = responses.length;

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
      <Button
        size="sm"
        variant={isOpen ? "destructive" : "default"}
        onClick={handleTogglePoll}
        className="gap-2"
      >
        {isOpen ? (
          <>
            <Pause className="h-4 w-4" />
            Close Poll
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            {currentPoll ? "Reopen Poll" : "Start Poll"}
          </>
        )}
      </Button>

      {currentPoll && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>

          <div className="flex items-center gap-1 px-3 py-1.5 bg-background rounded text-sm">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="font-medium">{responseCount}</span>
            <span className="text-muted-foreground">responses</span>
          </div>
        </>
      )}
    </div>
  );
};
