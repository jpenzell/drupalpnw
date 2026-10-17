import { Shield, Scale } from "lucide-react";

export const PracticalGuardrailsScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Guardrails That Build Trust
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
          Reference guide for compliance & best practices
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Education Ethical Use */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-foreground mb-6">Education: Where AI Can Help Ethically</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-background/60 border border-primary/30 p-5 rounded-xl">
              <p className="font-semibold text-primary mb-2">✓ Administrative Tasks</p>
              <p className="text-foreground text-sm">Drafting newsletters, meeting summaries, parent communications</p>
            </div>
            <div className="bg-background/60 border border-primary/30 p-5 rounded-xl">
              <p className="font-semibold text-primary mb-2">✓ Instructional Materials</p>
              <p className="text-foreground text-sm">Creating lesson activities, adapting materials for different levels</p>
            </div>
            <div className="bg-background/60 border border-primary/30 p-5 rounded-xl">
              <p className="font-semibold text-primary mb-2">✓ Feedback Drafts</p>
              <p className="text-foreground text-sm">Generating personalized feedback, translating concepts for clarity</p>
            </div>
          </div>
        </div>

        {/* Education-Specific Concerns */}
        <div className="bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-destructive mb-6">Education-Specific AI Concerns</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-background/60 border border-destructive/30 p-5 rounded-xl">
                <p className="font-semibold text-destructive mb-2">⚠️ Grading & Assessment</p>
                <ul className="text-foreground text-sm space-y-1">
                  <li>• AI-generated grades can perpetuate bias</li>
                  <li>• Rubrics need human interpretation</li>
                  <li>• Student work evaluation requires educator judgment</li>
                </ul>
              </div>
              <div className="bg-background/60 border border-destructive/30 p-5 rounded-xl">
                <p className="font-semibold text-destructive mb-2">⚠️ Academic Integrity</p>
                <ul className="text-foreground text-sm space-y-1">
                  <li>• Detection tools have high false positive rates</li>
                  <li>• Accusations require evidence beyond AI scores</li>
                  <li>• Focus on learning process, not just output</li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-background/60 border border-destructive/30 p-5 rounded-xl">
                <p className="font-semibold text-destructive mb-2">⚠️ Student Privacy (FERPA)</p>
                <ul className="text-foreground text-sm space-y-1">
                  <li>• Never input student names or identifying info</li>
                  <li>• IEP/504 details must stay confidential</li>
                  <li>• Anonymize data in prompts when possible</li>
                </ul>
              </div>
              <div className="bg-background/60 border border-destructive/30 p-5 rounded-xl">
                <p className="font-semibold text-destructive mb-2">⚠️ Documentation</p>
                <ul className="text-foreground text-sm space-y-1">
                  <li>• Keep records of AI-assisted decisions</li>
                  <li>• Document your review & modification process</li>
                  <li>• Be prepared to explain your reasoning</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Compliance Reference */}
          <div className="space-y-6">
            <div className="bg-card border-2 border-border p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">FERPA & Student Privacy</h3>
              </div>
              <p className="text-muted-foreground mb-3">
                Student educational records and personally identifiable information must be protected under federal law.
              </p>
              <p className="text-sm text-primary">
                → Anonymize student data before using AI tools.
              </p>
            </div>

            <div className="bg-card border-2 border-border p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Equity & Accessibility</h3>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>AI tools must not disadvantage students with disabilities</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Ensure equal access to AI-enhanced learning</span>
                </li>
              </ul>
              <p className="text-sm text-primary mt-3">
                → AI should support inclusion, not create barriers.
              </p>
            </div>
          </div>

          {/* Best Practices */}
          <div className="space-y-6">
            <div className="bg-accent/10 border-2 border-accent/20 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-accent mb-4">Your Control Checklist</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-foreground mb-2">When Prompting:</p>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      <span>Be explicit about audience & tone</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      <span>Ask for inclusive language</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      <span>Request sources when facts matter</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-2">When Reviewing:</p>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      <span>Fact-check all claims</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      <span>Check for bias assumptions</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      <span>Verify compliance alignment</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">✓</span>
                      <span>Add human touch & brand voice</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-xl">
              <p className="text-foreground text-lg font-semibold">
                💡 Core Principle: Human-in-the-Loop
              </p>
              <p className="text-muted-foreground mt-2">
                AI assists decision-making; it doesn't replace judgment. 
                Always maintain final review and approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
