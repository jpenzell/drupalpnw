import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface PrismViewpoint {
  id: string;
  title: string;
  why: string;
  example: string;
  activity: string;
  reference: string;
}

const viewpoints: PrismViewpoint[] = [
  {
    id: "A",
    title: "Probabilistic Thinking",
    why: "Prevent over-trust; RCT shows access ≠ impact without changed behavior. LLMs predict likely tokens, not certain truth.",
    example: "Exit-interview text themes → validate findings before acting on them.",
    activity: "Mark what you'd verify before acting on each theme.",
    reference: "See: P1.3 'LLMs Predict, They Don't Know' — AI is a pattern predictor, not a knowledge database. Always verify outputs."
  },
  {
    id: "B",
    title: "Conversational Curiosity",
    why: "No universal magic prompt; small phrasing swings item-level performance—so iterate and refine.",
    example: "Iterate a return-to-work memo for clinic staff through multiple rounds.",
    activity: "Compare outputs from each round and note how specificity improves quality.",
    reference: "See: P1.6b 'Why Critical Thinking Matters' — Use AI as a thought partner through conversation, not one-shot prompting."
  },
  {
    id: "C",
    title: "Metacognitive Reflection",
    why: "Examine framing; item-level swings are real. Always ask: 'If this answer misleads us, what's the failure path?'",
    example: "Performance-plan language → supportive vs punitive outputs.",
    activity: "Identify hidden assumptions in AI-generated performance language.",
    reference: "See: P1.6b 'Critical Thinking' — Challenge assumptions. Ask: 'What am I missing? How would different stakeholders see this?'"
  },
  {
    id: "D",
    title: "Fluid Identities",
    why: "Multi-stakeholder stress-testing in minutes. See how different roles interpret the same message.",
    example: "Same scheduling policy → responses as nurse manager, compliance, new grad.",
    activity: "Adjust original policy based on multi-stakeholder feedback.",
    reference: "See: P1.5d.3 'Language Takeaway' — Words mean different things to different people. Use AI to explore interpretations."
  },
  {
    id: "E",
    title: "Abundance Curation",
    why: "Human curation turns AI volume into quality; performance gains depend on curation and process redesign.",
    example: "Generate 10 low-risk AI pilots for your HR team, then curate the best 2.",
    activity: "Vote on top 2 pilots; define success metric + review step for each.",
    reference: "See: P1.7 'Abundance' — Stop worrying about perfect prompts. Generate freely, curate ruthlessly. Like digital photography."
  },
  {
    id: "F",
    title: "Develop & Delegate",
    why: "Move from doing to leading: develop the assistant (prompts/workflows/patterns), then delegate routine work—review like a junior's draft.",
    example: "After drafting a performance review through conversation, ask: 'Based on our discussion, what prompt should I have given you at the start to get this result immediately next time?'",
    activity: "Have AI play a role in one conversation, then ask it to write the reusable prompt at the end.",
    reference: "This viewpoint combines everything: conversation, metacognition, abundance curation. We'll explore delegation approaches next."
  },
];

export const PrismTabs = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          The AI Prism: Six Viewpoints
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Bringing everything together—refract "AI" into actionable lenses for HR leadership
        </p>
      </div>

      <Tabs defaultValue="A" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto p-2 bg-gradient-to-r from-primary/10 to-accent/10">
          {viewpoints.map((vp) => (
            <TabsTrigger 
              key={vp.id} 
              value={vp.id}
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white px-3 py-4 text-sm md:text-base font-semibold"
            >
              <div className="text-center">
                <div className="text-lg md:text-xl mb-1">{vp.id}</div>
                <div className="hidden md:block">{vp.title.split(" ")[0]}</div>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {viewpoints.map((vp) => (
          <TabsContent key={vp.id} value={vp.id} className="mt-6">
            <div className="bg-gradient-to-br from-background to-accent/5 border-2 border-primary/20 rounded-2xl p-8 shadow-xl">
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-2xl text-white shadow-lg">
                    {vp.id}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                    {vp.title}
                  </h3>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-6">
                  <h4 className="font-bold text-primary mb-3 text-lg flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    Why it matters
                  </h4>
                  <p className="text-foreground text-lg leading-relaxed">{vp.why}</p>
                </div>

                <div className="bg-accent/10 border-l-4 border-accent rounded-xl p-6">
                  <h4 className="font-bold text-accent mb-3 text-lg flex items-center gap-2">
                    <span className="text-2xl">🏥</span>
                    Healthcare-HR Example
                  </h4>
                  <p className="text-foreground text-lg leading-relaxed">{vp.example}</p>
                </div>

                <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/30 rounded-xl p-6">
                  <h4 className="font-bold text-secondary mb-3 text-lg flex items-center gap-2">
                    <span className="text-2xl">🔗</span>
                    We Already Covered This
                  </h4>
                  <p className="text-foreground text-lg leading-relaxed italic">{vp.reference}</p>
                </div>

                <div className="bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20 rounded-xl p-6">
                  <h4 className="font-bold text-accent mb-3 text-lg flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    Quick Activity (2 min)
                  </h4>
                  <p className="text-foreground text-lg leading-relaxed">{vp.activity}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-2xl p-8 mt-8">
        <p className="text-foreground text-xl leading-relaxed text-center">
          <strong>These six viewpoints</strong> connect all the concepts we've covered—probabilistic thinking, 
          conversational curiosity, language variability, bias awareness, and abundance mindset. 
          Use them as lenses to approach any AI use case.
        </p>
      </div>
    </div>
  );
};
