import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileSearch, 
  BarChart3, 
  Users, 
  BookOpen,
  Lightbulb
} from "lucide-react";

const useCases = [
  {
    icon: FileSearch,
    category: "Conference Prep",
    title: "Parent-Teacher Conferences",
    description: "Surface patterns across student work to prepare personalized talking points",
    example: "\"Help me identify growth patterns for each student in my 3rd period class based on their last 5 assignments.\"",
  },
  {
    icon: BarChart3,
    category: "Data Analysis",
    title: "Assessment Insights",
    description: "Analyze formative assessment data to identify intervention opportunities",
    example: "\"Which concepts are students struggling with most, and what patterns do you see in their mistakes?\"",
  },
  {
    icon: Users,
    category: "Student Engagement",
    title: "Engagement Discovery",
    description: "Explore factors affecting student participation and motivation",
    example: "\"What questions could I ask students to understand why participation dropped in October?\"",
  },
  {
    icon: BookOpen,
    category: "Curriculum Design",
    title: "Lesson Adaptation",
    description: "Quickly adapt lessons when plans change or students need differentiation",
    example: "\"Help me scaffold this research project for students at three different reading levels.\"",
  },
  {
    icon: Lightbulb,
    category: "AI Integration",
    title: "Policy Development",
    description: "Think through AI integration strategies for your classroom or school",
    example: "\"What questions should I ask myself before creating an AI use policy for my classroom?\"",
  },
];

export const EducatorUseCasesScreen = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-slide-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-3">
          <span className="text-sm font-medium">5 Live Rehearsals</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
          Education Use Cases
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Each scenario is a rehearsal—exploring possibilities before the performance
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 h-full">
          {useCases.map((useCase, index) => (
            <Card 
              key={index} 
              className="flex flex-col hover:shadow-lg transition-all border-2 hover:border-primary/30"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <useCase.icon className="w-5 h-5 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {useCase.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight">{useCase.title}</CardTitle>
                <CardDescription className="text-sm">
                  {useCase.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pt-0">
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground italic">
                  {useCase.example}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
