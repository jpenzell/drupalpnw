import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EFFECT_PROMPTS: Record<string, string> = {
  cartoon: "Transform this photo into a colorful cartoon style illustration, exaggerated features, bold outlines, vibrant colors",
  pixar: "Transform this photo into a Pixar-style 3D animated character, friendly and expressive",
  anime: "Transform this photo into an anime style portrait, large expressive eyes, stylized hair",
  oil_painting: "Transform this photo into a classic oil painting style, rich textures and brush strokes",
  pop_art: "Transform this photo into Andy Warhol style pop art, bold colors, halftone dots",
  sketch: "Transform this photo into a detailed pencil sketch, artistic shading and lines",
  renaissance: "Transform this photo into a Renaissance painting style portrait, dramatic lighting, classical composition",
  superhero: "Transform this photo into a comic book superhero portrait, dramatic pose, cape optional",
  wine_sommelier: "Transform this photo to show the person as an elegant wine sommelier, holding a wine glass, sophisticated attire",
  vineyard_worker: "Transform this photo to show the person in a beautiful vineyard at sunset, wearing casual vineyard attire",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, effect } = await req.json();
    
    if (!imageUrl || !effect) {
      return new Response(
        JSON.stringify({ error: "Missing imageUrl or effect" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = EFFECT_PROMPTS[effect];
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Invalid effect" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Applying ${effect} effect to image...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      })
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
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI gateway response structure:", JSON.stringify(data?.choices?.[0]?.message ? {
      content: typeof data.choices[0].message.content,
      hasImages: !!data.choices[0].message.images,
      imageCount: data.choices[0].message.images?.length,
      keys: Object.keys(data.choices[0].message),
    } : { raw: JSON.stringify(data).slice(0, 500) }));
    
    // Try multiple possible response structures
    const generatedImage = 
      data.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
      data.choices?.[0]?.message?.images?.[0]?.url ||
      data.images?.[0]?.url ||
      data.data?.[0]?.url ||
      data.data?.[0]?.b64_json;

    if (!generatedImage) {
      console.error("Full response (truncated):", JSON.stringify(data).slice(0, 1000));
      throw new Error("No image generated");
    }

    return new Response(
      JSON.stringify({ 
        imageUrl: generatedImage,
        effect 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Transform image error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to transform image" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
