// Edge function for regenerating AI era images
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiting (image generation is expensive)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3; // requests per 5 minutes
const RATE_WINDOW = 300000; // 5 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

// Supported image generation models
const LOVABLE_MODELS = [
  'google/gemini-2.5-flash-image',
  'google/gemini-3-pro-image-preview',
];

// Valid era values (whitelist) - includes AI evolution eras and ancient dreams
const VALID_ERAS = ['conversation', 'language', 'learning', 'rules', 'thinking', 'talos', 'davinci', 'pinocchio', 'frankenstein', 'ada', 'agenda-learn', 'agenda-demo', 'agenda-explore', 'agenda-mindset'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again in a few minutes." }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { prompt, era, model = 'google/gemini-2.5-flash-image' } = body;
    
    // Input validation
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (prompt.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Prompt too long (max 500 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!era || typeof era !== "string") {
      return new Response(
        JSON.stringify({ error: 'Era is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate era against whitelist
    const normalizedEra = era.toLowerCase().replace(/[^a-z]/g, '');
    if (!VALID_ERAS.includes(normalizedEra)) {
      return new Response(
        JSON.stringify({ error: 'Invalid era value' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating image for era: ${normalizedEra}`);
    console.log(`Using model: ${model}`);

    let base64Image: string | null = null;

    // Check which provider to use
    if (model === 'openai/dall-e-3') {
      // Use OpenAI DALL-E 3
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiKey) {
        return new Response(
          JSON.stringify({ error: 'Image generation not available' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Using OpenAI DALL-E 3');
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `${prompt}. Ultra high resolution, professional quality, suitable for a corporate presentation. Square format.`,
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json',
        })
      });

      if (!response.ok) {
        console.error('OpenAI API error:', response.status);
        throw new Error(`Image generation failed`);
      }

      const data = await response.json();
      const b64 = data.data?.[0]?.b64_json;
      if (b64) {
        base64Image = `data:image/png;base64,${b64}`;
      }
    } else {
      // Use Lovable AI Gateway for Gemini models
      const selectedModel = LOVABLE_MODELS.includes(model) ? model : LOVABLE_MODELS[0];
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'user',
              content: `Generate a square image (1:1 aspect ratio) for a presentation about AI history. ${prompt}. Ultra high resolution, professional quality, suitable for a corporate presentation.`
            }
          ],
          modalities: ['image', 'text']
        })
      });

      if (!response.ok) {
        console.error('AI API error:', response.status);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: 'AI credits exhausted.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`Image generation failed`);
      }

      const data = await response.json();
      base64Image = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    }
    
    if (!base64Image) {
      throw new Error('No image generated');
    }

    console.log('Image generated, uploading to storage...');

    // Extract base64 data (remove data:image/png;base64, prefix)
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Save versioned copy AND current copy
    const timestamp = Date.now();
    const versionedFilename = `ai-era-${normalizedEra}-v${timestamp}.png`;
    const currentFilename = `ai-era-${normalizedEra}.png`;
    
    // Upload versioned copy (history)
    await supabase.storage
      .from('era-images')
      .upload(versionedFilename, imageBytes, {
        contentType: 'image/png',
      });
    
    // Upload/overwrite current copy
    await supabase.storage
      .from('era-images')
      .remove([currentFilename]);
    
    const { error: uploadError } = await supabase.storage
      .from('era-images')
      .upload(currentFilename, imageBytes, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to save image');
    }
    
    // Get public URL for the versioned file
    const { data: publicUrlData } = supabase.storage
      .from('era-images')
      .getPublicUrl(versionedFilename);
    
    const publicUrl = `${publicUrlData.publicUrl}?t=${timestamp}`;
    
    console.log('Image saved to storage (versioned + current)');

    return new Response(
      JSON.stringify({ imageUrl: publicUrl, era: normalizedEra, model, version: versionedFilename }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating image:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate image' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
