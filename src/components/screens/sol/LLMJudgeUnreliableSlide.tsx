import { ZenBackdrop } from "../ZenBackdrop";
import { Citation } from "@/components/blocks/Citation";
import emptyBench from "@/assets/zen/empty-bench.jpg";

/**
 * A3-2-2b — LLM-as-judge is unreliable.
 *
 * Two grounding studies:
 *
 * 1. Dorner, Nastl & Hardt — "Limits to Scalable Evaluation at the Frontier:
 *    LLM as Judge Won't Beat Twice the Data." ICLR 2025 Oral.
 *    - Theorem: when the judge is no more accurate than the evaluated model,
 *      no debiasing method can cut required ground-truth labels by more than
 *      half. Best case from an LLM judge = a 2× improvement in sample efficiency.
 *    - High agreement is NOT sufficient: without further assumptions, an
 *      agreement rate above 99% (per evaluated model) is required to ensure
 *      correct rankings.
 *    - GPT-4-class judges have been shown to fully reverse model rankings.
 *
 * 2. RAND Corporation — "Judge Reliability Harness." arXiv 2603.05399, Mar 2026.
 *    - "No judge that we evaluated is uniformly reliable across benchmarks."
 *    - Verdicts shifted from simple text-formatting changes, paraphrasing,
 *      changes in verbosity, and even flipping the ground-truth label.
 *
 * Documented bias taxonomy (for follow-up talking points):
 *    - Position bias: GPT-4 verdict flips ~40% when A/B order swapped.
 *    - Verbosity bias: ~15% inflation for longer answers.
 *    - Self-preference (Wataoka et al., NeurIPS 2024): judges favor their own
 *      low-perplexity / familiar text.
 *    - SAGE (Dec 2025): even Gemini-2.5-Pro and GPT-5 fail to maintain
 *      consistent preferences in ~25% of difficult cases.
 */
export const LLMJudgeUnreliableSlide = () => (
  <ZenBackdrop image={emptyBench} overlay="heavy" kenBurns alt="An empty wooden judge's bench under a single spotlight">
    <div className="max-w-6xl w-full max-h-full px-8 py-2 space-y-2 overflow-hidden self-center">
      <div className="text-center space-y-1">
        <p className="slide-kicker text-spotlight font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          Dorner · ICLR 2025 Oral &nbsp;·&nbsp; RAND · March 2026
        </p>
        <p className="slide-subtitle font-display font-light text-white/95 leading-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.8)]">
          Let the AI grade the AI?
        </p>
      </div>

      {/* The two grounding quotes, side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-black/55 backdrop-blur-sm border border-white/15 rounded-2xl p-3 space-y-1.5">
          <div className="slide-kicker text-spotlight font-bold">
            Dorner, Nastl &amp; Hardt — ICLR 2025
          </div>
          <p className="slide-caption font-display italic text-white leading-snug">
            "The best we can expect from LLM judges is a factor-two improvement in sample efficiency."
          </p>
          <p className="slide-caption text-white/75 leading-snug">
            When the judge is no more accurate than the model it grades, <span className="italic">no</span> debiasing cuts the human-label requirement by more than half. Correct ranking requires agreement above <span className="text-spotlight font-bold">99%</span>.
          </p>
        </div>

        <div className="bg-black/55 backdrop-blur-sm border border-white/15 rounded-2xl p-3 space-y-1.5">
          <div className="slide-kicker text-spotlight font-bold">
            RAND — March 2026
          </div>
          <p className="slide-caption font-display italic text-white leading-snug">
            "No judge that we evaluated is uniformly reliable across benchmarks."
          </p>
          <p className="slide-caption text-white/75 leading-snug">
            Verdicts flipped from <span className="italic">simple text formatting changes, paraphrasing, changes in verbosity, and flipping the ground-truth label.</span>
          </p>
        </div>
      </div>

      {/* Concrete, showable findings */}
      <div className="bg-black/45 backdrop-blur-sm border border-white/10 rounded-2xl p-3">
        <div className="slide-kicker text-white/70 font-bold mb-3 text-center">
          What changes the verdict
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          {[
            { n: "~40%", label: "Verdict flips when A/B order is swapped (GPT-4)" },
            { n: "~15%", label: "Score inflation for longer answers (verbosity bias)" },
            { n: ">50%", label: "Frontier-model error rate on advanced bias tests" },
            { n: "~25%", label: "Preference inconsistencies — even GPT-5 & Gemini-2.5-Pro" },
          ].map((x) => (
            <div key={x.label} className="space-y-1">
              <div className="font-display font-bold text-spotlight spotlight-glow leading-none" style={{ fontSize: "clamp(1.75rem, 3.4cqw, 2.5rem)" }}>
                {x.n}
              </div>
              <div className="slide-caption text-white/80 leading-snug">{x.label}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="slide-caption font-display italic text-spotlight spotlight-glow leading-tight text-center">
        The judge is another performer.
      </p>

      <Citation sources={["Dorner et al. ICLR 2025 · RAND 2026 arXiv 2603.05399"]} />
    </div>
  </ZenBackdrop>
);
