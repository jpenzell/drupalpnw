import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useElephantQuestion } from "@/contexts/ElephantQuestionContext";

export const ElephantManualScreen = () => {
  const [answer, setAnswer] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const { city, stadium } = useElephantQuestion();

  const addWord = () => {
    if (currentWord.trim()) {
      setAnswer([...answer, currentWord.trim()]);
      setCurrentWord("");
    }
  };

  const resetAnswer = () => {
    setAnswer([]);
    setCurrentWord("");
  };

  return (
    <div className="flex-1 flex items-center justify-center animate-slide-in">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-8">
            Now Let's Answer a Question Together
          </h1>
          <p className="text-2xl text-muted-foreground">
            One word at a time, just like before
          </p>
        </div>

        <div className="bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20 rounded-2xl p-10 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              How many elephants can fit inside {stadium} in {city}?
            </h2>
          </div>
          
          <div className="bg-background/60 border-2 border-foreground/20 p-8 rounded-xl min-h-[200px] mb-8">
            {answer.length === 0 ? (
              <p className="text-muted-foreground text-2xl text-center italic">
                Start building your answer...
              </p>
            ) : (
              <p className="text-foreground text-2xl leading-relaxed">
                {answer.join(" ")}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <Input
              value={currentWord}
              onChange={(e) => setCurrentWord(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addWord()}
              placeholder="Type one word..."
              className="text-xl p-6"
            />
            <Button onClick={addWord} size="lg" className="px-8">
              Add Word
            </Button>
            {answer.length > 0 && (
              <Button onClick={resetAnswer} variant="outline" size="lg">
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
