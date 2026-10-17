import { Target, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";

export const MindsetDelegateScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center overflow-hidden">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 glass-effect rounded-full mb-4">
            <span className="text-3xl font-black text-primary">F</span>
            <Target className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Develop & Delegate
          </h1>
          <p className="text-2xl text-primary font-semibold">
            Know when to direct vs. when to let AI run
          </p>
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <h3 className="text-lg font-bold text-muted-foreground mb-3">From the Demos</h3>
            <p className="text-xl text-foreground leading-relaxed">
              Consumer insights needed <strong className="text-primary">heavy direction</strong>—we shaped every question. 
              Data summarization? We let AI run.
            </p>
            <p className="text-base text-muted-foreground mt-4">
              A Director knows which scenes need close attention and which can be trusted to the actors.
            </p>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20">
            <h3 className="text-lg font-bold text-muted-foreground mb-3">The Artistic Lens</h3>
            <p className="text-xl text-foreground leading-relaxed">
              Some scenes require <strong className="text-accent">line-by-line coaching</strong>. Others need space for the performer to discover.
            </p>
            <p className="text-base text-muted-foreground mt-4">
              Match your involvement to the stakes. High-stakes = direct. Low-stakes = delegate.
            </p>
          </Card>
        </div>

        {/* Takeaway */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Quote className="h-6 w-6 text-primary/50" />
          <p className="text-xl text-muted-foreground italic">
            "Not every task needs the same level of direction—calibrate your involvement"
          </p>
        </div>
      </div>
    </div>
  );
};
