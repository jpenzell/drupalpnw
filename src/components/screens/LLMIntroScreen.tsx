import { Brain, Zap, MessageSquare, BarChart3 } from "lucide-react";

export const LLMIntroScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-in p-8">
      <div className="max-w-5xl mx-auto text-center space-y-10">
        <div className="inline-flex items-center gap-2 px-6 py-3 glass-effect rounded-full">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-primary font-semibold text-lg">The Connection</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            What You Just Saw
          </h1>
          <p className="text-2xl md:text-3xl text-muted-foreground leading-relaxed">
            AI predicts <span className="text-primary font-semibold">one word at a time</span>—
            just like you did with the story and the elephant question.
          </p>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30 rounded-2xl p-10 shadow-xl">
          <p className="text-xl text-muted-foreground mb-4">This technology is called a</p>
          <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-8">
            Large Language Model
          </h2>
          
          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="flex flex-col items-center gap-3 p-4 bg-background/50 rounded-xl border border-primary/20">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">Large</span>
              <span className="text-sm text-muted-foreground text-center">Trained on massive amounts of text</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-4 bg-background/50 rounded-xl border border-secondary/20">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center shadow-lg">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">Language</span>
              <span className="text-sm text-muted-foreground text-center">Works with words and text</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-4 bg-background/50 rounded-xl border border-accent/20">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center shadow-lg">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">Model</span>
              <span className="text-sm text-muted-foreground text-center">Predicts patterns from data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
