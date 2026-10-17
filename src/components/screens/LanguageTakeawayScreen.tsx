import { Lightbulb } from "lucide-react";

export const LanguageTakeawayScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Use AI to Bridge Language Gaps
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
          Don't assume shared understanding
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-2xl p-10 shadow-xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                The Key Insight
              </h2>
              <p className="text-muted-foreground text-lg italic">Language is variable everywhere</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-foreground text-2xl leading-relaxed">
              <strong>Language variability exists:</strong>
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-primary/10 border-2 border-primary/20 p-6 rounded-xl">
                <p className="font-bold text-primary mb-2 text-lg">Between People</p>
                <p className="text-foreground">Different roles, backgrounds, contexts</p>
              </div>

              <div className="bg-accent/10 border-2 border-accent/20 p-6 rounded-xl">
                <p className="font-bold text-accent mb-2 text-lg">Between AI Models</p>
                <p className="text-foreground">Different training data and patterns</p>
              </div>

              <div className="bg-secondary/10 border-2 border-secondary/20 p-6 rounded-xl">
                <p className="font-bold text-secondary mb-2 text-lg">Between AI & Humans</p>
                <p className="text-foreground">Pattern prediction vs lived experience</p>
              </div>
            </div>

            <div className="bg-accent/10 border-l-4 border-accent rounded-xl p-8 mt-8">
              <h3 className="text-2xl font-bold text-accent mb-4">
                💡 How to Use AI
              </h3>
              <p className="text-foreground text-xl leading-relaxed mb-4">
                Don't try to write the perfect prompt. Instead, use AI to explore how different people 
                interpret your language.
              </p>
              <p className="text-foreground text-xl leading-relaxed mb-6">
                <strong>Ask:</strong> <em>"How would a parent hear 'highly likely' versus a teacher? 
                What does 'rarely' mean to a student versus an administrator? Show me how different 
                stakeholders might interpret this communication about student progress."</em>
              </p>
              <p className="text-muted-foreground text-lg italic">
                Your words will mean different things to different people—use AI to help you see those 
                differences before you send the message.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-primary/10 border-2 border-primary/20 rounded-2xl p-8 mt-8">
          <h3 className="text-2xl font-bold text-primary mb-4">
            But Here's the Twist...
          </h3>
          <p className="text-foreground text-xl leading-relaxed">
            AI itself has these same language variations because it learned from billions of human texts. 
            <strong> It doesn't just help us see bias—it has bias too.</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
