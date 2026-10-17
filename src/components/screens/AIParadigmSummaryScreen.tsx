import { Lightbulb } from "lucide-react";

export const AIParadigmSummaryScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 overflow-hidden">
      <div className="max-w-6xl w-full">
        <div className="text-center space-y-10 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            So what did we learn?
          </h1>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-primary/10 border-2 border-primary/40 rounded-2xl p-6 text-left">
              <p className="text-xl font-semibold text-primary mb-2">It thinks like us</p>
              <p className="text-lg text-foreground">Learned from human language, sounds human</p>
            </div>
            <div className="bg-accent/10 border-2 border-accent/40 rounded-2xl p-6 text-left">
              <p className="text-xl font-semibold text-accent mb-2">It's biased like us</p>
              <p className="text-lg text-foreground">Hidden patterns we can't predict or explain</p>
            </div>
            <div className="bg-green-500/10 border-2 border-green-500/40 rounded-2xl p-6 text-left">
              <p className="text-xl font-semibold text-green-600 mb-2">Sometimes it's better</p>
              <p className="text-lg text-foreground">Empathy, patience, thoroughness</p>
            </div>
            <div className="bg-destructive/10 border-2 border-destructive/40 rounded-2xl p-6 text-left">
              <p className="text-xl font-semibold text-destructive mb-2">Sometimes it's worse</p>
              <p className="text-lg text-foreground">Novel problems, unfamiliar situations</p>
            </div>
          </div>
          
          <p className="text-2xl text-muted-foreground">
            It's not here to do the work <span className="text-destructive font-semibold">for</span> us. 
            It's here to think <span className="text-primary font-semibold">with</span> us.
          </p>
        </div>
      </div>
    </div>
  );
};
