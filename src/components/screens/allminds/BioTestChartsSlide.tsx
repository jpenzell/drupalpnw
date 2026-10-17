import { TOVA_BORDERLINE, TOVA_LIMIT, tovaResults } from "./tovaResults";

const y = (score: number) => 330 - ((score - 40) / 100) * 270;

export const BioTestChartsSlide = () => (
  <div className="flex-1 flex flex-col justify-center px-20 py-12 gap-10 animate-fade-in">
    <div>
      <p className="text-[28px] font-mono text-secondary font-semibold">MY T.O.V.A. VISUAL RESULTS</p>
      <h2 className="text-[76px] font-display font-bold text-foreground leading-tight mt-3">
        My results, against the normal limits.
      </h2>
    </div>

    <div className="grid grid-cols-4 gap-8">
      {tovaResults.map((result) => (
        <div key={result.title} className="min-w-0">
          <h3 className="text-[34px] font-display font-semibold text-foreground mb-3">{result.title}</h3>
          <svg viewBox="0 0 390 420" className="w-full" role="img"
            aria-label={`${result.title}: Q1 ${result.labels[0]}, Q2 ${result.labels[1]}, Q3 ${result.labels[2]}, Q4 ${result.labels[3]}. Normal-limit line at 80; borderline line at 85.`}>
            <rect x="50" y="60" width="330" height={y(TOVA_LIMIT) - 60} className="fill-muted" />
            {[40, 60, 80, 100, 120, 140].map((tick) => (
              <g key={tick}>
                <line x1="50" x2="380" y1={y(tick)} y2={y(tick)} className="stroke-border" />
                <text x="40" y={y(tick) + 8} textAnchor="end" className="fill-muted-foreground text-[24px]">{tick}</text>
              </g>
            ))}
            {result.scores.map((score, index) => {
              const x = 66 + index * 82;
              const outside = score === null || score < TOVA_LIMIT;
              return (
                <g key={index}>
                  {score === null ? (
                    <path d={`M ${x + 12} 313 L ${x + 38} 313 L ${x + 25} 333 Z`} className="fill-destructive" />
                  ) : (
                    <rect x={x} y={y(score)} width="50" height={330 - y(score)} className={outside ? "fill-destructive" : "fill-primary"} />
                  )}
                  <text x={x + 25} y={score === null ? 297 : y(score) - 12} textAnchor="middle"
                    className={`text-[27px] font-semibold ${outside ? "fill-destructive" : "fill-foreground"}`}>{result.labels[index]}</text>
                  <text x={x + 25} y="366" textAnchor="middle" className="fill-foreground text-[27px]">Q{index + 1}</text>
                </g>
              );
            })}
            <line x1="50" x2="380" y1={y(TOVA_BORDERLINE)} y2={y(TOVA_BORDERLINE)} strokeWidth="2" strokeDasharray="7 5" className="stroke-foreground" />
            <line x1="50" x2="380" y1={y(TOVA_LIMIT)} y2={y(TOVA_LIMIT)} strokeWidth="3" className="stroke-destructive" />
            <text x="215" y="410" textAnchor="middle" className="fill-muted-foreground text-[24px]">Standard score · by quarter</text>
          </svg>
        </div>
      ))}
    </div>

    <div className="flex flex-wrap items-center gap-x-12 gap-y-3 text-[27px] text-muted-foreground">
      <span className="flex items-center gap-3"><span className="w-10 border-t-[3px] border-destructive" />80 · normal-limit line</span>
      <span className="flex items-center gap-3"><span className="w-10 border-t-2 border-dashed border-foreground" />85 · borderline</span>
      <span className="text-destructive font-semibold">Red bars / marker · below normal limits</span>
    </div>
    <div className="border-t border-border pt-6">
      <p className="text-[36px] text-foreground leading-snug">Outside normal limits: response-time variability in all four quarters, and commission errors in Q2–Q4.</p>
      <p className="text-[24px] text-muted-foreground mt-3">Source: my T.O.V.A. Visual Results report. Q3 commission score is reported as &lt;40, not an exact value. Performance validity criteria were met.</p>
    </div>
  </div>
);