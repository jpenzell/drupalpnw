import { Camera, FileText } from "lucide-react";

export const AbundanceIntroScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          The Age of Abundance
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
          Stop worrying about perfect prompts—start generating
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-2xl p-10 shadow-xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Remember Digital Photography?
              </h2>
              <p className="text-muted-foreground text-lg italic">Film cameras vs. digital abundance</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-destructive/10 border-2 border-destructive/30 p-6 rounded-xl">
              <p className="font-bold text-destructive mb-3 text-lg">📷 Film Era</p>
              <p className="text-foreground text-lg leading-relaxed mb-3">
                36 exposures per roll. Every shot costs money. You had to get it right the first time.
              </p>
              <p className="text-muted-foreground italic">
                Scarcity forced perfection.
              </p>
            </div>

            <div className="bg-primary/10 border-2 border-primary/30 p-6 rounded-xl">
              <p className="font-bold text-primary mb-3 text-lg">📱 Digital Era</p>
              <p className="text-foreground text-lg leading-relaxed mb-3">
                Unlimited photos. Take 100 shots, pick the best 5. Delete 95 without guilt.
              </p>
              <p className="text-muted-foreground italic">
                Abundance changed behavior.
              </p>
            </div>
          </div>

          <div className="bg-accent/10 border-l-4 border-accent rounded-xl p-6">
            <p className="text-foreground text-xl leading-relaxed">
              <strong>How many people still have receipts on their phone from expenses they filed years ago?</strong>
            </p>
            <p className="text-muted-foreground text-lg mt-3 italic">
              We shifted from scarcity (delete photos to save space) to abundance (never delete anything). 
              Digital storage became so cheap, we stopped caring.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-accent/5 to-secondary/5 border-2 border-accent/20 rounded-2xl p-10 shadow-xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                AI Is the Same Shift
              </h2>
              <p className="text-muted-foreground text-lg italic">From text scarcity to text abundance</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-background/60 border-2 border-foreground/20 p-6 rounded-xl">
              <p className="text-foreground text-xl leading-relaxed mb-4">
                <strong>Old mindset:</strong> "I need to craft the perfect prompt to get one perfect output."
              </p>
              <p className="text-destructive text-lg">
                → This is film-camera thinking in a digital world.
              </p>
            </div>

            <div className="bg-primary/10 border-2 border-primary/30 p-6 rounded-xl">
              <p className="text-foreground text-xl leading-relaxed mb-4">
                <strong>New mindset:</strong> "I'll generate 10 versions, pick the best 2, and refine those."
              </p>
              <p className="text-primary text-lg font-semibold">
                → This is abundance thinking. Generate freely, curate ruthlessly.
              </p>
            </div>

            <div className="bg-accent/10 border-l-4 border-accent rounded-xl p-6 mt-6">
              <h3 className="text-2xl font-bold text-accent mb-4">
                💡 Stop Learning "Perfect Prompting"
              </h3>
              <p className="text-foreground text-xl leading-relaxed">
                You don't need to master prompts. You need to master <strong>curation</strong>. 
                Generate abundance, then apply your judgment to select and refine what matters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
