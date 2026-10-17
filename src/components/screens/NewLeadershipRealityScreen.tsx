import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export const NewLeadershipRealityScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-12 animate-slide-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full mb-4">
          <TrendingUp className="h-5 w-5 text-accent" />
          <span className="text-accent font-semibold text-lg">Vision Forward</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          The Future of Teaching
        </h1>
      </div>

      <Card className="p-12 max-w-6xl mx-auto bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/30">
        <div className="space-y-10">
          <div className="text-center">
            <blockquote className="text-3xl md:text-4xl font-bold text-foreground italic mb-6 leading-relaxed">
              "Every teacher will work with AI assistants. The question is: Will we lead that partnership, or let it lead us?"
            </blockquote>
            <p className="text-xl text-muted-foreground font-semibold">
              — Adapted from education AI research
            </p>
          </div>

          <div className="space-y-8">
            <p className="text-center text-2xl leading-relaxed text-foreground">
              <strong>If AI works with language and supports learning, who better to guide this transformation than educators who understand human development and pedagogy?</strong>
            </p>
            
            <div className="bg-primary/10 border-l-4 border-primary p-10 rounded-xl">
              <h3 className="text-3xl font-bold text-primary mb-8 text-center">The New Teaching Reality</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  <span className="text-4xl text-primary">→</span>
                  <p className="text-xl leading-relaxed"><strong>All Students are Learners with AI</strong> — They'll use AI tools for research, writing, problem-solving, and creativity</p>
                </div>
                <div className="flex items-start gap-6">
                  <span className="text-4xl text-primary">→</span>
                  <p className="text-xl leading-relaxed"><strong>All Teachers are Learning Designers</strong> — You design experiences that develop critical thinking alongside AI fluency</p>
                </div>
                <div className="flex items-start gap-6">
                  <span className="text-4xl text-primary">→</span>
                  <p className="text-xl leading-relaxed"><strong>The Challenge:</strong> How will you teach students to think critically WITH AI instead of letting AI do the thinking FOR them?</p>
                </div>
              </div>
            </div>

            <p className="text-center font-bold text-3xl text-foreground">
              The answer: <span className="text-primary">Pedagogical expertise, ethical clarity, and the courage to redesign learning.</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
