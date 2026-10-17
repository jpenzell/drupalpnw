import { MessageSquare } from "lucide-react";

export const LanguageIntroScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Words Mean Different Things
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
          Because LLMs work with language, this matters more than ever
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent/20 rounded-2xl p-10 shadow-xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center flex-shrink-0 shadow-lg">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                The Language Challenge
              </h2>
              <p className="text-muted-foreground text-lg italic">Same words, different meanings</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-foreground text-2xl leading-relaxed">
              When you say a word like <strong>"always"</strong> or <strong>"serious possibility"</strong>, 
              what percentage do you mean?
            </p>

            <p className="text-foreground text-xl leading-relaxed">
              Different people assign wildly different numbers to the same probability language. 
              And so does AI.
            </p>

            <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-6 mt-8">
              <p className="text-foreground text-xl leading-relaxed">
                This creates miscommunication everywhere—in risk assessments, project updates, 
                policy language, and performance conversations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
