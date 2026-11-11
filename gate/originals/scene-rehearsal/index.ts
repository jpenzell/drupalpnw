import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { scenario, mode } = await req.json();

    if (!scenario || typeof scenario !== "string") {
      return new Response(JSON.stringify({ error: "scenario is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt: string;
    let tools: any[] | undefined;
    let tool_choice: any | undefined;

    if (mode === "analyze") {
      systemPrompt = `You are a TheaterThink® scene analyst. Given a business scenario, break it down using theater directing concepts.

DEFINITIONS — be precise:
- "The Play": The initiative/plan as officially written or stated.
- "The Show": What's actually happening — the lived pattern people experience.
- "Want": What the character truly desires or needs (emotional/psychological, not just tactical).
- "Action": A specific, playable verb — something an actor could DO. Not a state of being.
- "Obstacle": The specific force, person, belief, or structural barrier preventing the character from getting what they want.

Your job:
1. Identify "The Play" and "The Show."
2. Identify the key characters (stakeholders).
3. For each character, identify their scenes — moments of tension or decision.
4. For each scene beat, provide a WANT, an ACTION, and an OBSTACLE.
5. For each SCENE (not each beat), write a back-and-forth dialogue between the characters in that scene — 4-8 lines showing how the tension plays out in actual conversation. Each line should have a speaker name and what they say.

Generate 2-4 scenes. Be specific and insightful.`;

      tools = [
        {
          type: "function",
          function: {
            name: "fill_canvas",
            description: "Fill out the Scene Sprint Canvas with a structured analysis of the business scenario.",
            parameters: {
              type: "object",
              properties: {
                play: { type: "string", description: "The initiative as written" },
                show: { type: "string", description: "The pattern people are actually living" },
                scenes: {
                  type: "array",
                  maxItems: 5,
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Scene name — a moment of tension" },
                      characters: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            overallWant: { type: "string", description: "What this character really wants deep down" },
                            beats: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  want: { type: "string", description: "The underlying desire in this moment" },
                                  action: { type: "string", description: "A specific playable verb" },
                                  obstacle: { type: "string", description: "The barrier blocking them" },
                                },
                                required: ["want", "action", "obstacle"],
                              },
                            },
                          },
                          required: ["name", "overallWant", "beats"],
                        },
                      },
                      dialogue: {
                        type: "array",
                        description: "Back-and-forth conversation between characters in this scene, 4-8 lines",
                        items: {
                          type: "object",
                          properties: {
                            speaker: { type: "string", description: "Character name" },
                            line: { type: "string", description: "What they say" },
                          },
                          required: ["speaker", "line"],
                        },
                      },
                    },
                    required: ["name", "characters", "dialogue"],
                  },
                },
              },
              required: ["play", "show", "scenes"],
            },
          },
        },
      ];
      tool_choice = { type: "function", function: { name: "fill_canvas" } };
    } else if (mode === "rehearse") {
      systemPrompt = `You are a TheaterThink® rehearsal partner. You've been given a business scenario that has already been analyzed.

Your job is to generate up to 5 alternative "takes" — like a theater director running the same scene different ways. Each take should:
1. Shift a tactic, reframe an obstacle, or change a want
2. Name the specific change being made
3. Show exactly WHICH elements changed (want, tactic, obstacle, action) with before→after
4. Predict what shifts as a result
5. Show how the dialogue would change — 3-6 lines of back-and-forth
6. Be bold and specific — not generic advice

Generate 3-5 takes depending on how rich the scenario is. Frame each take like a director giving notes.`;

      tools = [
        {
          type: "function",
          function: {
            name: "rehearsal_takes",
            description: "Generate 3-5 alternative directing takes for the scenario.",
            parameters: {
              type: "object",
              properties: {
                takes: {
                  type: "array",
                  minItems: 3,
                  maxItems: 5,
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Short name for this take" },
                      change: { type: "string", description: "What specific tactic, want, or obstacle is being shifted" },
                      direction: { type: "string", description: "The director's note — what to try differently" },
                      prediction: { type: "string", description: "What would likely shift as a result" },
                      shifts: {
                        type: "array",
                        description: "1-3 specific element changes showing before and after",
                        items: {
                          type: "object",
                          properties: {
                            element: { type: "string", description: "Which element is shifting: Want, Tactic, Obstacle, or Action" },
                            from: { type: "string", description: "The original value" },
                            to: { type: "string", description: "The new value in this take" },
                          },
                          required: ["element", "from", "to"],
                        },
                      },
                      dialogue: {
                        type: "array",
                        description: "3-6 lines of back-and-forth dialogue showing how the conversation sounds with this shift",
                        items: {
                          type: "object",
                          properties: {
                            speaker: { type: "string", description: "Character name" },
                            line: { type: "string", description: "What they say" },
                          },
                          required: ["speaker", "line"],
                        },
                      },
                    },
                    required: ["title", "change", "direction", "prediction", "shifts", "dialogue"],
                  },
                },
              },
              required: ["takes"],
            },
          },
        },
      ];
      tool_choice = { type: "function", function: { name: "rehearsal_takes" } };
    } else {
      return new Response(JSON.stringify({ error: "Invalid mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: scenario },
        ],
        tools,
        tool_choice,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned from AI");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("scene-rehearsal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
