import { useMemo } from "react";
import { usePoll } from "@/contexts/PollContext";
import { useSession } from "@/contexts/SessionContext";

interface LiveSliderVisualizationProps {
  min?: number;
  max?: number;
  showLabels?: boolean;
}

export const LiveSliderVisualization = ({
  min = 0,
  max = 100,
  showLabels = true,
}: LiveSliderVisualizationProps) => {
  const { responses } = usePoll();
  const { participantId } = useSession();

  const stats = useMemo(() => {
    const values = responses
      .map((r) => {
        const val = r.value as Record<string, unknown>;
        return val?.slider as number | undefined;
      })
      .filter((v): v is number => typeof v === "number");

    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const minVal = sorted[0];
    const maxVal = sorted[sorted.length - 1];
    const spread = maxVal - minVal;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    return { minVal, maxVal, spread, avg, count: values.length };
  }, [responses]);

  const myValue = useMemo(() => {
    const myResp = responses.find((r) => r.participant_id === participantId);
    if (!myResp) return undefined;
    const val = myResp.value as Record<string, unknown>;
    return val?.slider as number | undefined;
  }, [responses, participantId]);

  return (
    <div className="space-y-4">
      {/* Visual range display */}
      <div className="relative h-16 bg-muted/30 rounded-xl overflow-hidden">
        {/* Track */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-2 bg-muted rounded-full" />

        {/* Response dots */}
        {responses.map((response, idx) => {
          const val = response.value as Record<string, unknown>;
          const value = val?.slider as number | undefined;
          if (typeof value !== "number") return null;

          const position = ((value - min) / (max - min)) * 100;
          const isMyResponse = response.participant_id === participantId;

          return (
            <div
              key={response.id}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 ${
                isMyResponse ? "z-10" : ""
              }`}
              style={{ left: `calc(${position}% * 0.92 + 4%)` }}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 animate-scale-in ${
                  isMyResponse
                    ? "bg-primary border-primary-foreground scale-125"
                    : "bg-accent border-accent-foreground"
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              />
            </div>
          );
        })}

        {/* Min/max labels */}
        {showLabels && (
          <>
            <span className="absolute left-4 bottom-1 text-xs text-muted-foreground">
              {min}%
            </span>
            <span className="absolute right-4 bottom-1 text-xs text-muted-foreground">
              {max}%
            </span>
          </>
        )}
      </div>

      {/* Stats display */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-2xl font-bold text-foreground">{stats.count}</p>
            <p className="text-xs text-muted-foreground">Responses</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-2xl font-bold text-destructive">{stats.spread}</p>
            <p className="text-xs text-muted-foreground">Point Spread</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-2xl font-bold text-foreground">{Math.round(stats.avg)}%</p>
            <p className="text-xs text-muted-foreground">Average</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-2xl font-bold text-foreground">
              {stats.minVal}% - {stats.maxVal}%
            </p>
            <p className="text-xs text-muted-foreground">Range</p>
          </div>
        </div>
      )}

      {/* My response indicator */}
      {myValue !== undefined && (
        <p className="text-center text-sm text-muted-foreground">
          Your answer: <span className="font-bold text-primary">{myValue}%</span>
        </p>
      )}
    </div>
  );
};
