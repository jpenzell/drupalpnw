import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const caseStudies = [
  {
    stat: "6 weeks",
    label: "time saved/year",
    title: "Lesson Planning Efficiency",
    category: "Teacher Productivity",
    source: "Gallup Education Survey",
    year: "2025",
    insight: "Teachers using AI for lesson planning report saving 6 weeks annually—but note outputs still require adaptation to student needs.",
    link: "https://www.gallup.com/education/512408/teachers-report-saving-significant-time-ai-tools.aspx",
  },
  {
    stat: "30%",
    label: "weekly AI users",
    title: "Teacher AI Adoption",
    category: "Technology Integration",
    source: "Gallup Education Survey",
    year: "2025",
    insight: "Nearly one-third of teachers now use AI tools weekly, up from just 12% in 2023.",
    link: "https://www.gallup.com/education/512408/teachers-report-saving-significant-time-ai-tools.aspx",
  },
  {
    stat: "47%",
    label: "drop in engagement",
    title: "Student Cognitive Load",
    category: "Learning Research",
    source: "Imparta Research",
    year: "2024",
    insight: "When AI does the thinking, students show 47% lower neural engagement with the material.",
    link: "https://www.imparta.com/research/ai-cognitive-engagement-study",
  },
  {
    stat: "80%",
    label: "couldn't recall",
    title: "Memory & Retention",
    category: "Learning Research",
    source: "Imparta Research",
    year: "2024",
    insight: "Students who outsourced writing to AI couldn't recall key points from their own essays hours later.",
    link: "https://www.imparta.com/research/ai-cognitive-engagement-study",
  },
  {
    stat: "4×",
    label: "more empathetic",
    title: "AI Feedback Quality",
    category: "Student Support",
    source: "JAMA Internal Medicine",
    year: "2023",
    insight: "AI-generated feedback was rated 4× more empathetic than human expert responses in blind studies.",
    link: "https://jamanetwork.com/journals/jamainternalmedicine/article-abstract/2804309",
  },
  {
    stat: "90%+",
    label: "failure rate",
    title: "Logic vs Pattern",
    category: "AI Limitations",
    source: "Apple Research",
    year: "2024",
    insight: "GPT-4 failed simple logic puzzles 90%+ when wording changed—revealing pattern-matching, not reasoning.",
    link: "https://machinelearning.apple.com/research",
  },
];

export const EducatorCaseStudiesScreen = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-slide-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-3">
          <span className="text-sm font-medium">Research-Backed Evidence</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
          Education Case Studies
        </h1>
        <p className="text-lg text-muted-foreground">
          What the research says about AI in teaching and learning
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full auto-rows-fr">
          {caseStudies.map((study, index) => (
            <Card 
              key={index} 
              className="flex flex-col hover:shadow-lg transition-all border-2 hover:border-primary/30 overflow-hidden"
            >
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs font-medium">
                    {study.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{study.year}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-bold text-primary">{study.stat}</span>
                  <span className="text-sm text-muted-foreground">{study.label}</span>
                </div>
                <CardTitle className="text-base leading-tight mt-1">{study.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pt-0 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {study.insight}
                </p>
                <a 
                  href={study.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <span>{study.source}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
