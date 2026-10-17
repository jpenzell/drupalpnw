import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/contexts/SessionContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AVAILABLE_MODELS = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", shortLabel: "Gemini Flash" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", shortLabel: "Gemini Lite" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", shortLabel: "Gemini Pro" },
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash Preview", shortLabel: "Gemini 3" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini", shortLabel: "GPT-5 Mini" },
  { value: "openai/gpt-5-nano", label: "GPT-5 Nano", shortLabel: "GPT-5 Nano" },
];

export const AIStoryDemoScreen = () => {
  const [aiStory, setAiStory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [usedModel, setUsedModel] = useState("");
  const { toast } = useToast();
  const { isPresenter } = useSession();

  const generateAIStory = async () => {
    setIsGenerating(true);
    setAiStory("");
    
    const fullPrompt = `Write me a story. Keep it very short - 2-3 sentences, under 40 words.`;
    
    try {
      const response = await supabase.functions.invoke('test-prompt', {
        body: { 
          prompt: fullPrompt,
          context: "You are a creative storyteller. Write engaging stories. Be creative and surprising. Start the story immediately, don't repeat the prompt.",
          model: selectedModel
        }
      });

      if (response.error) throw response.error;

      // Store which model was used
      setUsedModel(response.data.model || selectedModel);

      // Simulate token-by-token generation for visual effect
      const fullText = response.data.response || "";
      let currentIndex = 0;
      
      const intervalId = setInterval(() => {
        if (currentIndex < fullText.length) {
          setAiStory(fullText.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(intervalId);
          setIsGenerating(false);
        }
      }, 40);

    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI story. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const resetDemo = () => {
    setAiStory("");
    setUsedModel("");
  };

  const getModelLabel = (value: string) => {
    return AVAILABLE_MODELS.find(m => m.value === value)?.shortLabel || value;
  };

  return (
    <div className="flex-1 flex items-center justify-center animate-slide-in">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Now Let's See How AI Does It
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light max-w-3xl mx-auto">
            Same prompt. Watch what happens.
          </p>
        </div>

        {/* Show the prompt */}
        <div className="bg-secondary/10 border-2 border-secondary/30 rounded-2xl p-5 mb-6">
          <p className="text-xl text-center text-foreground">
            <span className="text-muted-foreground">Prompt:</span> "<strong className="text-secondary">Write me a story</strong>"
          </p>
        </div>

        <div className="bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20 rounded-2xl p-8 shadow-lg min-h-[220px]">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-accent">AI's Story</h3>
              {usedModel && !isGenerating && (
                <span className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                  {getModelLabel(usedModel)}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* Model selector */}
              <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isGenerating}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isPresenter && (
                <Button 
                  onClick={resetDemo} 
                  variant="outline"
                  size="default"
                  className="gap-2"
                  disabled={isGenerating}
                >
                  <RotateCcw className="h-4 w-4" />
                  Restart
                </Button>
              )}
              
              <Button 
                onClick={generateAIStory} 
                disabled={isGenerating}
                size="default"
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Writing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {aiStory ? "Try Again" : "Generate Story"}
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {aiStory ? (
            <p className="text-foreground text-2xl md:text-3xl leading-relaxed">
              {aiStory}
              {isGenerating && <span className="animate-pulse text-accent">▌</span>}
            </p>
          ) : (
            <p className="text-muted-foreground italic text-xl">
              Select a model and click "Generate Story" to see AI write...
            </p>
          )}
        </div>

        {/* Observation prompt - no reveal yet */}
        {aiStory && !isGenerating && (
          <div className="text-center mt-6 animate-fade-in">
            <p className="text-lg text-muted-foreground">
              Notice anything familiar about how the words appeared?
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
