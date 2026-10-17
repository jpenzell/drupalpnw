import { TrendingUp } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { signalEnterAtMax } from "@/hooks/useReveal";
import { prefetchProbabilityWordsLive } from "./ProbabilityWordsLiveScreen";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const AnnieDukeStudyScreen = () => {
  const [stage, setStage] = useState(1);
  const maxStage = 3;

  // Warm up the live AI demo (A1-3d) while the audience is still on this slide
  // so the answers are pre-loaded when we advance.
  useEffect(() => { prefetchProbabilityWordsLive(); }, []);


  const handleAdvance = useCallback((e: KeyboardEvent) => {
    if (e.key === " " || e.key === "ArrowRight") {
      if (stage < maxStage) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setStage((s) => s + 1);
      }
    } else if (e.key === "ArrowLeft") {
      if (stage > 1) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setStage((s) => s - 1);
      } else {
        signalEnterAtMax();
      }
    }
  }, [stage, maxStage]);

  useEffect(() => {
    window.addEventListener("keydown", handleAdvance, { capture: true });
    return () => window.removeEventListener("keydown", handleAdvance, { capture: true } as any);
  }, [handleAdvance]);

  const tableData = [
    { word: "Slam dunk", humanAvg: "90%", humanRange: "50-100", chatgpt: "85%", gemini: "85%" },
    { word: "Always", humanAvg: "91%", humanRange: "50-100", chatgpt: "100%", gemini: "100%" },
    { word: "Never", humanAvg: "9%", humanRange: "0-50", chatgpt: "0%", gemini: "0%" },
    { word: "Serious possibility", humanAvg: "58%", humanRange: "30-80", chatgpt: "70%", gemini: "50%", highlight: true },
    { word: "Rarely", humanAvg: "16%", humanRange: "5-50", chatgpt: "15%", gemini: "5%", highlight: true },
  ];

  return (
    <div className="flex-1 flex flex-col animate-slide-in min-h-0 overflow-hidden px-12 py-6">
      <div className="text-center mb-4 flex-shrink-0">
        <h1 className="slide-subtitle font-bold text-foreground">
          Same words. <span className="text-primary italic">Different meanings.</span>
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0 min-w-0 overflow-hidden">
        <div className="w-full max-w-[1700px] mx-auto flex flex-col min-h-0 min-w-0 overflow-hidden">
          <div className="bg-background/80 border-2 border-foreground/20 rounded-2xl overflow-hidden shadow-large min-w-0">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: "32%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "19%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "17%" }} />
              </colgroup>
              <thead className="bg-primary/20">
                <tr>
                  <th className="text-left text-foreground font-bold slide-caption py-5 px-6 whitespace-nowrap">Word</th>
                  <th className="text-center text-foreground font-bold slide-caption py-5 px-2 whitespace-nowrap">Human Avg</th>
                  <th className="text-center text-primary font-bold slide-caption py-5 px-2 whitespace-nowrap">Human Range</th>
                  <th
                    className={`text-center font-bold slide-caption py-5 px-2 whitespace-nowrap transition-all duration-500 ${
                      stage >= 2 ? "text-secondary opacity-100" : "text-muted-foreground/30 opacity-40"
                    }`}
                  >
                    ChatGPT
                  </th>
                  <th
                    className={`text-center font-bold slide-caption py-5 px-2 whitespace-nowrap transition-all duration-500 ${
                      stage >= 2 ? "text-secondary opacity-100" : "text-muted-foreground/30 opacity-40"
                    }`}
                  >
                    Gemini
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-t border-foreground/10 transition-all duration-500 ${
                      stage === 3 && row.highlight
                        ? "bg-primary/20"
                        : ""
                    }`}
                  >
                    <td className="font-semibold text-foreground slide-body py-4 px-6 whitespace-nowrap">{row.word}</td>
                    <td className="text-center text-foreground slide-body py-4 px-2 tabular-nums">{row.humanAvg}</td>
                    <td className="text-center text-primary font-bold slide-body py-4 px-2 tabular-nums">{row.humanRange}</td>
                    <td
                      className={`text-center slide-body py-4 px-2 tabular-nums transition-all duration-500 ${
                        stage >= 2
                          ? stage === 3 && row.highlight
                            ? "text-secondary font-bold"
                            : "text-secondary"
                          : "text-muted-foreground/25"
                      }`}
                    >
                      {row.chatgpt}
                    </td>
                    <td
                      className={`text-center slide-body py-4 px-2 tabular-nums transition-all duration-500 ${
                        stage >= 2
                          ? stage === 3 && row.highlight
                            ? "text-secondary font-bold"
                            : "text-secondary"
                          : "text-muted-foreground/25"
                      }`}
                    >
                      {row.gemini}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center gap-2 mt-5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  s === stage ? "bg-primary scale-125" : s < stage ? "bg-primary/50" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <p className="slide-caption text-muted-foreground/60 text-center mt-3">
            Sherman Kent, CIA 1964 · Mauboussin &amp; Mauboussin, HBR 2018 · Duke, <em>Thinking in Bets</em> 2018
          </p>
        </div>
      </div>
    </div>
  );
};
