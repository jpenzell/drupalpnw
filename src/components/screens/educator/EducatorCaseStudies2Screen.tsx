import { ExternalLink, TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const caseStudies = [
  {
    stat: "2×",
    label: "learning gains",
    title: "AI Tutoring vs. Active Learning",
    category: "Harvard RCT Study",
    source: "Nature Scientific Reports",
    year: "2025",
    insight: "Students using an AI tutor learned more than double what students in active learning classrooms learned—in 20% less time.",
    link: "https://www.nature.com/articles/s41598-025-97652-6",
    trend: "up",
  },
  {
    stat: "20%",
    label: "greater gains",
    title: "Khan Academy at Scale",
    category: "350K Student Study",
    source: "Khan Academy Efficacy",
    year: "2024",
    insight: "Students using Khan Academy 30+ min/week showed 20% greater-than-expected learning gains on standardized assessments.",
    link: "https://blog.khanacademy.org/khan-academy-efficacy-results-november-2024/",
    trend: "up",
  },
  {
    stat: "92%",
    label: "of students",
    title: "AI Tool Adoption",
    category: "Student Behavior",
    source: "Programs.com Survey",
    year: "2025",
    insight: "92% of students now use AI tools, up from 33% in early 2023—creating urgent need for AI literacy education.",
    link: "https://programs.com/resources/students-using-ai/",
    trend: "neutral",
  },
  {
    stat: "15%",
    label: "score drop",
    title: "The Deskilling Effect",
    category: "Cognitive Load Research",
    source: "Microsoft Research",
    year: "2024",
    insight: "Workers who relied heavily on AI showed 15% lower performance when AI was removed—skills atrophied from disuse.",
    link: "https://www.microsoft.com/research",
    trend: "down",
  },
  {
    stat: "0.73σ",
    label: "effect size",
    title: "Toward the 2-Sigma Goal",
    category: "Bloom's Challenge",
    source: "Nature Scientific Reports",
    year: "2025",
    insight: "AI tutoring achieved 0.73-1.3 standard deviation gains—approaching Bloom's '2 sigma' ideal of personalized tutoring.",
    link: "https://www.nature.com/articles/s41598-025-97652-6",
    trend: "up",
  },
  {
    stat: "48%",
    label: "skill decline",
    title: "Year-Over-Year Risk",
    category: "Longitudinal Study",
    source: "Khan Academy Research",
    year: "2024",
    insight: "48% of students who decreased AI-supported practice saw learning declines—consistency matters more than intensity.",
    link: "https://blog.khanacademy.org/khan-academy-efficacy-results-november-2024/",
    trend: "down",
  },
];

export const EducatorCaseStudies2Screen = () => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-slide-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-3">
          <Lightbulb className="w-4 h-4" />
          <span className="text-sm font-medium">Latest Research 2024-2025</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
          More AI in Education Studies
        </h1>
        <p className="text-lg text-muted-foreground">
          Breakthrough findings on AI tutoring, learning gains, and the deskilling paradox
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
                  <div className="flex items-center gap-1">
                    {getTrendIcon(study.trend)}
                    <span className="text-xs text-muted-foreground">{study.year}</span>
                  </div>
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

      {/* Key Insight Banner */}
      <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-center text-sm text-foreground">
          <span className="font-semibold">The Pattern:</span> AI dramatically improves outcomes when designed with pedagogy in mind—but passive reliance leads to skill erosion. 
          <span className="italic"> The tool amplifies intention.</span>
        </p>
      </div>
    </div>
  );
};
