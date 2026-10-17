import { Layers } from "lucide-react";

export const MachineLearningScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          The AI Story: Level 2
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light">
          Machine Learning — Learning from examples
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-l-4 border-l-green-500 rounded-2xl p-8 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Layers className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Machine Learning (1980s→)
              </h2>
              <p className="text-muted-foreground text-lg italic">Discovering patterns in data</p>
            </div>
          </div>
          <p className="text-foreground text-xl mb-6 leading-relaxed">
            <strong>The breakthrough:</strong> Instead of writing rules, show the computer thousands of examples 
            and let it <strong>discover the patterns</strong>. This is <strong>supervised learning</strong>.
          </p>
          <p className="text-primary font-semibold text-lg">
            → You provide labeled data; the model finds the rules automatically.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-background/60 p-6 rounded-xl border-2 border-green-500/20 shadow-md">
            <p className="text-sm font-semibold text-green-600 mb-3">Email Spam</p>
            <p className="text-foreground text-lg mb-2 leading-relaxed">
              Learns from 100,000s of emails
            </p>
            <p className="text-muted-foreground text-sm">
              "FREE!!!", sketchy domains = spam
            </p>
          </div>

          <div className="bg-background/60 p-6 rounded-xl border-2 border-green-500/20 shadow-md">
            <p className="text-sm font-semibold text-green-600 mb-3">Fraud Detection</p>
            <p className="text-foreground text-lg mb-2 leading-relaxed">
              Learns your purchase patterns
            </p>
            <p className="text-muted-foreground text-sm">
              $5,000 charge in Moscow at 3am? Blocked.
            </p>
          </div>

          <div className="bg-background/60 p-6 rounded-xl border-2 border-green-500/20 shadow-md">
            <p className="text-sm font-semibold text-green-600 mb-3">Recommendations</p>
            <p className="text-foreground text-lg mb-2 leading-relaxed">
              Netflix, Spotify, YouTube
            </p>
            <p className="text-muted-foreground text-sm">
              "Because you watched X, try Y"
            </p>
          </div>
        </div>

        <div className="bg-accent/10 border-2 border-accent/20 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-accent mb-4">
            Why Machine Learning Works
          </h3>
          <ul className="space-y-3 text-foreground text-lg">
            <li className="flex gap-3">
              <span className="text-accent font-bold">✓</span>
              <span><strong>Adaptive:</strong> Gets better as it sees more data</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold">✓</span>
              <span><strong>Scalable:</strong> Can handle millions of inputs</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold">✓</span>
              <span><strong>Finds hidden patterns:</strong> Discovers relationships humans miss</span>
            </li>
          </ul>
          <p className="text-primary font-semibold text-lg mt-6">
            → But for really complex problems (images, speech, language), we needed something deeper...
          </p>
        </div>
      </div>
    </div>
  );
};
