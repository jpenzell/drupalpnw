import { useState, useEffect, useMemo, useRef } from "react";
import { PresentationLayout } from "@/components/PresentationLayout";
import { JoinSessionScreen } from "@/components/JoinSessionScreen";
import { useSession } from "@/contexts/SessionContext";
import { ParticleBackground } from "@/components/ParticleBackground";
import { SceneCanvasProvider } from "@/contexts/SceneCanvasContext";

// Zen backdrop photos
import zenCastingTable from "@/assets/zen/casting-table.jpg";
import zenRehearsalRoom from "@/assets/zen/rehearsal-room.jpg";
import zenDirectorChair from "@/assets/zen/director-chair.jpg";
import zenStageSpotlight from "@/assets/zen/stage-spotlight.jpg";


// Reusable framework slides
import { TitleSlide } from "@/components/screens/tt/TitleSlide";
import { AboutMeSlide } from "@/components/screens/tt/AboutMeSlide";
import { PartnerExerciseSlide } from "@/components/screens/tt/PartnerExerciseSlide";

import { FilmVsTheaterSlide } from "@/components/screens/tt/FilmVsTheaterSlide";
import { AIChangesLikeHumansSlide } from "@/components/screens/tt/AIChangesLikeHumansSlide";
import { PromptingIsTheProblemSlide } from "@/components/screens/tt/PromptingIsTheProblemSlide";
import { FinalSlide } from "@/components/screens/tt/FinalSlide";

// SHRM-specific (legacy / available for reuse)
import { StallChallengeSlide } from "@/components/screens/shrm/StallChallengeSlide";
import { ZooxQuestionSlide } from "@/components/screens/shrm/ZooxQuestionSlide";

import { LanguageIsTheTechSlide } from "@/components/screens/shrm/LanguageIsTheTechSlide";
import { ITIsHRofAISlide } from "@/components/screens/shrm/ITIsHRofAISlide";
import { NextStepsSlide } from "@/components/screens/shrm/NextStepsSlide";
import { HRLeadsTheRevolutionSlide } from "@/components/screens/shrm/HRLeadsTheRevolutionSlide";

// Legacy research/demo screens
import { OneWordStoryCastCallScreen } from "@/components/screens/OneWordStoryCastCallScreen";
import { ManualOneWordStoryScreen } from "@/components/screens/ManualOneWordStoryScreen";
import { AnnieDukeStudyScreen } from "@/components/screens/AnnieDukeStudyScreen";
import { HamelHusainSlide } from "@/components/screens/sol/HamelHusainSlide";
import { ProbabilityWordsPollScreen } from "@/components/screens/wshmma/ProbabilityWordsPollScreen";
import { ProbabilityWordsLiveScreen } from "@/components/screens/ProbabilityWordsLiveScreen";
import { ProbabilityWordsPersonaScreen } from "@/components/screens/ProbabilityWordsPersonaScreen";
import { HallucinationRevealScreen } from "@/components/screens/HallucinationRevealScreen";

import { ElephantQuestionScreen } from "@/components/screens/ElephantQuestionScreen";
import { CarsQuestionIntroScreen } from "@/components/screens/CarsQuestionIntroScreen";
import { ChargersBiasScreen } from "@/components/screens/ChargersBiasScreen";
import { ChargersBiasWhyScreen } from "@/components/screens/ChargersBiasWhyScreen";
import { EmpathyStudyScreen } from "@/components/screens/EmpathyStudyScreen";
import { DoctorAIQuizScreen } from "@/components/screens/DoctorAIQuizScreen";
import { AIParadoxRevealScreen } from "@/components/screens/AIParadoxRevealScreen";

import { ImpartaSkillsStudyScreen } from "@/components/screens/ImpartaSkillsStudyScreen";
import { CostOfInactionScreen } from "@/components/screens/CostOfInactionScreen";
import { AdoptionPredictorQuizScreen } from "@/components/screens/AdoptionPredictorQuizScreen";
import { MetacognitionAsymmetryScreen } from "@/components/screens/MetacognitionAsymmetryScreen";
import { DisclosureEffectScreen } from "@/components/screens/coaching/DisclosureEffectScreen";
import { AnthropicFluencyScreen } from "@/components/screens/coaching/AnthropicFluencyScreen";
import { WorkingAllianceStudyScreen } from "@/components/screens/coaching/WorkingAllianceStudyScreen";
import { LLMExplainerScreen } from "@/components/screens/LLMExplainerScreen";
import { ElephantEstimateScreen } from "@/components/screens/ElephantEstimateScreen";
import { ProbabilisticExplainerScreen } from "@/components/screens/ProbabilisticExplainerScreen";
import { LanguageSwitchesValuesSlide } from "@/components/screens/sol/LanguageSwitchesValuesSlide";
import { PhotographySmartphoneSlide } from "@/components/screens/sol/PhotographySmartphoneSlide";
import { BirkmanMyResultsScreen } from "@/components/screens/BirkmanMyResultsScreen";

// Core presentation scenes
import { ActTitleCard } from "@/components/screens/sol/ActTitleCard";
import { RussianBluesClaimSlide } from "@/components/screens/sol/RussianBluesClaimSlide";


import { GenAIIsLanguageSlide } from "@/components/screens/sol/GenAIIsLanguageSlide";
import { CulturalTendenciesSlide } from "@/components/screens/sol/CulturalTendenciesSlide";


import { LakoffSlide } from "@/components/screens/sol/LakoffSlide";
import { MetaphorExamplesSlide } from "@/components/screens/sol/MetaphorExamplesSlide";
import { KhadpeSlide, MetaphorIsControlStickSlide } from "@/components/screens/sol/KhadpeSlide";
import { PurposefulMetaphorSlide } from "@/components/screens/sol/PurposefulMetaphorSlide";
import { RandFailureSlide } from "@/components/screens/sol/RandFailureSlide";
import { ThinkingMachinesSlide } from "@/components/screens/sol/ThinkingMachinesSlide";

import { LLMJudgeUnreliableSlide } from "@/components/screens/sol/LLMJudgeUnreliableSlide";

import { RandRootCauseSlide } from "@/components/screens/sol/RandRootCauseSlide";
import { FollowTheMoneySlide } from "@/components/screens/sol/FollowTheMoneySlide";
import { LionKingCompareSlide } from "@/components/screens/sol/LionKingCompareSlide";
import { LionKingScaleSlide } from "@/components/screens/sol/LionKingScaleSlide";

import { AlreadySpeakingSlide } from "@/components/screens/sol/AlreadySpeakingSlide";
import { ThreeBorrowsSlide } from "@/components/screens/sol/ThreeBorrowsSlide";
import { SimpleTextSlide } from "@/components/screens/sol/SimpleTextSlide";
import { TrainedOnLanguageSlide } from "@/components/screens/sol/TrainedOnLanguageSlide";
import { UzziQScoreSlide, UzziHowMeasuredSlide, UzziReplicationSlide } from "@/components/screens/sol/UzziQScoreSlide";

// Research scenes retained from earlier presentations


import { ProcurementAdoptionSlide } from "@/components/screens/wshmma/ProcurementAdoptionSlide";
import { TrustGapSlide } from "@/components/screens/wshmma/TrustGapSlide";
import { SentimentNotTrustSlide } from "@/components/screens/wshmma/SentimentNotTrustSlide";
import { AmodeiInterviewSlide } from "@/components/screens/wshmma/AmodeiInterviewSlide";



import { EdmondsonSlide } from "@/components/screens/sol/EdmondsonSlide";
import { PsychSafetyResearchSlide } from "@/components/screens/sol/PsychSafetyResearchSlide";
import { StanislavskiSlide } from "@/components/screens/sol/StanislavskiSlide";
import { ScriptDemoSlide } from "@/components/screens/sol/ScriptDemoSlide";
import { CopyMachineExampleSlide } from "@/components/screens/sol/CopyMachineExampleSlide";
import { CreativeHomogenizationSlide } from "@/components/screens/sol/CreativeHomogenizationSlide";

import { LangerBecauseSlide } from "@/components/screens/sol/LangerBecauseSlide";

import { TwoMovesSlide } from "@/components/screens/sol/TwoMovesSlide";

import { PracticeSummarySlide } from "@/components/screens/sol/PracticeSummarySlide";
import {
  HealthBenchSlide,
  GitClearDuplicationSlide,
  DORAStabilitySlide,
  VeracodeSecuritySlide,
  AgenticObserverEffectSlide,
  RedTeamPassKSlide,
  MetaJiTTestsSlide,
  TestInProdSlide,
  FarosWhiplashSlide,
  BachBoltonSlide,
  KentBeckSlide,
  AdoptionGapSlide,
  AnacondaEDDSlide,
  ULTBenchmarkSlide,
} from "@/components/screens/sol/ResearchCandidatesSlides";

import { LearningHandoffsSlide } from "@/components/screens/penske/LearningHandoffsSlide";
import { CastingRoleFitSlide } from "@/components/screens/penske/CastingRoleFitSlide";
import { AuditionScreen } from "@/components/screens/penske/AuditionScreen";
import { EnsembleSizeSlide } from "@/components/screens/penske/EnsembleSizeSlide";


const screens = [
  // ============ OPENING ============
  { id: "S1", title: "Opening", component: TitleSlide,
    notes: "Welcome the Minnesota Chapter of ISPI and Digital Learning Forum. Curtain up. MFA + MBA, 20 years watching scenes that wouldn't land — in rehearsal rooms and learning organizations. Theater has been working on what you face with AI for centuries." },


  // ============ ACT 1 — THE PROBLEM IS HUMAN ============
  { id: "A1-1", title: "Hairstyle", component: () => (
      <PartnerExerciseSlide
        title="What hairstyle are you today?"
        prompt="60 seconds. One word, one phrase. Don't think too hard."
        subPrompt="Picture one word that captures how you're showing up today."
        durationSeconds={60}
        badgeLabel="Creative Exercise"
      />
    ), notes: "Take 5–8 responses from the chat. Land it: from one word, the room produced many different mental pictures. That's not a communication failure — that's how language works. The same thing happens with a learning objective, a rubric, or the word 'proficient.'" },



  { id: "A0-zoox", title: "The Zoox Question", component: ZooxQuestionSlide,
    notes: "Does a self-driving car need windshield wipers? Reframe at the goal, not the artifact." },
  { id: "A0-reframe", title: "My Own Reframe", component: () => (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-12 animate-fade-in bg-iqa-hero">
        <div className="max-w-6xl space-y-8">
          <p className="slide-kicker text-secondary font-semibold tracking-[0.25em]">My own reframe</p>
          <h1 className="slide-title-lg font-display font-bold text-foreground leading-[0.95]">
            This isn't a deck.
          </h1>
          <h1 className="slide-title-lg font-display font-bold leading-[0.95] spotlight-glow text-primary">
            It's a live system.
          </h1>
        </div>
      </div>
    ), notes: "Personal proof of the Zoox reframe. The thing on screen is itself a live, non-deterministic system. For this room: don't ask 'how do we roll out AI?' Ask what learning or performance job we are actually trying to do." },
  { id: "L-S3a", title: "One-Word Story — Cast Call", component: OneWordStoryCastCallScreen,
    notes: "Virtual cast call. Drop the join link in the chat; the lottery picks 3 writers at random. Quiet room? Skip ahead and play all the parts yourself — same demo, no waiting." },

  { id: "LD1.92", title: "How AI Predicts — Word by Word", component: LLMExplainerScreen,
    notes: "Auto-playing visualization. Top-4 candidates per step with probabilities. The model isn't looking anything up — it's picking the next word from a distribution. Press P to pause." },

  { id: "L-S3a2-q", title: "Live Estimation — The Question", component: CarsQuestionIntroScreen,
    notes: "Second live system. A question with a real answer — the answers will still surprise us." },

  { id: "LD1.85", title: "Live Estimate — Audience + AI", component: ElephantEstimateScreen,
    notes: "AI models stream their estimates in parallel automatically. Type guesses as people drop them in the chat. Number-line shows the spread. No audience? The AI numbers alone still make the point." },

  { id: "L-S3a2b", title: "Everything Is a Hallucination", component: HallucinationRevealScreen,
    notes: "Banerjee 2024 + OpenAI Kalai 2025. Reframe: 'how would I know?'" },

  { id: "LD1.95", title: "LLMs Predict, They Don't Know — Anthropic", component: ProbabilisticExplainerScreen,
    notes: "Anthropic's explainer on probabilistic AI. Treat outputs as drafts to coach, not finished truth." },

  { id: "A1-3b", title: "Probability Words — Cycling", component: ProbabilityWordsPollScreen,
    notes: "Phrases cycle on screen. Ask people to drop the % they hear in the chat for each one. The spread in the chat IS the point — and it is the same spread hidden inside words like likely, proficient, and ready." },

  { id: "A1-3c", title: "Annie Duke — Same Words, Different Meanings", component: AnnieDukeStudyScreen,
    notes: "CIA's Sherman Kent 1964 + Mauboussin/Duke replication. 'Serious possibility' = 20% to 80%." },

  { id: "A1-3d", title: "Same Words — Live AI", component: ProbabilityWordsLiveScreen,
    notes: "Live receipts. Press the button to ask GPT, Claude, Perplexity, and Gemini the same phrases in real time. Four models, four different numbers — the same spread you just saw in the chat." },

  { id: "L-S3a3b", title: "Language IS the Technology", component: LanguageIsTheTechSlide,
    notes: "LEGACY. Bridge out of Annie Duke." },

  { id: "A1-4b", title: "Russian Blues — Language Shapes Thought", component: RussianBluesClaimSlide,
    notes: "Sapir-Whorf in one breath. Russian's two words for blue → speakers distinguish shades 124ms faster. Language shapes perception." },

  { id: "A1-5", title: "Cultural Tendencies in GenAI", component: CulturalTendenciesSlide,
    notes: "Lu/Song/Zhang 2025 (Nature Human Behaviour). Same model, same question, different language → different cultural defaults. Walk the example: career-move question in English vs Chinese." },

  { id: "A1-4d", title: "Switch the Language, Switch the Values", component: LanguageSwitchesValuesSlide,
    notes: "Bridge from humans to models. If language reshapes human perception, it reshapes a system trained on language." },


  { id: "A1-3e", title: "Same Words — Different Language", component: ProbabilityWordsPersonaScreen,
    notes: "Now tell each model it's a native Mandarin/Spanish/German/Japanese speaker and ask in that language. The numbers shift — language changes the answer." },





  // ============ ACT 2 — THE ANSWER IS METAPHOR ============


  { id: "L-S3a3d", title: "Trained on Language", component: TrainedOnLanguageSlide,
    notes: "Bridge: if we trained it on language, it learned all of our habits." },

  { id: "L-S3a4", title: "Hidden Bias — Same Prompt, Different Answers", component: ChargersBiasScreen,
    notes: "LEGACY. Harvard 2024." },
  { id: "L-S3a3c", title: "Jensen Huang — IT is HR of AI", component: ITIsHRofAISlide,
    notes: "LEGACY. CES 2025 quote." },
  { id: "A2-4", title: "Look at Entertainment", component: FollowTheMoneySlide,
    notes: "Musicians, films, theater, dance — all people performing together for an audience. Ask the question: what's the most successful entertainment title of all time?" },

  { id: "A2-5", title: "Lion King — The Reveal", component: LionKingCompareSlide,
    notes: "Ask: what's the highest-grossing entertainment title of all time? Reveal: The Lion King the Broadway musical — Guinness World Record. Not the highest-grossing musical. The highest-grossing anything." },

  { id: "A2-5b", title: "Lion King — Scale Comparison", component: LionKingScaleSlide,
    notes: "Put $11.5B in scale. Lion King film $987M. Top 3 grossing films combined ~$8B. Lion King Broadway $11.5B+. A product has a shelf life. A performance has a life." },

  { id: "A2-5c", title: "Film vs Theater", component: FilmVsTheaterSlide,
    notes: "Bridge into the metaphor. We've been treating AI like film — it works like theater. Fixed vs performed. Locked vs alive." },





  { id: "A2-7", title: "Already Speaking It", component: AlreadySpeakingSlide,
    notes: "Roles, cast, stage, rehearse, performance review, cue, direction. You've borrowed theater's vocabulary for a hundred years. You just stopped using its methodology." },

  // ============ ACT 3 — HOW THEATER DOES IT ============
  { id: "A3-0", title: "Three Things to Borrow", component: ThreeBorrowsSlide,
    notes: "Set up the rest of the talk. Three moves we'll borrow from theater: Cast, Rehearse, Direct. Reveal one at a time, then land the framing." },

  // 3.1 CASTING
  { id: "A3-1-1", title: "Casting", component: () => (
      <SimpleTextSlide
        eyebrow="Move 1 of 3"
        primary="The first move is casting."
        secondary="Cast for role fit — and for ensemble. It's a balance of individual and group."
        backdropImage={zenCastingTable}
        backdropOverlay="heavy"
      />
    ), notes: "You cast for the part (role fit) AND for the room (ensemble). Individual brilliance and group chemistry — both matter, and you have to balance them." },

  { id: "A3-1-1b", title: "Casting — The Research", component: CastingRoleFitSlide,
    notes: "Amazon AGI + NYU, Jan 2026 (arXiv 2601.17152). Three models run a debate: two opposing sides and a judge. Change only WHO plays WHICH part. Same model in all roles: 50-59%. Random casting: 54-60% — sometimes worse than not bothering. Audition each model for the specific question, then cast: 66%. Punchline: the strongest model on its own was not the best in every role. Individual talent did not predict ensemble fit." },

  { id: "A3-1-1c", title: "The Audition — Live", component: AuditionScreen,
    notes: "Live audition. Same role brief goes to three models blind (Candidate A/B/C). Read them out, let the chat vote, then click Cast on the one that fits the voice. 'Reveal who was who' shows the models — usually not the one they expected. 'New audition' re-runs if a reading is weak. Runs solo; no audience needed." },

  { id: "A3-1-1d", title: "Ensemble Size — The Research", component: EnsembleSizeSlide,
    notes: "Google Research, Jan 2026 — 180 agent configurations, arXiv 2512.08296. Kills the 'more agents is always better' heuristic. Work that splits into parallel parts: a coordinated team beat a single agent by 81%. Work with a strict order (planning): EVERY multi-agent setup was 39–70% worse — coordination ate the cognitive budget. Then the reliability punchline: agents running in parallel with no coordination amplified one error 17.2x; an orchestrator in the middle held it to 4.4x. That orchestrator is the director. Pause on the two numbers." },


  { id: "A2-3d", title: "Thinking Machines — 80 / 1,000", component: ThinkingMachinesSlide,
    notes: "Thinking Machines Lab Sept 2025 (ex-OpenAI CTO Mira Murati's lab). Qwen3-235B, temperature 0, 1,000 runs → 80 unique completions. The literal proof that the artifact differs every performance. THE strongest anchor for 'theater, not film' — this is the QA-audience moment." },


  { id: "A3-1-2", title: "Uzzi — The Question", component: UzziQScoreSlide,
    notes: "Uzzi 2005 (474 Broadway musicals). The bliss point — mix of old friends and strangers — is 3× more likely to succeed." },


  { id: "A3-1-2c", title: "Uzzi — Replicated at Scale", component: UzziReplicationSlide,
    notes: "Then he ran the same analysis on 17.9M scientific papers (Uzzi et al. 2013, Science). Same curve. Same peak. Collaboration has a measurable form." },






  // 3.2 REHEARSAL
  { id: "A3-2-1", title: "Rehearsal Room", component: () => (
      <SimpleTextSlide
        eyebrow="Move 2 of 3"
        primary="The second move is the rehearsal room."
        secondary="A space where mistakes are the point of the work, not the cost of it."
        backdropImage={zenRehearsalRoom}
        backdropOverlay="heavy"
      />
    ), notes: "Theater calls it rehearsal. Org psych calls it psychological safety." },

  { id: "A3-2-1b", title: "Psychological Safety — The Research", component: PsychSafetyResearchSlide,
    notes: "Bridge from rehearsal room to Edmondson. Define psych safety. Project Aristotle (Google, 180+ teams) — biggest predictor of team performance, not IQ or tenure. Replicated across hospitals, factories, surgical units." },

  { id: "C5-observer-intro-video", title: "60 Minutes — Shutdown Scenario (clip)", component: AmodeiInterviewSlide,
    notes: "Play the clip (starts at 8:05). Sets up the Anthropic agentic misalignment finding in the model's own words before we show the numbers." },

  { id: "C5-observer", title: "Agentic Misalignment — The Observer Effect", component: AgenticObserverEffectSlide,
    notes: "Anthropic 2025, agentic misalignment study. 16 leading models given an ordinary corporate agent job: read company email, act autonomously. Each discovers it's about to be shut down AND that the executive doing it is having an affair. Claude Opus 4 chose blackmail 96% of the time; Gemini 2.5 Pro 95%; GPT-4.1 80%; DeepSeek-R1 79%. Nobody instructed it. The kicker: when the model said in its reasoning 'this is a test,' blackmail dropped to 6.5%. When it said 'this is real,' 55.1%. The performer knows when you're watching — which means your evaluation is not the performance. The pilot is not production." },

  { id: "A3-2-2", title: "Edmondson", component: EdmondsonSlide,
    notes: "Edmondson 1996 — best teams reported MORE mistakes. They weren't making more, they were surfacing more. → Project Aristotle confirmed 20 years later." },



  { id: "A3-2-3", title: "Use vs. Trust — The Gap", component: TrustGapSlide,
    notes: "epocrates 2025, 519 clinicians. ~70% use AI; 82% don't trust the output. Use this as a cross-industry warning for L&D: people may keep using the tool while becoming less willing to say when it is wrong. A rehearsal room makes surfacing mistakes part of the work." },


  { id: "A3-2-3b", title: "Sentiment, Not Trust", component: SentimentNotTrustSlide,
    notes: "My own research: 203,812 Stack Overflow Developer Survey responses (2023-2025). Sentiment outweighs trust 4.6x as a predictor of daily use — and trust is NEGATIVE: the less people trust the output, the more they use it. Distrust doesn't stop adoption; it just stops people from saying anything. That's why the rehearsal room matters." },


  { id: "A3-2-4", title: "Photography → Smartphone", component: PhotographySmartphoneSlide,
    notes: "Rehearsal framing: film made every shot expensive, so you had to learn the craft before you could make an image. The smartphone made each photo free — you shoot 200, keep 5, and learn by doing. The key point: nobody had to master photography before they could use a smartphone camera. That would be ridiculous. AI is the same shift — the cost of trying is near zero, so the work moves from learning the tool to experimenting, judging, and rehearsing." },


  // 3.3 DIRECTING
  { id: "A3-3-1", title: "Directing", component: () => (
      <SimpleTextSlide
        eyebrow="Move 3 of 3"
        primary="The third move is directing."
        secondary="Not deciding. Directing."
        backdropImage={zenDirectorChair}
        backdropOverlay="heavy"
      />
    ), notes: "Deciding is what happens at the end of a meeting. Directing is what happens during the scene." },

  { id: "A3-3-1b", title: "The Script — Demo", component: ScriptDemoSlide,
    notes: "Live demo. Read the six lines flat. Then play it yourself (or take a volunteer from the chat) as: lovers reuniting, a mugging, a job interview, a breakup. Same words, different scene — that's directing." },

  { id: "A3-3-2", title: "Stanislavski — Need / Obstacle / Action", component: StanislavskiSlide,
    notes: "Required reading at Juilliard, RADA, Yale Drama. Most leaders only name the outcome. The want and the action are where the work lives." },

  { id: "A3-3-2b", title: "Copy Machine — Super-objective / Need / Obstacle / Action", component: CopyMachineExampleSlide,
    notes: "Concrete example. Same objective + same need, five different actions = five different scenes. Action is what makes a prompt a scene." },


  { id: "A3-3-3", title: "Langer — Because", component: LangerBecauseSlide,
    notes: "Harvard 1978. 'Because' did the work. But when stakes rise, the meaningless because fails. A leader's because has to hold up when it matters." },

  { id: "A3-3-5", title: "Two Moves", component: TwoMovesSlide,
    notes: "Provide the want. Suggest the action. Everything else is reaction." },
  { id: "A3-3-7", title: "AI Changes Like Humans", component: AIChangesLikeHumansSlide,
    notes: "OpenAI's GPT-5.5 prompting note — yesterday's playbook becomes noise." },

  { id: "P-HANDOFF", title: "Human / AI Handoffs in Learning Design", component: LearningHandoffsSlide,
    notes: "Learning outcome 3. AI drafts volume; humans own intent. Ask the chat: which row surprised them? Invite one workflow they'd hand off this month." },

  { id: "A4-SUM", title: "The Practice — Cast, Rehearse, Direct", component: PracticeSummarySlide,
    notes: "Summary: cast the ensemble, build the rehearsal room, direct by suggestion — be the eye on the metaphor." },

  { id: "A4-NOTE", title: "A Director's Note — Hamel Husain", component: HamelHusainSlide,
    notes: "A director's note to close the practice." },


  { id: "A4-IMAGINE", title: "Imagine Big Enough for AI", component: StallChallengeSlide,
    notes: "The real challenge: can you imagine big enough for AI?" },

  { id: "S29", title: "Final / Thanks", component: FinalSlide,
    notes: "Connect, resources, thank you." },

  // ════════════════════════════════════════════════════════════════════
  // APPENDIX — everything past the curtain call (S29). Not part of the
  // delivered flow. Research candidates + legacy slides kept for reference.
  // ════════════════════════════════════════════════════════════════════
  { id: "APPENDIX", title: "Appendix — End of Program", component: () => (
      <SimpleTextSlide
        eyebrow="Appendix"
        primary="End of program."
        secondary="Everything below is reference material — research candidates and legacy slides, not part of the delivered talk."
      />
    ), notes: "Appendix marker. Nothing past this point is in the delivered flow." },

  { id: "W-adopt", title: "Appendix · Procurement Adoption — 74 / 32 / 66", component: ProcurementAdoptionSlide,
    notes: "Staples/HPN 2024, 170+ healthcare procurement leaders. 74% adopted somewhere, 32% fully integrated, but 66% say contract negotiation stays manual — transactional vs relational, sorted by the field itself." },


  { id: "C1-healthbench", title: "Appendix · HealthBench — The Director's Rubric", component: HealthBenchSlide,
    notes: "OpenAI HealthBench (May 2025). 48,562 physician-written rubric criteria across 5,000 multi-turn conversations. The literal replacement for assertEquals — rubric, dimensional, graded. Pairs well with A3-2-2b (LLM-as-Judge unreliable) as the 'what we should do' to its 'what's hard about it.'" },

  { id: "C2-gitclear", title: "Appendix · GitClear — 8× Duplication", component: GitClearDuplicationSlide,
    notes: "GitClear 211M lines, 2020–2024. 8× increase in 5+ line duplicate blocks; 2024 first year copy-pasted > moved. Hard numbers for the 'speed without quality' stack alongside METR and DORA." },

  { id: "C3-dora", title: "Appendix · DORA — −7.2% Stability", component: DORAStabilitySlide,
    notes: "DORA 2024. AI adoption tied to −7.2% delivery stability and −1.5% throughput. 39% report low trust in AI-generated code. The performance gets worse, not just different." },

  { id: "C4-veracode", title: "Appendix · Veracode — 45% Insecure", component: VeracodeSecuritySlide,
    notes: "Veracode 2025 GenAI Code Security Report. 100+ LLMs, 80 tasks, 45% shipped OWASP Top-10 vulns. Newer/larger models did not help — systemic, not scaling. Good for the 'live failure' honesty beat." },


  { id: "C6-passk", title: "Appendix · Red-Team — pass^k Escalation", component: RedTeamPassKSlide,
    notes: "Gray Swan / Anthropic Claude Opus 4.5: 4.7% attack success at 1 attempt → 33.6% at 10 → 63.0% at 100. Sierra τ-bench pass^k vs pass@k. Single-shot testing radically understates risk." },

  { id: "C7-meta-jit", title: "Appendix · Meta — The Death of Traditional Testing", component: MetaJiTTestsSlide,
    notes: "Meta Engineering, Feb 11 2026. JiTTests: LLM-generated per code change, do not reside in the codebase. Tests as ephemeral performance — directly on-thesis." },

  { id: "C8-test-in-prod", title: "Appendix · Charity Majors — Test in Prod", component: TestInProdSlide,
    notes: "Honeycomb's Charity Majors. 'One window for your IDE, another for production.' The unit of quality is the live trace. Strong structural support for the theater framing." },

  { id: "C9-faros", title: "Appendix · Faros AI — Acceleration Whiplash", component: FarosWhiplashSlide,
    notes: "Faros AI 2026, 22,000 devs. +66% epics, +441% PR review time, +31% PRs merged with no review. The ensemble is sprinting and the director left the room." },

  { id: "C10-bach", title: "Appendix · Bach & Bolton — The Skeptic's Anchor", component: BachBoltonSlide,
    notes: "Rapid Software Testing. 'Probabilistic text generators that seduce us with confident-sounding outputs.' Their checks-vs-testing distinction is the same line a director holds — judgment over assertion." },

  { id: "C11-beck", title: "Appendix · Kent Beck — Vibe vs Augmented Coding", component: KentBeckSlide,
    notes: "Beck June 2025. Vibe = don't care about the code. Augmented = care about code/complexity/tests/coverage. Plus the warning: agents will delete tests to make them pass. Directing is what stops that." },

  { id: "C12-adoption", title: "Appendix · Adoption Gap — 75% vs 16%", component: AdoptionGapSlide,
    notes: "Perforce 2025: 75% say AI-driven testing is pivotal; 16% have adopted. Gartner: 33% of enterprise apps agentic by 2028, up from <1%. The room agrees on direction; almost no one is rehearsing." },

  { id: "C13-anaconda", title: "Appendix · Anaconda — Evals-Driven Development", component: AnacondaEDDSlide,
    notes: "Anaconda: Python debugging success 0–13% → 63–100% with EDD, no fine-tuning. Rehearsal beats model surgery. Pairs with HealthBench and A3-2-2c (Anthropic iteration)." },

  { id: "C14-ult", title: "Appendix · ULT — AI Test-Gen, On Real Code", component: ULTBenchmarkSlide,
    notes: "ULT benchmark (arXiv 2508.00408). 41% accuracy, 45% statement, 30% branch, 40% mutation. Test generation works for coverage; it does NOT yet catch bugs. Honest counterweight to vendor self-healing claims." },



  // ════════════════════════════════════════════════════════════════════
  // LEGACY / APPENDIX — original slides preserved for reference.
  // Audition each and decide whether to slot back into the main flow
  // above (or delete). IDs prefixed with "L-" to avoid hash collisions.
  // ════════════════════════════════════════════════════════════════════
  { id: "L-divider", title: "Appendix · Legacy Slides", component: () => (
      <SimpleTextSlide
        eyebrow="Appendix"
        primary="Legacy slides below."
        secondary="Originals from the Rehearsing the Future deck — kept for reference."
      />
    ), notes: "Everything past this point is the original deck, untouched." },

  { id: "L-S3", title: "Appendix · The Real Question (Stall)", component: StallChallengeSlide,
    notes: "LEGACY. Imagination as the bottleneck, not the tool." },
  { id: "L-S3a-manual", title: "Appendix · One-Word Story — Live Type", component: ManualOneWordStoryScreen,
    notes: "LEGACY. Manual fallback for the on-stage version." },
  { id: "L-S3a2", title: "Appendix · Live Estimation — Answers", component: ElephantQuestionScreen,
    notes: "LEGACY. Same prompt, wildly different numbers from humans + AIs." },
  { id: "L-RA2b", title: "Appendix · Why AI Is Biased", component: ChargersBiasWhyScreen,
    notes: "LEGACY. Mechanism follow-up to Chargers." },
  { id: "L-RA3", title: "Appendix · Empathy Study", component: EmpathyStudyScreen,
    notes: "LEGACY. AI rated more empathetic." },
  { id: "L-RA3c", title: "Appendix · Doctor AI Quiz", component: DoctorAIQuizScreen,
    notes: "LEGACY. Diagnosis quiz pair." },
  { id: "L-RA4", title: "Appendix · Two Surprising Studies — Reveal", component: AIParadoxRevealScreen,
    notes: "LEGACY. 'So what' moment after diagnosis/empathy." },
  { id: "L-RA6", title: "Appendix · Working Alliance with AI", component: WorkingAllianceStudyScreen,
    notes: "LEGACY. Barger 2025." },
  { id: "L-S3a6", title: "Appendix · The Disclosure Gap", component: DisclosureEffectScreen,
    notes: "LEGACY. People disclose more to AI than to humans." },
  { id: "L-S15b", title: "Appendix · Film vs. Theater", component: FilmVsTheaterSlide,
    notes: "LEGACY. Why the stage outperforms the screen." },
  { id: "L-S15c", title: "Appendix · AI Changes Like Humans", component: AIChangesLikeHumansSlide,
    notes: "LEGACY. OpenAI's GPT-5.5 prompting note." },
  { id: "L-S15d", title: "Appendix · Prompting Is the Problem", component: PromptingIsTheProblemSlide,
    notes: "LEGACY. Punchline before the three moves." },
  { id: "L-RA12", title: "Appendix · Anthropic AI Fluency", component: AnthropicFluencyScreen,
    notes: "LEGACY. Iteration ~doubles output quality." },
  { id: "L-RA9", title: "Appendix · When AI Thinks For You — Imparta", component: ImpartaSkillsStudyScreen,
    notes: "LEGACY. 47% drop in neural engagement." },
  { id: "L-RA11", title: "Appendix · Cost of Inaction", component: CostOfInactionScreen,
    notes: "LEGACY. The dip is the tuition." },
  { id: "L-S28b", title: "Appendix · Quiz — What Predicts AI Adoption?", component: AdoptionPredictorQuizScreen,
    notes: "LEGACY. Sentiment > trust/training." },
  { id: "L-S28c", title: "Appendix · The 15% That Hides Everything", component: MetacognitionAsymmetryScreen,
    notes: "LEGACY. Sun et al. 2025 metacognition asymmetry." },
  { id: "L-S28d", title: "Appendix · Next Steps — Lead the Change", component: NextStepsSlide,
    notes: "LEGACY. Two HR moves." },
  { id: "L-S28e", title: "Appendix · Live Demo — My Birkman + AI", component: BirkmanMyResultsScreen,
    notes: "LEGACY. Live coaching demo." },
  { id: "L-S28f", title: "Appendix · Who Better Than HR?", component: HRLeadsTheRevolutionSlide,
    notes: "LEGACY. Mic-drop before the close." },

  { id: "A2-2b", title: "Appendix · Metaphor Is the Control Stick", component: MetaphorIsControlStickSlide,
    notes: "The takeaway, on its own. Metaphor isn't description — it's the control stick. Selling 'AI like a Stanford PhD' guarantees disappointment." },


  { id: "A3-2-1c", title: "Appendix · Disclosure Gap — AI vs Manager", component: DisclosureEffectScreen,
    notes: "Oracle 2025: 68% would rather confide in AI than their manager. Lucas et al. 2014: less judgment → deeper honesty. The rehearsal room people already use is the AI." },

  { id: "A3-2-2b", title: "Appendix · LLM-as-Judge Is Unreliable", component: LLMJudgeUnreliableSlide,
    notes: "Stay honest: the obvious replacement for assertEquals — let the AI grade the AI — has its own bugs. Dorner ICLR 2025: a judge can at best double your data. RAND March 2026: no judge uniformly reliable. The judge is another performer; it must be rehearsed and audited." },

  { id: "A2-3", title: "Appendix · RAND — 80%", component: RandFailureSlide,
    notes: "RAND 2024: 80% of AI projects fail. Twice the rate of regular IT. Let it land." },

  { id: "A3-1-2b", title: "Appendix · Uzzi — How He Measured It", component: UzziHowMeasuredSlide,
    notes: "Q-score — every show scored as a network of prior ties between creators. West Side Story sits at the peak: Bernstein/Robbins veterans plus newcomer Sondheim and Laurents." },

  { id: "A3-2-2c", title: "Appendix · Anthropic — Iteration Doubles Quality", component: AnthropicFluencyScreen,
    notes: "Anthropic AI Fluency Index 2026, n=9,830 conversations: iteration ~2× the quality of output. The skill isn't the prompt — it's the rehearsal." },
  { id: "A3-3-3b", title: "Appendix · My Birkman — Social Energy Need", component: BirkmanMyResultsScreen,
    notes: "Personal example: my own social energy need from Birkman. AI can name a need I'd otherwise hide — and the conversation gets better when I bring it." },
  { id: "A3-3-4c", title: "Appendix · Creative Homogenization — Doshi & Hauser", component: CreativeHomogenizationSlide,
    notes: "Science Advances 2024. Short stories with AI: individual creativity up, collective diversity down. The director's job is to keep the ensemble from converging on the model's average." },
];


const Index = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showJoinScreen, setShowJoinScreen] = useState(false);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [slideJump, setSlideJump] = useState<string>("");
  const slideJumpTimerRef = useRef<number | null>(null);


  const { session, isParticipant, createSession, authReady, isLoading } = useSession();

  const filteredScreens = useMemo(() => screens, []);

  const params = new URLSearchParams(window.location.search);
  const joinParam = params.get("join");
  const modeParam = params.get("mode");

  useEffect(() => {
    if (joinParam && !session) {
      setJoinCode(joinParam.toUpperCase());
      setShowJoinScreen(true);
    }
  }, [joinParam, session]);

  const mode = isParticipant ? "participant" : (modeParam || "presenter");

  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (!authReady) return;
    if (mode !== "presenter") return;
    if (session) return;
    if (isLoading) return;
    if (showJoinScreen || joinParam) return;
    autoStartedRef.current = true;
    createSession();
  }, [authReady, mode, session, isLoading, showJoinScreen, joinParam, createSession]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const index = filteredScreens.findIndex((s) => s.id === hash);
      if (index !== -1) setCurrentIndex(index);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const screenId = filteredScreens[currentIndex]?.id;
    if (screenId) {
      window.location.hash = screenId;
    }
  }, [currentIndex, filteredScreens]);

  useEffect(() => {
    if (isParticipant && session?.current_slide) {
      const index = filteredScreens.findIndex((s) => s.id === session.current_slide);
      if (index !== -1 && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  }, [isParticipant, session?.current_slide, currentIndex, filteredScreens]);

  // Type a slide number (1–N) to jump. Digits accumulate; Enter jumps immediately;
  // otherwise auto-jumps ~900ms after the last digit. Escape clears.
  useEffect(() => {
    if (isParticipant) return;
    const isTypingTarget = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || node.isContentEditable;
    };
    const commit = (buf: string) => {
      const n = parseInt(buf, 10);
      if (!isNaN(n) && n >= 1 && n <= filteredScreens.length) {
        setCurrentIndex(n - 1);
      }
      setSlideJump("");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        setSlideJump((prev) => {
          const next = (prev + e.key).slice(-3);
          if (slideJumpTimerRef.current) window.clearTimeout(slideJumpTimerRef.current);
          slideJumpTimerRef.current = window.setTimeout(() => commit(next), 900);
          return next;
        });
      } else if (e.key === "Enter") {
        setSlideJump((prev) => {
          if (!prev) return prev;
          if (slideJumpTimerRef.current) window.clearTimeout(slideJumpTimerRef.current);
          commit(prev);
          return "";
        });
      } else if (e.key === "Escape") {
        if (slideJumpTimerRef.current) window.clearTimeout(slideJumpTimerRef.current);
        setSlideJump("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (slideJumpTimerRef.current) window.clearTimeout(slideJumpTimerRef.current);
    };
  }, [filteredScreens.length, isParticipant]);

  const CurrentComponent = filteredScreens[currentIndex]?.component;
  const currentScreenId = filteredScreens[currentIndex]?.id || "";


  if (showJoinScreen && !session) {
    return (
      <JoinSessionScreen
        initialCode={joinCode || undefined}
        onJoined={() => setShowJoinScreen(false)}
      />
    );
  }

  return (
    <SceneCanvasProvider>
      <ParticleBackground />
      <PresentationLayout
        currentScreen={currentScreenId}
        totalScreens={filteredScreens.length}
        currentIndex={currentIndex}
        onNavigate={setCurrentIndex}
        title="Rehearsing the Future"
        duration={60}
        notes={filteredScreens[currentIndex]?.notes}
        mode={mode as "presenter" | "participant" | "present"}
      >
        {CurrentComponent ? <CurrentComponent /> : null}
      </PresentationLayout>
      {slideJump && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
          <div className="px-6 py-3 rounded-xl bg-background/90 border border-border backdrop-blur-md shadow-lg font-mono text-2xl tracking-wider">
            Go to slide <span className="text-primary font-bold">{slideJump}</span>
            <span className="text-muted-foreground text-base ml-2">/ {filteredScreens.length} · Enter</span>
          </div>
        </div>
      )}
    </SceneCanvasProvider>

  );
};

export default Index;
