import { Brain, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const NumberPickerScreen = () => {
  const [aiNumber, setAiNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState<string[]>([]);
  const { toast } = useToast();

  const askAI = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pick-number', {
        body: {
          prompt: "Pick a number at random from 1-50"
        }
      });

      if (error) throw error;

      const response = data.response.trim();
      setAiNumber(response);
      setAttempts(prev => [...prev, response]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-in">
      <div className="max-w-5xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            But AI Is <span className="text-accent">NOT</span> Human
          </h1>
          <p className="text-xl text-muted-foreground">
            It doesn't think—it <span className="font-semibold text-foreground">predicts patterns</span>
          </p>
        </div>

        {/* Demo Card */}
        <div className="bg-accent/5 border-2 border-accent/20 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <p className="text-xl font-bold text-foreground">
              "Pick a random number from 1–50"
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              onClick={askAI}
              disabled={isLoading}
              size="lg"
              className="text-lg px-6 py-5"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Asking...
                </>
              ) : attempts.length > 0 ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Ask Again
                </>
              ) : (
                "Ask AI"
              )}
            </Button>

            {aiNumber && (
              <div className="bg-primary/20 border-2 border-primary rounded-xl px-6 py-3 animate-scale-in">
                <span className="text-4xl font-black text-primary">{aiNumber}</span>
              </div>
            )}

            {attempts.length > 1 && (
              <div className="flex items-center gap-2 ml-4">
                <span className="text-muted-foreground text-sm">History:</span>
                {attempts.slice(0, -1).map((num, idx) => (
                  <span
                    key={idx}
                    className="text-lg font-bold text-primary/60 bg-primary/10 px-2 py-1 rounded-lg"
                  >
                    {num}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Insight */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-primary/10 border-2 border-primary/20 p-5 rounded-xl">
            <p className="text-base font-semibold text-primary mb-1">🧠 Humans</p>
            <p className="text-lg text-foreground">
              Spread across the range with genuine randomness
            </p>
          </div>

          <div className="bg-accent/10 border-2 border-accent/20 p-5 rounded-xl">
            <p className="text-base font-semibold text-accent mb-1">🤖 AI</p>
            <p className="text-lg text-foreground">
              Picks 27, 37, 42—the most "random-feeling" in its training
            </p>
          </div>
        </div>

        {/* Punchline */}
        <div className="text-center">
          <p className="text-xl text-foreground">
            AI mimics <span className="font-bold text-accent">the pattern of randomness</span>, not randomness itself.
          </p>
        </div>
      </div>
    </div>
  );
};
