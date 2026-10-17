import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, Clock, Heart, Shield, AlertTriangle, Rocket } from "lucide-react";

export const CaseStudiesScreen = () => {
  const cases = [
    {
      id: "providence-day",
      title: "Providence Day School: AI-Powered Tutoring",
      category: "Personalized Learning",
      icon: Users,
      iconColor: "text-blue-500",
      summary: "Student-centered learning with AI tutors",
      visualStat: "24/7",
      visualLabel: "Support",
      bullets: [
        "Flint AI tutors provide personalized support across subjects, available anytime",
        "Students engage in Socratic dialogue—AI asks questions rather than giving answers",
        "Teachers monitor conversations and learning patterns through dashboard",
        "Critical success factor: AI as thought partner, not answer machine",
      ],
      takeaway: "AI can extend learning beyond class time while maintaining pedagogical quality",
      sourceUrl: "https://www.flintk12.com/blog/how-providence-day-school-is-using-flint"
    },
    {
      id: "stanford-teachers",
      title: "Stanford Study: Teachers & AI Productivity",
      category: "Teacher Workflows",
      icon: Clock,
      iconColor: "text-green-500",
      summary: "6 weeks/year time savings reported",
      visualStat: "30%",
      visualLabel: "Using Weekly",
      bullets: [
        "30% of teachers use AI weekly for lesson planning, materials creation, and feedback",
        "Teachers report saving approximately 6 weeks per year on administrative tasks",
        "Most productive use: generating teaching strategies and differentiated materials",
        "SchoolAI analysis: Usage correlates with perceived productivity gains",
      ],
      takeaway: "Time savings are real, but require learning to use AI strategically",
      sourceUrl: "https://www.govtech.com/education/higher-ed/stanford-study-teachers-lean-on-ai-for-productivity"
    },
    {
      id: "chatgpt-students",
      title: "Student Writing with ChatGPT: Mixed Results",
      category: "Learning Outcomes",
      icon: AlertTriangle,
      iconColor: "text-orange-500",
      summary: "Polished output, weaker thinking",
      visualStat: "⚠️",
      visualLabel: "Caution",
      bullets: [
        "Systematic review: Students produce more polished writing with better grammar",
        "However, critical thinking and argumentation skills show decline",
        "Students struggle to defend AI-generated ideas when questioned",
        "Key finding: AI can mask learning gaps with confident-sounding text",
      ],
      takeaway: "Teaching AI literacy means teaching students to think WITH it, not let it think FOR them",
      sourceUrl: "https://www.sciencedirect.com/science/article/pii/S0360131524002380"
    },
    {
      id: "1to1-devices",
      title: "1:1 Device Programs: The J-Curve",
      category: "Technology Adoption",
      icon: TrendingUp,
      iconColor: "text-purple-500",
      summary: "Initial dip before gains emerge",
      visualStat: "1-2yr",
      visualLabel: "Recovery",
      bullets: [
        "Initial test score declines common when schools adopt 1:1 device programs",
        "Teachers need time to redesign pedagogy, students develop digital literacy",
        "Recovery takes 1-2 years with professional development and curriculum redesign",
        "Long-term benefits emerge: personalized learning, engagement, 21st century skills",
      ],
      takeaway: "Technology alone doesn't improve learning—pedagogy redesign is essential",
      sourceUrl: "https://www.edweek.org/technology/one-to-one-laptop-programs-are-no-education-panacea/2016/05"
    },
    {
      id: "khanmigo",
      title: "Khan Academy: Khanmigo AI Tutor",
      category: "AI Tutoring at Scale",
      icon: Heart,
      iconColor: "text-pink-500",
      summary: "Socratic dialogue for all students",
      visualStat: "2.4M",
      visualLabel: "Students",
      bullets: [
        "Khanmigo uses GPT-4 to provide personalized Socratic tutoring",
        "Designed to guide thinking, not provide answers—prompts students with questions",
        "Parent/teacher dashboard shows student conversations and progress",
        "Early results: Increased engagement and metacognitive awareness",
      ],
      takeaway: "Well-designed AI tutors can scaffold thinking at scale",
      sourceUrl: "https://www.khanacademy.org/khan-labs"
    },
    {
      id: "magic-school",
      title: "Magic School AI: Teacher Tools Platform",
      category: "Lesson Planning",
      icon: Rocket,
      iconColor: "text-indigo-500",
      summary: "2M+ teachers using AI tools",
      visualStat: "2M+",
      visualLabel: "Educators",
      bullets: [
        "60+ AI tools for lesson planning, differentiation, assessment, IEP writing",
        "Teachers report significant time savings on planning and administrative tasks",
        "Built-in safeguards: age-appropriate content, bias detection, plagiarism checks",
        "School/district admin controls ensure responsible use aligned with policies",
      ],
      takeaway: "Purpose-built education AI tools offer safer starting point than general LLMs",
      sourceUrl: "https://www.magicschool.ai/"
    },
    {
      id: "equity-concerns",
      title: "AI Equity & Access Concerns",
      category: "Digital Divide",
      icon: Shield,
      iconColor: "text-red-500",
      summary: "Risk of widening achievement gaps",
      visualStat: "Gap",
      visualLabel: "Warning",
      bullets: [
        "Students with home AI access develop fluency faster than those without",
        "Higher-resourced schools implement AI faster and more effectively",
        "Risk: AI could widen existing achievement and opportunity gaps",
        "Proactive response needed: Ensure equitable access and high-quality implementation for all students",
      ],
      takeaway: "AI adoption must be intentionally equitable to avoid deepening divides",
      sourceUrl: "https://www.brookings.edu/articles/how-ai-could-widen-educational-equity-gaps/"
    },
    {
      id: "grading-assistance",
      title: "AI-Assisted Grading & Feedback",
      category: "Assessment",
      icon: DollarSign,
      iconColor: "text-yellow-500",
      summary: "Faster feedback, human oversight critical",
      visualStat: "3x",
      visualLabel: "Faster",
      bullets: [
        "AI can provide initial feedback 3x faster on writing assignments",
        "Best practice: AI generates suggestions, teacher reviews before sharing",
        "Student preference: 4:1 for detailed AI feedback over brief human comments",
        "Critical: Maintain human judgment on grades and high-stakes feedback",
      ],
      takeaway: "AI accelerates feedback loops but requires educator oversight for quality",
      sourceUrl: "https://www.nature.com/articles/s41586-024-07930-y"
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Stories from Classrooms
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light">
          Real evidence from K-12 AI implementations
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <Accordion type="single" collapsible className="space-y-4">
          {cases.map((caseStudy) => {
            const Icon = caseStudy.icon;
            return (
              <AccordionItem 
                key={caseStudy.id} 
                value={caseStudy.id}
                className="bg-card border-2 border-border rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                  <div className="flex items-center gap-6 text-left w-full">
                    <div className={`w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex flex-col items-center justify-center flex-shrink-0 border-2 border-primary/20`}>
                      <div className={`text-3xl font-bold ${caseStudy.iconColor}`}>
                        {caseStudy.visualStat}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{caseStudy.visualLabel}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`h-6 w-6 ${caseStudy.iconColor}`} />
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {caseStudy.title}
                        </h3>
                      </div>
                      <Badge variant="secondary" className="mb-2">
                        {caseStudy.category}
                      </Badge>
                      <p className="text-primary font-semibold text-lg mb-2">
                        💡 {caseStudy.takeaway}
                      </p>
                      <p className="text-muted-foreground text-sm">{caseStudy.summary}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-4 pt-4 pl-28">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Details:</p>
                      {caseStudy.bullets.map((bullet, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                          <span className="text-primary font-bold text-lg mt-1">•</span>
                          <p className="text-foreground leading-relaxed">{bullet}</p>
                        </div>
                      ))}
                    </div>

                    <a
                      href={caseStudy.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary hover:underline mt-4"
                    >
                      View source →
                    </a>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};
