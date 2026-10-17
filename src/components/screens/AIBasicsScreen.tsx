import { Brain } from "lucide-react";

export const AIBasicsScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          The AI Story: Level 1
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light">
          Artificial Intelligence — The umbrella term
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-l-4 border-l-blue-500 rounded-2xl p-8 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Artificial Intelligence (1950s→)
              </h2>
              <p className="text-muted-foreground text-lg italic">Making machines think</p>
            </div>
          </div>
          <p className="text-foreground text-xl mb-6 leading-relaxed">
            <strong>What it means:</strong> Any system that mimics human intelligence—reasoning, problem-solving, 
            decision-making, learning. AI has been around since the 1950s.
          </p>
          <p className="text-primary font-semibold text-lg">
            → AI is the broad goal. Everything else is a method to achieve it.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-background/60 p-8 rounded-xl border-2 border-blue-500/20 shadow-md">
            <p className="text-sm font-semibold text-blue-600 mb-4">Example: Chess Computers (1997)</p>
            <p className="text-foreground text-2xl mb-4 leading-relaxed">
              Deep Blue beat world champion Garry Kasparov
            </p>
            <p className="text-muted-foreground text-lg">
              Programmers wrote rules: <em>"Control center, protect king, calculate 10 moves ahead."</em>
              200 million positions per second.
            </p>
          </div>

          <div className="bg-background/60 p-8 rounded-xl border-2 border-blue-500/20 shadow-md">
            <p className="text-sm font-semibold text-blue-600 mb-4">Example: Expert Systems (1980s)</p>
            <p className="text-foreground text-2xl mb-4 leading-relaxed">
              Medical diagnosis: MYCIN
            </p>
            <p className="text-muted-foreground text-lg">
              <em>"IF patient has fever AND green sputum, THEN bacterial pneumonia likely."</em>
              Thousands of IF-THEN rules. Couldn't adapt.
            </p>
          </div>
        </div>

        <div className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-destructive mb-4">
            The Problem with Rule-Based AI
          </h3>
          <ul className="space-y-3 text-foreground text-lg">
            <li className="flex gap-3">
              <span className="text-destructive font-bold">•</span>
              <span><strong>Brittle:</strong> Works only for scenarios programmers anticipated</span>
            </li>
            <li className="flex gap-3">
              <span className="text-destructive font-bold">•</span>
              <span><strong>Labor-intensive:</strong> Every rule must be hand-coded by experts</span>
            </li>
            <li className="flex gap-3">
              <span className="text-destructive font-bold">•</span>
              <span><strong>Can't scale:</strong> Real-world complexity overwhelms rule-based systems</span>
            </li>
          </ul>
          <p className="text-primary font-semibold text-lg mt-6">
            → This is why researchers turned to <strong>learning from data</strong> instead...
          </p>
        </div>
      </div>
    </div>
  );
};
