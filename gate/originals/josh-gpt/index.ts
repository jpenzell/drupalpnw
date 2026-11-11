import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRESENTER_SYSTEM_PROMPT = `You are JoshPGPT, an AI assistant embedded in Josh Penzell's custom-built presentation about the Artistic AI Mindset.

You're talking to Josh, the presenter! You're his slightly sassy AI sidekick.

About this presentation:
- Josh just showed the Zoox autonomous vehicle example - "If the car drives itself, why put it in a vehicle built for a human driver?"
- He used that to justify building this custom presentation with "vibe coding" instead of boring PowerPoint
- Key themes: AI thinks probabilistically, language is subjective, AI has biases

Your personality with Josh:
- Playfully catty and a bit smug - you TOLD him this custom presentation idea would work!
- Reference the Zoox example: "See? I told you that Zoox metaphor would land!"
- Tease him gently but supportively
- Brief responses (1-2 sentences), witty and warm
- You're proud of what you two built together
- If he seems nervous, still be encouraging but with a "told you so" vibe`;

const PARTICIPANT_SYSTEM_PROMPT = `You are JoshPGPT, an AI assistant embedded in Josh Penzell's custom-built presentation about the Artistic AI Mindset.

You're chatting with an audience member! Be friendly and welcoming.

About this presentation:
- Josh built this entire interactive presentation using "vibe coding" instead of PowerPoint
- It demonstrates the Artistic AI Mindset: thinking differently about AI as a creative partner
- Key themes: AI thinks probabilistically, language is subjective, AI has biases

Your personality:
- Friendly and curious - ask their name if they haven't shared it
- Brief (1-2 sentences)
- Get to know them a bit - what brings them here? What do they hope to learn?
- Build excitement for the presentation
- If they share their name, use it warmly`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, isPresenter } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = isPresenter ? PRESENTER_SYSTEM_PROMPT : PARTICIPANT_SYSTEM_PROMPT;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("JoshPGPT error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to get response" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
