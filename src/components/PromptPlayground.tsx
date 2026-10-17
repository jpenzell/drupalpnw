import { useState } from "react";
import { Sparkles, Play, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const PromptPlayground = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTest = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      const { data, error } = await supabase.functions.invoke("test-prompt", {
        body: {
          prompt: prompt,
          context: "You are a helpful AI assistant for HR in healthcare. Be clear, practical, and professional.",
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Failed to get response");
      }

      setResponse(data.response);
      toast.success("Response generated!");
    } catch (error: any) {
      console.error("Error testing prompt:", error);
      
      if (error.message?.includes("Rate limit")) {
        toast.error("Too many requests. Please wait a moment and try again.");
      } else {
        toast.error("Failed to test prompt. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    toast.success("Response copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-2 border-accent/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">Prompt Playground</h3>
          <p className="text-muted-foreground">Test your prompts live with AI</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">Your Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Try: 'Explain the efficiency paradox in 3 bullet points' or 'Draft a return-to-work memo for clinic staff'"
            className="min-h-[300px] font-mono text-sm"
          />
          <Button
            onClick={handleTest}
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-accent to-primary"
            size="lg"
          >
            {isLoading ? (
              <>
                <span className="animate-pulse">Testing...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Test Prompt
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">AI Response</label>
            {response && (
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="min-h-[300px] p-4 bg-background/80 rounded-lg border border-border">
            {response ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{response}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-1">
                      <span className="text-2xl animate-bounce">●</span>
                      <span className="text-2xl animate-bounce" style={{ animationDelay: "0.1s" }}>
                        ●
                      </span>
                      <span className="text-2xl animate-bounce" style={{ animationDelay: "0.2s" }}>
                        ●
                      </span>
                    </div>
                    <span>Generating response...</span>
                  </div>
                ) : (
                  "Test a prompt to see the response here"
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Notice how changing your wording affects the output. 
          This is <strong className="text-primary">Conversational Curiosity (Viewpoint B)</strong> in action—iterate to refine!
        </p>
      </div>
    </Card>
  );
};
