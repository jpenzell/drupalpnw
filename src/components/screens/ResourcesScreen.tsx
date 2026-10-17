import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, FileText, Users } from "lucide-react";

export const ResourcesScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Resources & Further Reading
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light">
          Deepen your practice with these trusted sources
        </p>
      </div>

      <div className="grid gap-8 max-w-6xl mx-auto">
        <Card className="p-8 hover:shadow-xl transition-all">
          <div className="flex gap-4 items-start mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Ethan Mollick: Leadership-Lab-Crowd
              </h3>
              <Badge variant="secondary" className="mb-3">Change Management</Badge>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Practical framework for organizational AI adoption. Create vivid pictures of AI-powered future, 
                build cross-functional labs for rapid testing, and unleash crowd innovation through "Secret Cyborgs."
              </p>
              <a 
                href="https://www.oneusefulthing.org/p/how-to-use-ai-to-do-practical-stuff" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
              >
                Read Mollick's guidance <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Card>

        <Card className="p-8 hover:shadow-xl transition-all">
          <div className="flex gap-4 items-start mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                AI in Education: Strategic Framework
              </h3>
              <Badge variant="secondary" className="mb-3">Educational Leadership</Badge>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Four-stage AI adoption model for education: Improve Efficiency → Support Instruction → Personalize Learning → Transform Pedagogy. 
                Key imperatives: Redesign assessment, develop digital literacy, ensure equitable access, refine instructional leadership.
              </p>
              <a 
                href="https://www.iste.org/ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
              >
                Read ISTE's AI guidance <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 hover:shadow-lg transition-all">
            <h4 className="text-lg font-bold text-foreground mb-3">
              Key Research Studies
            </h4>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-1">•</span>
                <div>
                  <a 
                    href="https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2825395" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    JAMA: LLM access didn't improve physician diagnostics (2024)
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-1">•</span>
                <div>
                  <a 
                    href="https://mitsloan.mit.edu/ideas-made-to-matter/ai-productivity-paradox" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    MIT: AI Productivity J-Curve & The Efficiency Paradox
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-1">•</span>
                <div>
                  <a 
                    href="https://blog.providence.org/national-news/providence-study-finds-ai-clinical-assistant-reduces-provider-burnout" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Providence: Ambient AI reduces burnout by 30%
                  </a>
                </div>
              </li>
            </ul>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all">
            <h4 className="text-lg font-bold text-foreground mb-3">
              Compliance & Ethics
            </h4>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-1">•</span>
                <div>
                  <a 
                    href="https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    NYC Local Law 144: AEDT Requirements
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-1">•</span>
                <div>
                  <a 
                    href="https://www.hhs.gov/hipaa/for-professionals/security/index.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    HIPAA Security Rule Update (2025): AI-specific requirements
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-1">•</span>
                <div>
                  <a 
                    href="https://www.eeoc.gov/ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    EEOC Guidance on AI in Employment Decisions
                  </a>
                </div>
              </li>
            </ul>
          </Card>
        </div>

        <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Continue the Conversation
          </h3>
          <div className="space-y-4 text-foreground">
            <p className="text-lg leading-relaxed">
              <strong>Internal Resources:</strong>
            </p>
            <ul className="space-y-2 text-muted-foreground ml-6">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">→</span>
                <span>AI Pilot Project Templates & Safe-to-Fail Framework</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">→</span>
                <span>Weekly "Five-Minute Friday" AI Retrospective Format</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">→</span>
                <span>Prompt Library for Common HR Use Cases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">→</span>
                <span>Contact HR AI Working Group for support</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};
