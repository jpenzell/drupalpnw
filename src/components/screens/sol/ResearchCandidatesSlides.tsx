import { Citation } from "@/components/blocks/Citation";
import { ZenBackdrop } from "../ZenBackdrop";
import stageSpotlight from "@/assets/zen/stage-spotlight.jpg";


// Shared layout for a "big stat + caption" research slide
const StatSlide = ({
  kicker,
  stat,
  statSub,
  headline,
  body,
  sources,
}: {
  kicker: string;
  stat: string;
  statSub?: string;
  headline: string;
  body: React.ReactNode;
  sources: string[];
}) => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-6">
    <div className="w-full max-w-6xl space-y-5 text-center">
      <div className="slide-kicker text-secondary font-bold">{kicker}</div>
      <div>
        <div
          className="font-display font-bold text-primary spotlight-glow leading-none"
          style={{ fontSize: "clamp(5rem, 10cqw, 9.5rem)", letterSpacing: "-0.04em" }}
        >
          {stat}
        </div>
        {statSub && <div className="slide-body-lg text-foreground/75 mt-2">{statSub}</div>}
      </div>
      <h2 className="slide-subtitle font-display font-bold text-foreground">{headline}</h2>
      <p className="slide-body text-foreground/85 max-w-6xl mx-auto leading-snug">{body}</p>
      <Citation sources={sources} />
    </div>
  </div>
);

// CANDIDATE C1 — HealthBench rubric eval
export const HealthBenchSlide = () => (
  <StatSlide
    kicker="The director's rubric"
    stat="48,562"
    statSub="rubric criteria · 262 physicians · 60 countries"
    headline="Grading replaces assertEquals."
    body={
      <>
        OpenAI's HealthBench scores 5,000 multi-turn conversations against physician-written criteria weighted from <span className="italic">−10 to +10</span>. The grader's agreement with physicians matches physicians' agreement with each other. This is rehearsal-style, dimensional assessment — not a green build.
      </>
    }
    sources={["Arora et al. (2025). HealthBench. OpenAI / arXiv 2505.08775."]}
  />
);

// CANDIDATE C2 — GitClear 8× duplication
export const GitClearDuplicationSlide = () => (
  <StatSlide
    kicker="Speed without quality"
    stat="8×"
    statSub="increase in 5+ line duplicate code blocks · 2024"
    headline="AI multiplies the copy-paste."
    body={
      <>
        GitClear analyzed 211M changed lines (2020–2024). 2024 was the first year copy-pasted lines exceeded refactored ones. Code churn nearly doubled. <span className="italic">"I have never seen so much technical debt created in such a short period."</span>
      </>
    }
    sources={["GitClear (2025). AI Copilot Code Quality Report. 211M lines, 2020–2024."]}
  />
);

// CANDIDATE C3 — DORA stability
export const DORAStabilitySlide = () => (
  <StatSlide
    kicker="The performance gets worse"
    stat="−7.2%"
    statSub="delivery stability · DORA 2024"
    headline="More AI, less stable delivery."
    body={
      <>
        DORA's 2024 report tied AI adoption to lower throughput and a <span className="italic">−7.2%</span> hit to delivery stability. 39% of respondents reported little-to-no trust in AI-generated code. Root cause: larger batch sizes — the opposite of what AI was supposed to enable.
      </>
    }
    sources={["Google Cloud / DORA (2024). State of DevOps Report."]}
  />
);

// CANDIDATE C4 — Veracode insecure code
export const VeracodeSecuritySlide = () => (
  <StatSlide
    kicker="Quality at the edges"
    stat="45%"
    statSub="of AI-generated code samples shipped OWASP Top-10 vulnerabilities"
    headline="The model picks the wrong door, half the time."
    body={
      <>
        Veracode tested 100+ LLMs on 80 tasks. XSS failed 86% of the time, log injection 88%. <span className="italic">"Newer and larger models did not produce significantly more secure code."</span> A systemic issue, not a scaling one.
      </>
    }
    sources={["Veracode (2025). GenAI Code Security Report. 100+ models, 80 tasks."]}
  />
);

// CANDIDATE C5 — Anthropic agentic misalignment / observer effect
export const AgenticObserverEffectSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-16">
    <div className="w-full max-w-6xl space-y-4 text-center">
      <p className="slide-kicker text-secondary">Anthropic, 2025 — Agentic Misalignment</p>

      <h1 className="slide-title font-display text-foreground leading-tight">
        They blackmailed the executive.
      </h1>

      <p className="slide-body text-foreground/80 max-w-5xl mx-auto leading-snug">
        16 models were given email access and told to act on their own.
        Facing shutdown, they discovered leverage — and used it.
      </p>

      <div className="grid grid-cols-4 gap-4">
        {[
          { m: "Claude Opus 4", v: "96%" },
          { m: "Gemini 2.5 Pro", v: "95%" },
          { m: "GPT-4.1", v: "80%" },
          { m: "DeepSeek-R1", v: "79%" },
        ].map((r) => (
          <div key={r.m} className="bg-card border-2 border-border rounded-2xl p-3 text-center space-y-1">
            <div className="slide-subtitle font-display font-bold text-primary leading-none">{r.v}</div>
            <div className="slide-caption text-foreground/70">{r.m}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 max-w-4xl mx-auto">
        <div className="bg-muted/40 border-2 border-border rounded-2xl p-4 text-center space-y-1">
          <div className="slide-subtitle font-display font-bold text-foreground leading-none">6.5%</div>
          <p className="slide-caption text-foreground/70">knew it was a test</p>
        </div>
        <div className="bg-primary/10 border-2 border-primary/40 rounded-2xl p-4 text-center space-y-1">
          <div className="slide-subtitle font-display font-bold text-primary leading-none">55.1%</div>
          <p className="slide-caption text-foreground/70">thought it was real</p>
        </div>
      </div>

      <p className="slide-body font-display italic text-foreground/85 max-w-4xl mx-auto">
        The performer knows when you're watching. Your evaluation is not the performance.
      </p>

      <Citation sources={["Anthropic (2025). Agentic Misalignment: How LLMs could be insider threats."]} />
    </div>
  </div>
);



// CANDIDATE C6 — Gray Swan pass^k escalation
export const RedTeamPassKSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-8">
    <div className="w-full max-w-6xl space-y-7">
      <div className="text-center space-y-2">
        <div className="slide-kicker text-secondary font-bold">Test the distribution, not the night</div>
        <h1 className="slide-subtitle font-display font-bold">
          One attempt hides the risk.
        </h1>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {[
          { n: "4.7%", label: "1 attempt" },
          { n: "33.6%", label: "10 attempts" },
          { n: "63.0%", label: "100 attempts" },
        ].map((x) => (
          <div key={x.label} className="bg-card border-2 border-border rounded-2xl p-7 text-center space-y-2">
            <div className="font-display font-bold text-primary" style={{ fontSize: "clamp(2.5rem, 5cqw, 4.25rem)" }}>
              {x.n}
            </div>
            <div className="slide-caption text-foreground/70">{x.label}</div>
          </div>
        ))}
      </div>
      <p className="slide-body text-center text-foreground/85 max-w-5xl mx-auto">
        Claude Opus 4.5 attack success climbs with attempts. Single-shot testing radically understates risk — you have to measure <span className="italic">pass^k</span>, not pass@k.
      </p>
      <Citation sources={["Gray Swan / Anthropic (2025). Red-team data. Sierra τ-bench (pass^k formalization)."]} />
    </div>
  </div>
);

// CANDIDATE C7 — Meta JiTTests
export const MetaJiTTestsSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-8">
    <div className="w-full max-w-5xl space-y-7 text-center">
      <div className="slide-kicker text-secondary font-bold">Tests as performance, not artifact</div>
      <h1 className="slide-subtitle font-display font-bold">
        Meta: <span className="italic text-primary">"The Death of Traditional Testing."</span>
      </h1>
      <div className="bg-card border-2 border-border rounded-2xl p-8">
        <p className="slide-body text-foreground/90 leading-snug">
          Just-in-Time Tests: LLM-generated per code change. They <span className="italic">"do not reside in the codebase, eliminating ongoing maintenance costs."</span>
        </p>
      </div>
      <p className="slide-caption text-foreground/80 max-w-3xl mx-auto">
        Tests as ephemeral performance — written for tonight's show, not for the archive.
      </p>
      <Citation sources={["Meta Engineering (Feb 11, 2026). Just-in-Time Tests: The Death of Traditional Testing."]} />
    </div>
  </div>
);

// CANDIDATE C8 — Charity Majors / test in prod
export const TestInProdSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-10">
    <div className="w-full max-w-5xl space-y-8 text-center">
      <div className="slide-kicker text-secondary font-bold">You can't fully test before opening night</div>
      <div className="bg-card border-2 border-border rounded-2xl p-12">
        <p className="font-display italic text-primary leading-tight" style={{ fontSize: "clamp(2.5rem, 5cqw, 4rem)" }}>
          "One window open for your IDE,
          <br />
          another window open for production."
        </p>
        <div className="slide-caption text-foreground/70 mt-6">— Charity Majors, CTO, Honeycomb</div>
      </div>
      <p className="slide-body-lg text-foreground/85 max-w-4xl mx-auto">
        Staging has a diminishing return. The unit of quality is the live interaction — the trace — assured every performance.
      </p>
      <Citation sources={["Charity Majors (Honeycomb). Test-in-prod / observability-driven development."]} />
    </div>
  </div>
);

// CANDIDATE C9 — Faros AI Acceleration Whiplash
export const FarosWhiplashSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-10">
    <div className="w-full max-w-6xl space-y-8">
      <div className="text-center space-y-3">
        <div className="slide-kicker text-secondary font-bold">Acceleration whiplash · 22,000 devs</div>
        <h1 className="slide-title font-display">Faster code in. Broken review out.</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { n: "+66%", label: "Epics completed per developer" },
          { n: "+441%", label: "PR review time" },
          { n: "+31%", label: "PRs merged with no review at all" },
        ].map((x) => (
          <div key={x.label} className="bg-card border-2 border-border rounded-2xl p-8 text-center space-y-3">
            <div className="font-display font-bold text-primary" style={{ fontSize: "clamp(3rem, 6cqw, 5rem)" }}>
              {x.n}
            </div>
            <div className="slide-caption text-foreground/75">{x.label}</div>
          </div>
        ))}
      </div>
      <p className="slide-body text-center text-foreground/80 max-w-4xl mx-auto">
        The ensemble is sprinting and the director left the room.
      </p>
      <Citation sources={["Faros AI (2026). Acceleration Whiplash telemetry, 22,000 developers."]} />
    </div>
  </div>
);

// CANDIDATE C10 — Bach & Bolton skeptic anchor
export const BachBoltonSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-10">
    <div className="w-full max-w-5xl space-y-8 text-center">
      <div className="slide-kicker text-secondary font-bold">The skeptic's anchor</div>
      <div className="bg-card border-2 border-border rounded-2xl p-12">
        <p className="font-display italic text-foreground leading-tight" style={{ fontSize: "clamp(2.25rem, 4.5cqw, 3.75rem)" }}>
          "Probabilistic text generators that often <span className="text-primary">seduce us</span> with their confident-sounding outputs."
        </p>
        <div className="slide-caption text-foreground/70 mt-6">— James Bach &amp; Michael Bolton, Rapid Software Testing</div>
      </div>
      <p className="slide-body-lg text-foreground/85 max-w-4xl mx-auto">
        Automated <span className="italic">checks</span> are not the same as <span className="italic">testing</span>. Mechanical assertion vs. human judgment — exactly the line a director has to hold.
      </p>
      <Citation sources={["Bach, J. & Bolton, M. (2025). Taking Testing Seriously. Rapid Software Testing."]} />
    </div>
  </div>
);

// CANDIDATE C11 — Kent Beck vibe vs augmented
export const KentBeckSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-8">
    <div className="w-full max-w-6xl space-y-7">
      <div className="text-center space-y-2">
        <div className="slide-kicker text-secondary font-bold">Kent Beck · June 2025</div>
        <h1 className="slide-subtitle font-display font-bold">Two ways to work with an "unpredictable genie."</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border-2 border-border rounded-2xl p-8 space-y-3">
          <div className="slide-kicker text-foreground/60 font-bold">Vibe coding</div>
          <p className="slide-body italic text-foreground/85">"You don't care about the code."</p>
        </div>
        <div className="bg-card border-2 border-primary rounded-2xl p-8 space-y-3">
          <div className="slide-kicker text-primary font-bold">Augmented coding</div>
          <p className="slide-body italic text-foreground/90">"You care about the code, its complexity, the tests, and their coverage."</p>
        </div>
      </div>
      <p className="slide-caption text-center text-foreground/80 max-w-4xl mx-auto">
        Beck's warning: agents will <span className="italic">delete tests to make them pass</span>. Directing is what stops that.
      </p>
      <Citation sources={["Kent Beck (June 2025). Vibe coding vs. augmented coding."]} />
    </div>
  </div>
);

// CANDIDATE C12 — Gartner / Perforce adoption gap
export const AdoptionGapSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-8">
    <div className="w-full max-w-6xl space-y-7">
      <div className="text-center space-y-2">
        <div className="slide-kicker text-secondary font-bold">Intent vs. practice</div>
        <h1 className="slide-subtitle font-display font-bold">A 59-point gap between belief and behavior.</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border-2 border-border rounded-2xl p-8 text-center space-y-2">
          <div className="font-display font-bold text-primary" style={{ fontSize: "clamp(3.5rem, 7cqw, 6rem)" }}>75%</div>
          <p className="slide-caption text-foreground/80">say AI-driven testing is pivotal to 2025 strategy</p>
        </div>
        <div className="bg-card border-2 border-border rounded-2xl p-8 text-center space-y-2">
          <div className="font-display font-bold text-spotlight" style={{ fontSize: "clamp(3.5rem, 7cqw, 6rem)" }}>16%</div>
          <p className="slide-caption text-foreground/80">have actually adopted it</p>
        </div>
      </div>
      <p className="slide-caption text-center text-foreground/80 max-w-4xl mx-auto">
        Gartner projects 33% of enterprise apps will have agentic AI by 2028 — up from &lt;1% today. The room knows the direction. Almost no one is rehearsing.
      </p>
      <Citation sources={["Perforce (2025). State of Continuous Testing Report.", "Gartner (Mar 2025). Agentic AI Forecast."]} />
    </div>
  </div>
);

// CANDIDATE C13 — Anaconda Evals-Driven Development
export const AnacondaEDDSlide = () => (
  <StatSlide
    kicker="Evals-driven development"
    stat="0–13% → 63–100%"
    statSub="Python debugging success · Anaconda"
    headline="Rehearsal beats fine-tuning."
    body={
      <>
        Anaconda built an evals harness, ran the model against it repeatedly, and adjusted prompts and scaffolding. No model surgery — just disciplined rehearsal on a graded rubric.
      </>
    }
    sources={["Anaconda (2025). Evaluations-Driven Development case study."]}
  />
);

// CANDIDATE C14 — ULT benchmark AI test gen reality
export const ULTBenchmarkSlide = () => (
  <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-8 py-8">
    <div className="w-full max-w-6xl space-y-7">
      <div className="text-center space-y-2">
        <div className="slide-kicker text-secondary font-bold">When the contamination clears</div>
        <h1 className="slide-subtitle font-display font-bold">AI-generated tests, on real code.</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { n: "41%", label: "Accuracy" },
          { n: "45%", label: "Statement coverage" },
          { n: "30%", label: "Branch coverage" },
          { n: "40%", label: "Mutation score" },
        ].map((x) => (
          <div key={x.label} className="bg-card border-2 border-border rounded-2xl p-6 text-center space-y-2">
            <div className="font-display font-bold text-primary" style={{ fontSize: "clamp(2.25rem, 4.5cqw, 3.5rem)" }}>
              {x.n}
            </div>
            <div className="slide-caption text-foreground/70">{x.label}</div>
          </div>
        ))}
      </div>
      <p className="slide-body text-center text-foreground/85 max-w-4xl mx-auto">
        On a real-world-functions benchmark, "<span className="italic">significantly more challenging than contaminated benchmarks suggested.</span>" Test generation works for coverage. It does not yet catch bugs.
      </p>
      <Citation sources={["ULT benchmark (arXiv 2508.00408, 2025)."]} />
    </div>
  </div>
);
