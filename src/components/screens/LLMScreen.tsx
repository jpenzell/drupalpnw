import { Sparkles } from "lucide-react";

export const LLMScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          The AI Story: Level 4
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light">
          Large Language Models — The ChatGPT moment
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-l-4 border-l-primary rounded-2xl p-8 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Large Language Models (2022→)
              </h2>
              <p className="text-muted-foreground text-lg italic">When AI learned to write</p>
            </div>
          </div>
          <p className="text-foreground text-xl mb-6 leading-relaxed">
            <strong>The revolution:</strong> Apply deep learning to <em>language itself</em>. Train massive neural networks 
            on trillions of words from the internet to predict the next word in a sequence. Scale to billions of parameters. 
            Suddenly, it can write, reason, summarize, code, translate—fluently.
          </p>
          <p className="text-destructive font-semibold text-lg">
            ⚠️ But remember: It's predicting likely words, not retrieving facts. This is why hallucinations happen.
          </p>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-accent mb-3">November 30, 2022: The Day Everything Changed</h3>
          <p className="text-foreground text-lg leading-relaxed mb-3">
            OpenAI released ChatGPT to the public. Free to use, simple chat interface, no technical knowledge required.
          </p>
          <p className="text-primary font-semibold text-lg">
            → 100 million users in 2 months. Fastest-growing consumer app in history. 
            Every industry suddenly realized: "AI is real, and it's here now."
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-background/60 p-6 rounded-xl border-2 border-primary/20 shadow-md">
            <p className="text-sm font-semibold text-primary mb-3">ChatGPT, Gemini, Claude</p>
            <p className="text-foreground text-lg mb-3 leading-relaxed">
              Generates fluent text on any topic
            </p>
            <p className="text-destructive font-semibold text-sm">
              ⚠️ Fluent ≠ True. Always verify.
            </p>
          </div>

          <div className="bg-background/60 p-6 rounded-xl border-2 border-primary/20 shadow-md">
            <p className="text-sm font-semibold text-primary mb-3">GitHub Copilot</p>
            <p className="text-foreground text-lg mb-3 leading-relaxed">
              AI pair programmer
            </p>
            <p className="text-primary font-semibold text-sm">
              30-55% productivity gains, but bugs ↑9%
            </p>
          </div>

          <div className="bg-background/60 p-6 rounded-xl border-2 border-primary/20 shadow-md">
            <p className="text-sm font-semibold text-primary mb-3">Educational Support</p>
            <p className="text-foreground text-lg mb-3 leading-relaxed">
              Grading feedback, lesson planning, chatbots
            </p>
            <p className="text-destructive font-semibold text-sm">
              ⚠️ Teachers review everything
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-l-4 border-l-destructive rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Why This Time is Different
          </h3>
          <div className="space-y-4 text-foreground text-lg leading-relaxed">
            <div className="flex gap-4">
              <span className="text-3xl">🌐</span>
              <div>
                <p className="font-semibold mb-2">General Purpose, Not Narrow</p>
                <p className="text-muted-foreground">
                  Previous AI: spam filter, chess AI, radiology AI. 
                  LLMs: write, code, analyze, translate, reason across ANY domain.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-3xl">👥</span>
              <div>
                <p className="font-semibold mb-2">Accessible to Everyone</p>
                <p className="text-muted-foreground">
                  No coding required. Just type in plain language. 
                  Democratizes AI—anyone can use it, not just data scientists.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-3xl">📈</span>
              <div>
                <p className="font-semibold mb-2">Capabilities Still Accelerating</p>
                <p className="text-muted-foreground">
                  GPT-4 (2023) to Gemini 2.5 (2025): multimodal (text + images), 
                  million-token context windows, better reasoning. This isn't slowing down.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-accent/10 border-2 border-accent/20 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-accent mb-4 flex items-center gap-2">
            <span className="text-3xl">🔑</span>
            The Core Insight for Educators
          </h3>
          <p className="text-foreground text-xl leading-relaxed mb-4">
            LLMs are <strong>pattern-matching engines</strong>, not knowledge databases. 
            They're extraordinary at generating fluent text, terrible at knowing when they don't know something.
          </p>
          <p className="text-primary font-semibold text-xl">
            → Your job: Know when to use them (drafting materials, brainstorming activities, generating examples) and when to be cautious 
            (grading final work, providing curriculum standards, making educational decisions).
          </p>
        </div>
      </div>
    </div>
  );
};
