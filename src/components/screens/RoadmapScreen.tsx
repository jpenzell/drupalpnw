import { Calendar, Rocket, Target, TrendingUp, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export const RoadmapScreen = () => {
  const phases = [
    {
      period: "Quick Wins",
      subtitle: "This Week",
      icon: Rocket,
      color: "from-green-500 to-emerald-600",
      borderColor: "border-green-500/30",
      bgColor: "from-green-500/10 to-green-500/5",
      actions: [
        "Try AI to summarize one account's performance data",
        "Draft one buyer email using AI, then refine",
        "Generate talking points for your next buyer meeting",
        "Share one success with a teammate",
      ],
    },
    {
      period: "30 Days",
      subtitle: "Build Habits",
      icon: Calendar,
      color: "from-primary to-secondary",
      borderColor: "border-primary/30",
      bgColor: "from-primary/10 to-primary/5",
      actions: [
        "Establish a weekly AI workflow for one recurring task",
        "Create prompt templates for common requests",
        "Start tracking time saved on routine work",
        "Identify your top 3 AI use cases",
      ],
    },
    {
      period: "60 Days",
      subtitle: "Expand & Refine",
      icon: Target,
      color: "from-accent to-orange-500",
      borderColor: "border-accent/30",
      bgColor: "from-accent/10 to-accent/5",
      actions: [
        "Apply AI to 2-3 account management workflows",
        "Measure impact: time saved, quality improved",
        "Share best practices with National Accounts team",
        "Refine prompts based on what's working",
      ],
    },
    {
      period: "90 Days",
      subtitle: "Scale & Lead",
      icon: TrendingUp,
      color: "from-purple-500 to-indigo-600",
      borderColor: "border-purple-500/30",
      bgColor: "from-purple-500/10 to-purple-500/5",
      actions: [
        "Document your AI playbook for the team",
        "Train others on effective prompting",
        "Propose process improvements to leadership",
        "Quantify ROI: hours saved, deals accelerated",
      ],
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="text-primary font-semibold text-lg">Your Action Plan</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          30/60/90 Day Roadmap
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
          From first experiment to team-wide adoption—your path forward
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            return (
              <Card 
                key={index}
                className={`p-6 bg-gradient-to-br ${phase.bgColor} border-2 ${phase.borderColor} hover:shadow-xl transition-all`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{phase.period}</h3>
                    <p className="text-sm text-muted-foreground">{phase.subtitle}</p>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  {phase.actions.map((action, actionIndex) => (
                    <li key={actionIndex} className="flex gap-3 items-start">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-12">
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
            📊 ROI Framework: Measuring Success
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">Time Saved</div>
              <p className="text-muted-foreground text-sm">Hours per week on routine tasks like data summarization and email drafting</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">Quality Improved</div>
              <p className="text-muted-foreground text-sm">Better insights, faster responses, more thorough buyer prep</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">Deals Accelerated</div>
              <p className="text-muted-foreground text-sm">Faster turnaround on proposals, promotions, and account issues</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
