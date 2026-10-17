import { useState, useEffect } from "react";
import { Users, Timer } from "lucide-react";

interface PartnerExerciseSlideProps {
  title: string;
  prompt: string;
  subPrompt?: string;
  durationSeconds: number;
  badgeLabel?: string;
}

export const PartnerExerciseSlide = ({ title, prompt, subPrompt, durationSeconds, badgeLabel = "Partner Exercise" }: PartnerExerciseSlideProps) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((durationSeconds - timeLeft) / durationSeconds) * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in overflow-hidden">
      <div className="max-w-[1500px] mx-auto w-full text-center space-y-5 px-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-secondary/15 border border-secondary/40 rounded-full">
          <Users className="h-5 w-5 text-secondary" />
          <span className="text-secondary font-bold slide-kicker">{badgeLabel}</span>
        </div>

        {/* Title — scale down for longer prompts so nothing clips off-stage */}
        <h1
          className={`${title.length > 55 ? "slide-subtitle" : "slide-title"} font-display font-bold text-foreground leading-[1.1]`}
        >
          {title}
        </h1>


        {/* Prompt */}
        <p className="slide-body text-foreground/90 font-medium max-w-4xl mx-auto">
          {prompt}
        </p>

        {subPrompt && (
          <p className="slide-caption text-foreground/70 italic max-w-3xl mx-auto">
            {subPrompt}
          </p>
        )}

        {/* Timer */}
        <div className="pt-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="inline-flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="relative w-56 h-56 rounded-full border-[6px] border-secondary/40 flex items-center justify-center group-hover:border-secondary/70 transition-colors">
              {/* Progress ring — SVG scales with the 14rem container */}
              <svg className="absolute inset-0 -rotate-90 w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="text-center px-3">
                <span
                  className="font-mono font-bold text-foreground tabular-nums whitespace-nowrap leading-none"
                  style={{ fontSize: "2.75rem" }}
                >
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
            <span className="slide-caption text-foreground/60 font-medium flex items-center gap-2">
              <Timer className="h-4 w-4" />
              {isRunning ? "tap to pause" : timeLeft === durationSeconds ? "tap to start" : "tap to resume"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
