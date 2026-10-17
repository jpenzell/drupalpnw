import { useState, useEffect, useMemo, useRef } from "react";
import { Shuffle, Brain, TrendingUp, BarChart3 } from "lucide-react";
import { getTrueRandomNumbers, appendTrueRandomNumbers } from "./TrueRandomScreen";
import { getAIRandomNumbers } from "./AIRandomNumbersScreen";

// Build a histogram with bins of size 10: 1-10, 11-20, ..., 91-100
const buildHistogram = (numbers: number[]): number[] => {
  const bins = Array(10).fill(0);
  numbers.forEach(n => {
    const idx = Math.min(Math.floor((n - 1) / 10), 9);
    bins[idx]++;
  });
  return bins;
};

const binLabels = ["1-10", "11-20", "21-30", "31-40", "41-50", "51-60", "61-70", "71-80", "81-90", "91-100"];

const Histogram = ({ bins, color, maxAll }: { bins: number[]; color: string; maxAll: number }) => (
  <div className="flex items-end gap-1 h-28">
    {bins.map((count, i) => {
      const pct = maxAll > 0 ? (count / maxAll) * 100 : 0;
      return (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[9px] font-bold text-foreground">{count || ""}</span>
          <div
            className="w-full rounded-t transition-all duration-500"
            style={{ height: `${Math.max(pct, 2)}%`, backgroundColor: color, opacity: count > 0 ? 1 : 0.15 }}
          />
          <span className="text-[8px] text-muted-foreground leading-none">{binLabels[i]}</span>
        </div>
      );
    })}
  </div>
);

// Frequency bar showing individual number repeats
const FrequencyList = ({ numbers, color }: { numbers: number[]; color: string }) => {
  const freq: Record<number, number> = {};
  numbers.forEach(n => (freq[n] = (freq[n] || 0) + 1));

  const repeated = Object.entries(freq)
    .filter(([, c]) => c > 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  if (repeated.length === 0) {
    return <p className="text-xs text-muted-foreground italic">No repeated numbers — well distributed</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {repeated.map(([num, count]) => (
        <div
          key={num}
          className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {num} <span className="opacity-60">×{count}</span>
        </div>
      ))}
    </div>
  );
};

const calcStats = (numbers: number[]) => {
  if (numbers.length === 0) return { mean: "–", stdDev: "–", uniquePct: "–", clumpScore: "–" };

  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const variance = numbers.reduce((sum, n) => sum + (n - mean) ** 2, 0) / numbers.length;
  const stdDev = Math.sqrt(variance);

  const unique = new Set(numbers).size;
  const uniquePct = ((unique / numbers.length) * 100).toFixed(0);

  // Clump score: how much the distribution deviates from uniform
  // Perfect uniform across 10 bins = expected count per bin
  const bins = buildHistogram(numbers);
  const expected = numbers.length / 10;
  const chiSq = bins.reduce((sum, b) => sum + ((b - expected) ** 2) / Math.max(expected, 0.1), 0);

  return {
    mean: mean.toFixed(1),
    stdDev: stdDev.toFixed(1),
    uniquePct: `${uniquePct}%`,
    clumpScore: chiSq.toFixed(1),
  };
};

export const RandomComparisonScreen = () => {
  const [trueNumbers, setTrueNumbers] = useState<number[]>([]);
  const [aiNumbers, setAiNumbers] = useState<number[]>([]);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Continuously generate true random numbers & poll AI numbers
    const generate = () => {
      if (!mountedRef.current) return;
      setTrueNumbers(appendTrueRandomNumbers(4)); // add 4 crypto randoms each tick
      setAiNumbers(getAIRandomNumbers());
    };
    generate();
    const interval = setInterval(generate, 2000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  const trueBins = useMemo(() => buildHistogram(trueNumbers), [trueNumbers]);
  const aiBins = useMemo(() => buildHistogram(aiNumbers), [aiNumbers]);
  const maxBin = Math.max(...trueBins, ...aiBins, 1);

  const trueStats = useMemo(() => calcStats(trueNumbers), [trueNumbers]);
  const aiStats = useMemo(() => calcStats(aiNumbers), [aiNumbers]);

  const trueColor = "hsl(var(--secondary))";
  const aiColor = "hsl(var(--accent))";

  return (
    <div className="flex-1 flex flex-col animate-fade-in p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/30 rounded-full mb-3">
          <TrendingUp className="h-4 w-4 text-accent" />
          <span className="text-accent font-semibold tracking-wide text-xs uppercase">Comparison</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
          True Random vs. AI "Random"
        </h1>
        <p className="text-muted-foreground">
          Where do the numbers actually land?
        </p>
      </div>

      {/* Two-column comparison */}
      <div className="flex-1 grid md:grid-cols-2 gap-5 max-w-5xl mx-auto w-full">
        {/* True Random */}
        <div className="bg-secondary/10 border-2 border-secondary/30 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-secondary">
              <Shuffle className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">True Random</h3>
              <p className="text-xs text-muted-foreground">{trueNumbers.length} samples</p>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
              <BarChart3 className="h-3 w-3" /> Distribution (bins of 10)
            </p>
            <Histogram bins={trueBins} color={trueColor} maxAll={maxBin} />
          </div>

          <div className="mb-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Repeated Numbers</p>
            <FrequencyList numbers={trueNumbers} color={trueColor} />
          </div>

          <div className="grid grid-cols-4 gap-2 mt-auto pt-3 border-t border-border/30">
            <StatBox label="Mean" value={trueStats.mean} />
            <StatBox label="Std Dev" value={trueStats.stdDev} />
            <StatBox label="Unique" value={trueStats.uniquePct} />
            <StatBox label="χ² Score" value={trueStats.clumpScore} tooltip="Lower = more uniform" />
          </div>
        </div>

        {/* AI Models */}
        <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-accent">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">AI Models</h3>
              <p className="text-xs text-muted-foreground">{aiNumbers.length} samples</p>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
              <BarChart3 className="h-3 w-3" /> Distribution (bins of 10)
            </p>
            <Histogram bins={aiBins} color={aiColor} maxAll={maxBin} />
          </div>

          <div className="mb-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Repeated Numbers</p>
            <FrequencyList numbers={aiNumbers} color={aiColor} />
          </div>

          <div className="grid grid-cols-4 gap-2 mt-auto pt-3 border-t border-border/30">
            <StatBox label="Mean" value={aiStats.mean} />
            <StatBox label="Std Dev" value={aiStats.stdDev} />
            <StatBox label="Unique" value={aiStats.uniquePct} />
            <StatBox label="χ² Score" value={aiStats.clumpScore} tooltip="Higher = more clumpy" />
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="text-center mt-5 max-w-3xl mx-auto">
        <p className="text-lg text-foreground">
          <span className="text-secondary font-semibold">True random</span> spreads evenly across all ranges.{" "}
          <span className="text-accent font-semibold">AI</span> clusters around numbers that <em>"feel"</em> random — avoiding extremes, favoring the middle.
        </p>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, tooltip }: { label: string; value: string | number; tooltip?: string }) => (
  <div className="text-center" title={tooltip}>
    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="text-base font-bold text-foreground">{value}</p>
  </div>
);
