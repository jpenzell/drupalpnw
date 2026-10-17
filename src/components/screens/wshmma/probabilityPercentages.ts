export const PROBABILITY_PHRASES = ["Slam dunk", "Rarely"] as const;

export function percentageSummary(values: unknown[]) {
  const valid = values.filter((value): value is number =>
    typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100
  );
  return {
    values: valid,
    count: valid.length,
    average: valid.length ? Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length) : null,
    min: valid.length ? Math.min(...valid) : null,
    max: valid.length ? Math.max(...valid) : null,
  };
}