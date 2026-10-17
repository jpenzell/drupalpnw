import { CheckCircle2 } from "lucide-react";

export const BenefitsSummaryScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          It's All About How You Use It
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
          The difference between risk and benefit
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-destructive mb-6">
              ❌ Using AI Passively
            </h2>
            <div className="space-y-4">
              <div className="bg-background/60 border border-destructive/30 p-4 rounded-lg">
                <p className="text-foreground font-semibold mb-2">One-Shot Prompting</p>
                <p className="text-muted-foreground text-sm">"Write this for me" → Accept first output</p>
              </div>
              <div className="bg-background/60 border border-destructive/30 p-4 rounded-lg">
                <p className="text-foreground font-semibold mb-2">Over-Trust</p>
                <p className="text-muted-foreground text-sm">Assuming outputs are correct and complete</p>
              </div>
              <div className="bg-background/60 border border-destructive/30 p-4 rounded-lg">
                <p className="text-foreground font-semibold mb-2">No Verification</p>
                <p className="text-muted-foreground text-sm">Skipping fact-checking and bias review</p>
              </div>
              <div className="bg-background/60 border border-destructive/30 p-4 rounded-lg">
                <p className="text-foreground font-semibold mb-2">Cognitive Offloading</p>
                <p className="text-muted-foreground text-sm">Letting AI do your thinking for you</p>
              </div>
            </div>
            <p className="text-destructive font-bold text-lg mt-6">
              → Hallucination, bias, reduced critical thinking
            </p>
          </div>

          <div className="bg-primary/10 border-2 border-primary/30 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-primary mb-6">
              ✓ Using AI as Thought Partner
            </h2>
            <div className="space-y-4">
              <div className="bg-background/60 border border-primary/30 p-4 rounded-lg">
                <p className="text-foreground font-semibold mb-2">Conversational Iteration</p>
                <p className="text-muted-foreground text-sm">Multiple rounds, exploring alternatives</p>
              </div>
              <div className="bg-background/60 border border-primary/30 p-4 rounded-lg">
                <p className="text-foreground font-semibold mb-2">Critical Review</p>
                <p className="text-muted-foreground text-sm">Questioning outputs, challenging assumptions</p>
              </div>
              <div className="bg-background/60 border border-primary/30 p-4 rounded-lg">
                <p className="text-foreground font-semibold mb-2">Verification Always</p>
                <p className="text-muted-foreground text-sm">Fact-checking, bias review, human judgment</p>
              </div>
              <div className="bg-background/60 border border-primary/30 p-4 rounded-lg">
                <p className="text-foreground font-semibold mb-2">Metacognitive Engagement</p>
                <p className="text-muted-foreground text-sm">Using AI to enhance your thinking process</p>
              </div>
            </div>
            <p className="text-primary font-bold text-lg mt-6">
              → More empathetic, creative, and thoughtful results
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20 rounded-2xl p-10 shadow-xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0 shadow-lg">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                The Research Is Clear
              </h2>
              <p className="text-muted-foreground text-lg italic">Same tool, completely different outcomes</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-foreground text-xl leading-relaxed">
              The studies showing <strong>benefits</strong> (4:1 empathy preference, enhanced creativity, 
              improved metacognition) all involved users who:
            </p>
            <ul className="text-foreground text-lg space-y-2 ml-8">
              <li>• Engaged in dialogue with AI</li>
              <li>• Reviewed and refined outputs</li>
              <li>• Applied critical thinking</li>
              <li>• Used AI to enhance their judgment, not replace it</li>
            </ul>
            <p className="text-foreground text-xl leading-relaxed mt-6">
              The studies showing <strong>risks</strong> (hallucination, bias, cognitive decline) 
              involved passive acceptance of AI outputs without critical engagement.
            </p>
          </div>
        </div>

        <div className="bg-primary/10 border-l-4 border-primary rounded-2xl p-8">
          <p className="text-foreground text-2xl leading-relaxed font-semibold">
            This is why the Prism viewpoints matter—they give you a framework for using AI 
            as a thought partner, not a replacement.
          </p>
        </div>
      </div>
    </div>
  );
};
