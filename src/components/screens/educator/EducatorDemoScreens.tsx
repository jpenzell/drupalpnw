import { Target, TrendingUp, Users, DollarSign, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Educator Demo Screen 1: Student Conference Prep
export const EducatorDemoBuyerPrepScreen = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full mb-4">
          <Badge variant="outline" className="border-secondary/50 text-secondary bg-secondary/10">
            Rehearsal 1 of 5
          </Badge>
          <Target className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="border-primary/30 text-primary">
            Student-Centered Focus
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
          Parent-Teacher Conference Prep
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-muted/50 border-2 border-border rounded-2xl p-12">
            <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">
              📍 Scenario
            </p>
            <p className="text-3xl md:text-4xl text-foreground leading-relaxed">
              You have parent-teacher conferences next week. You've prepared your standard talking points about each student.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Educator Demo Screen 2: Assessment Data Analysis
export const EducatorDemoPromoVelocityScreen = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full mb-4">
          <Badge variant="outline" className="border-secondary/50 text-secondary bg-secondary/10">
            Rehearsal 2 of 5
          </Badge>
          <TrendingUp className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="border-primary/30 text-primary">
            Data-Driven Decisions
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
          Assessment Data Analysis
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-muted/50 border-2 border-border rounded-2xl p-12">
            <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">
              📍 Scenario
            </p>
            <p className="text-3xl md:text-4xl text-foreground leading-relaxed">
              You have 18 months of student assessment data. Administration wants to know which interventions "worked."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Educator Demo Screen 3: Student Engagement
export const EducatorDemoConsumerInsightsScreen = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full mb-4">
          <Badge variant="outline" className="border-secondary/50 text-secondary bg-secondary/10">
            Rehearsal 3 of 5
          </Badge>
          <Users className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="border-primary/30 text-primary">
            Student Insights
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
          Student Engagement Discovery
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-muted/50 border-2 border-border rounded-2xl p-12">
            <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">
              📍 Scenario
            </p>
            <p className="text-3xl md:text-4xl text-foreground leading-relaxed">
              Student engagement is flat in your 10th grade English class, and you need to understand why before curriculum review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Educator Demo Screen 4: Curriculum Planning
export const EducatorDemoScenarioPlanningScreen = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full mb-4">
          <Badge variant="outline" className="border-secondary/50 text-secondary bg-secondary/10">
            Rehearsal 4 of 5
          </Badge>
          <DollarSign className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="border-primary/30 text-primary">
            Curriculum & Planning
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
          Curriculum Timeline Planning
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-muted/50 border-2 border-border rounded-2xl p-12">
            <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">
              📍 Scenario
            </p>
            <p className="text-3xl md:text-4xl text-foreground leading-relaxed">
              Your department wants to shift the research project from spring to winter break. You need to adapt the scaffolding this week.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Educator Demo Screen 5: AI Policy Response
export const EducatorDemoCompetitiveStrategyScreen = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full mb-4">
          <Badge variant="outline" className="border-secondary/50 text-secondary bg-secondary/10">
            Rehearsal 5 of 5
          </Badge>
          <MessageSquare className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="border-primary/30 text-primary">
            AI Integration Strategy
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
          AI Integration Deep-Dive
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-muted/50 border-2 border-border rounded-2xl p-12">
            <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">
              📍 Scenario
            </p>
            <p className="text-3xl md:text-4xl text-foreground leading-relaxed">
              Students are using AI to write essays. Your colleagues want a policy response—but you're wondering if there's a better approach.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
