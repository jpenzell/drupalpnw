import { MessageSquare, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const LanguageVariabilityScreen = () => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const languageExamples = {
    "professional": [
      { persona: "Corporate Executive", interpretation: "Formal, polished, business attire" },
      { persona: "Tech Startup Employee", interpretation: "Smart casual, authentic, collaborative" },
      { persona: "Creative Agency Worker", interpretation: "Stylish, expressive, portfolio-ready" },
      { persona: "Clinical Staff", interpretation: "Competent, clean, patient-focused" }
    ],
    "urgent": [
      { persona: "Emergency Room Doctor", interpretation: "Life-threatening, immediate action" },
      { persona: "Project Manager", interpretation: "Due by end of day, high priority" },
      { persona: "Marketing Team", interpretation: "Launch deadline approaching" },
      { persona: "HR Administrator", interpretation: "Respond within 24-48 hours" }
    ],
    "accessible": [
      { persona: "Web Developer", interpretation: "WCAG compliant, screen reader friendly" },
      { persona: "Facilities Manager", interpretation: "Wheelchair ramps, elevators, parking" },
      { persona: "Trainer", interpretation: "Plain language, multiple learning styles" },
      { persona: "Customer Service", interpretation: "Easy to find, multiple contact options" }
    ]
  };

  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Words Mean Different Things
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
          Use AI to explore how different people hear your words
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent/20 rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-accent" />
            Interactive Exercise
          </h2>
          <p className="text-foreground text-xl mb-8 leading-relaxed">
            Select a word to see how different people interpret it:
          </p>
          
          <div className="flex gap-4 mb-8 justify-center">
            {Object.keys(languageExamples).map((word) => (
              <Button
                key={word}
                onClick={() => setSelectedWord(word)}
                variant={selectedWord === word ? "default" : "outline"}
                size="lg"
                className="capitalize text-lg px-8 py-6"
              >
                "{word}"
              </Button>
            ))}
          </div>

          {selectedWord && (
            <div className="animate-fade-in grid md:grid-cols-2 gap-4">
              {languageExamples[selectedWord as keyof typeof languageExamples].map((example, idx) => (
                <div key={idx} className="bg-background/80 p-6 rounded-xl border-2 border-accent/30 shadow-md">
                  <p className="font-bold text-accent mb-3 text-lg">{example.persona}</p>
                  <p className="text-foreground text-lg leading-relaxed">"{example.interpretation}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-accent/10 border-2 border-accent/20 rounded-2xl p-8 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center flex-shrink-0 shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                The Annie Duke Study
              </h3>
              <p className="text-muted-foreground italic">Probability words have massive variability</p>
            </div>
          </div>

          <p className="text-foreground text-xl mb-6 leading-relaxed">
            Researcher Annie Duke asked people to assign percentages to probability words. 
            The results show just how differently we interpret the same language:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-2 border-foreground/20 rounded-lg overflow-hidden">
              <thead className="bg-primary/20">
                <tr>
                  <th className="p-4 text-left font-bold text-foreground">Word</th>
                  <th className="p-4 text-center font-bold text-foreground">Humans (Avg %)</th>
                  <th className="p-4 text-center font-bold text-destructive">Human Range</th>
                  <th className="p-4 text-center font-bold text-accent">ChatGPT 4o</th>
                  <th className="p-4 text-center font-bold text-secondary">Gemini</th>
                </tr>
              </thead>
              <tbody className="bg-background/60">
                <tr className="border-t-2 border-foreground/20">
                  <td className="p-4 font-semibold text-foreground">Slam dunk</td>
                  <td className="p-4 text-center text-foreground">90%</td>
                  <td className="p-4 text-center text-destructive font-bold">50% (50-100)</td>
                  <td className="p-4 text-center text-accent">85%</td>
                  <td className="p-4 text-center text-secondary">85%</td>
                </tr>
                <tr className="border-t border-foreground/10">
                  <td className="p-4 font-semibold text-foreground">Always</td>
                  <td className="p-4 text-center text-foreground">91%</td>
                  <td className="p-4 text-center text-destructive font-bold">50% (50-100)</td>
                  <td className="p-4 text-center text-accent">100%</td>
                  <td className="p-4 text-center text-secondary">100%</td>
                </tr>
                <tr className="border-t border-foreground/10">
                  <td className="p-4 font-semibold text-foreground">Never</td>
                  <td className="p-4 text-center text-foreground">9%</td>
                  <td className="p-4 text-center text-destructive font-bold">50% (0-50)</td>
                  <td className="p-4 text-center text-accent">0%</td>
                  <td className="p-4 text-center text-secondary">0%</td>
                </tr>
                <tr className="border-t border-foreground/10 bg-accent/5">
                  <td className="p-4 font-semibold text-foreground">Serious possibility</td>
                  <td className="p-4 text-center text-foreground">58%</td>
                  <td className="p-4 text-center text-destructive font-bold">50% (30-80)</td>
                  <td className="p-4 text-center text-accent">70%</td>
                  <td className="p-4 text-center text-secondary">50%</td>
                </tr>
                <tr className="border-t border-foreground/10">
                  <td className="p-4 font-semibold text-foreground">Rarely</td>
                  <td className="p-4 text-center text-foreground">16%</td>
                  <td className="p-4 text-center text-destructive font-bold">45% (5-50)</td>
                  <td className="p-4 text-center text-accent">15%</td>
                  <td className="p-4 text-center text-secondary">5%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-destructive/10 border-2 border-destructive/30 p-6 rounded-xl">
              <p className="font-bold text-destructive mb-3">👥 Between Humans</p>
              <p className="text-foreground text-lg">
                "Serious possibility" ranges from 30% to 80% — a <strong>50-point spread</strong> on the same words.
              </p>
            </div>

            <div className="bg-accent/10 border-2 border-accent/30 p-6 rounded-xl">
              <p className="font-bold text-accent mb-3">🤖 Between AI Models</p>
              <p className="text-foreground text-lg">
                ChatGPT says 70%, Gemini says 50% — a <strong>20-point difference</strong> for "serious possibility."
              </p>
            </div>
          </div>

          <p className="text-foreground text-xl mt-6 leading-relaxed">
            <strong>The key insight:</strong> Language is variable everywhere—between people, between AI models, 
            and between AI and humans. You can't assume shared understanding.
          </p>
        </div>

        <div className="bg-primary/10 border-l-4 border-primary rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            💡 The Takeaway: Use AI to See Different Perspectives
          </h3>
          <p className="text-foreground text-xl leading-relaxed mb-4">
            Don't try to write the perfect prompt. Instead, use AI to explore how different people 
            interpret the same language.
          </p>
          <p className="text-foreground text-xl leading-relaxed mb-4">
            Ask: <em>"How would a frontline nurse hear this versus a manager? What does 'serious possibility' 
            mean to someone risk-averse versus optimistic? Show me how different audiences might 
            interpret this message."</em>
          </p>
          <p className="text-muted-foreground text-lg italic">
            Your words will mean different things to different people—use AI to help you see those differences 
            before you send the message.
          </p>
        </div>
      </div>
    </div>
  );
};
