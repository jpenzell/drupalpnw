import { Lightbulb, TrendingUp } from "lucide-react";

export const CreativityStudyScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          AI as Cognitive Partner
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
          Enhances creativity and metacognition
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-accent/5 to-secondary/5 border-2 border-accent/20 rounded-2xl p-10 shadow-xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Recent Research Findings (2025)
              </h2>
              <p className="text-muted-foreground text-lg italic">Multiple peer-reviewed studies</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-primary/10 border-2 border-primary/30 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <p className="font-bold text-primary text-xl">Creativity Boost</p>
                </div>
                <p className="text-foreground text-lg leading-relaxed mb-4">
                  When used as a <strong>collaborative thought partner</strong>, AI enhances ideation 
                  and generates more diverse solutions.
                </p>
                <p className="text-muted-foreground text-sm italic">
                  Source: "Artificial Intelligence and Collaborative Learning" (Journal of Educational Research, 2025)
                </p>
              </div>

              <div className="bg-accent/10 border-2 border-accent/30 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="h-6 w-6 text-accent" />
                  <p className="font-bold text-accent text-xl">Metacognition Improvement</p>
                </div>
                <p className="text-foreground text-lg leading-relaxed mb-4">
                  AI dialogue promotes <strong>self-reflection and critical thinking</strong> when 
                  users actively engage with outputs.
                </p>
                <p className="text-muted-foreground text-sm italic">
                  Source: "AI as a Cognitive Partner" (International Journal of Innovative Science, 2025)
                </p>
              </div>
            </div>

            <div className="bg-background/60 border-2 border-foreground/20 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Microsoft Research: The Critical Factor
              </h3>
              <p className="text-foreground text-xl leading-relaxed mb-4">
                A 2025 Microsoft study found that AI's impact on critical thinking depends entirely 
                on <strong>how you use it</strong>:
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-destructive/10 border-2 border-destructive/30 p-5 rounded-xl">
                  <p className="font-semibold text-destructive mb-2">⚠️ Passive Use</p>
                  <p className="text-foreground">
                    Accepting first outputs → <strong>reduced cognitive effort</strong> → 
                    diminished critical thinking skills
                  </p>
                </div>
                <div className="bg-primary/10 border-2 border-primary/30 p-5 rounded-xl">
                  <p className="font-semibold text-primary mb-2">✓ Active Engagement</p>
                  <p className="text-foreground">
                    Iterating through dialogue → <strong>enhanced reasoning</strong> → 
                    improved problem-solving
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary/10 border-l-4 border-primary rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-primary mb-4">
            💡 For Educators
          </h3>
          <p className="text-foreground text-xl leading-relaxed mb-4">
            Use AI to explore more creative lesson designs, generate diverse 
            assessment approaches, or brainstorm differentiation strategies.
          </p>
          <p className="text-foreground text-xl leading-relaxed">
            The key: <strong>Stay in conversation.</strong> Don't accept the first answer—push for 
            alternatives, challenge assumptions, and use AI to see angles you might miss.
          </p>
        </div>
      </div>
    </div>
  );
};
