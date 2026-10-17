import { Brain } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const LanguageExerciseScreen = () => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const probabilityWords = {
    "always": [
      { persona: "Compliance Officer", interpretation: "100% - No exceptions ever" },
      { persona: "Project Manager", interpretation: "95% - Standard operating procedure" },
      { persona: "Nurse Manager", interpretation: "90% - Strong expectation with rare flexibility" },
      { persona: "HR Director", interpretation: "85% - Policy with documented exceptions" }
    ],
    "serious possibility": [
      { persona: "Risk Manager", interpretation: "70% - Needs immediate mitigation plan" },
      { persona: "Operations Lead", interpretation: "50% - Could happen, monitor closely" },
      { persona: "Executive", interpretation: "40% - Worth discussing in planning" },
      { persona: "Frontline Staff", interpretation: "30% - Unlikely but keep in mind" }
    ],
    "rarely": [
      { persona: "Quality Auditor", interpretation: "5% - Exceptional cases only" },
      { persona: "Department Head", interpretation: "15% - Happens occasionally" },
      { persona: "Team Lead", interpretation: "25% - Not common but not shocking" },
      { persona: "New Employee", interpretation: "40% - Seems to happen fairly often" }
    ]
  };

  return (
    <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Quick Exercise
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
          What percentage does each word mean to you?
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent/20 rounded-2xl p-10 shadow-xl">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Different Roles, Different Numbers
              </h2>
              <p className="text-muted-foreground text-lg italic">Select a word to see interpretations</p>
            </div>
          </div>
          
          <div className="flex gap-4 mb-8 justify-center flex-wrap">
            {Object.keys(probabilityWords).map((word) => (
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
              {probabilityWords[selectedWord as keyof typeof probabilityWords].map((example, idx) => (
                <div key={idx} className="bg-background/80 p-6 rounded-xl border-2 border-accent/30 shadow-md">
                  <p className="font-bold text-accent mb-3 text-lg">{example.persona}</p>
                  <p className="text-foreground text-lg leading-relaxed">"{example.interpretation}"</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
