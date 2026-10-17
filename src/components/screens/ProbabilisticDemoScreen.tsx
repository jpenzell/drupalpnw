import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePresentationMode } from "@/contexts/PresentationModeContext";

const modeContent = {
  wine: {
    defaultQuestion: "What was discussed in our leadership team's last strategy meeting?",
    activityExamples: [
      "Wrong pricing shared with key accounts",
      "Compliance violations in distributor communications",
      "Damaged trust with retail partners",
      "Liability from incorrect product claims",
    ],
    problemText: "your company's actual internal policies",
  },
  educator: {
    defaultQuestion: "What was decided in our last IEP meeting for the Smith family?",
    activityExamples: [
      "Wrong information shared with parents",
      "Policy violations in student support",
      "Damaged trust in school systems",
      "Liability from incorrect academic guidance",
    ],
    problemText: "your school's actual student records or meeting notes",
  },
};

export const ProbabilisticDemoScreen = () => {
  const mode = "wine" as const;
  const content = modeContent[mode];
  
  const [question, setQuestion] = useState(content.defaultQuestion);
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const askAI = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    setResponse("");

    try {
      const { data, error } = await supabase.functions.invoke('presentation-ai-assistant', {
        body: { 
          message: question,
          context: "Answer this question as if you know the company's policies, even if you don't have specific information."
        }
      });

      if (error) throw error;
      setResponse(data.response);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col animate-slide-in p-8">
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
          The Probabilistic Paradox
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground font-light">
          Ask AI something it can't possibly know—but will confidently answer anyway
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column - Interactive Demo */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Try asking about something unknowable:
            </h3>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px] text-base mb-4"
              placeholder="Ask something AI couldn't possibly know..."
            />
            <Button 
              onClick={askAI} 
              disabled={isLoading}
              size="lg"
              className="gap-2 w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Asking AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Ask AI
                </>
              )}
            </Button>
          </div>

          <div className="bg-accent/10 border-2 border-accent/20 rounded-xl p-6 flex-1">
            <h3 className="text-lg font-bold text-accent mb-3 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Activity: What Would Break?
            </h3>
            <p className="text-foreground mb-4 leading-relaxed">
              Write on sticky notes or discuss: What risks emerge from confident errors?
            </p>
            <ul className="space-y-2 text-muted-foreground text-sm">
              {content.activityExamples.map((example, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column - Response Display */}
        <div className="flex flex-col">
          {response ? (
            <div className="bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-6 shadow-lg animate-fade-in h-full flex flex-col">
              <h3 className="text-xl font-bold text-destructive mb-4">AI's "Confident" Response:</h3>
              <div className="flex-1 overflow-auto mb-4">
                <p className="text-foreground leading-relaxed">
                  {response}
                </p>
              </div>
              <div className="bg-background/80 p-5 rounded-xl border border-destructive/20">
                <p className="text-foreground font-semibold mb-2">⚠️ The Problem:</p>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  The AI generated a plausible-sounding answer even though it has no access to 
                  {content.problemText}. It predicted likely words based on patterns—
                  not facts. This is hallucination in action.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 border-2 border-dashed border-muted-foreground/30 rounded-2xl p-8 h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <Sparkles className="h-16 w-16 text-muted-foreground/50 mx-auto" />
                <p className="text-muted-foreground text-lg">
                  Ask a question to see AI's response
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
