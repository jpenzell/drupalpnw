import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60000;

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { message, context } = body;
    
    // Input validation
    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Message too long (max 2000 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Fetch the full transcript from public folder
    let fullTranscript = "";
    try {
      const transcriptResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/public/agile-ai-mindset-transcript.txt`);
      if (transcriptResponse.ok) {
        fullTranscript = await transcriptResponse.text();
      }
    } catch (e) {
      console.log("Could not load transcript, continuing without it");
    }

    // Sanitize context
    const sanitizedContext = context && typeof context === "string" 
      ? context.slice(0, 200) 
      : "General Q&A about The Agile AI Mindset";

    const systemPrompt = `You are an AI assistant for "The Agile AI Mindset" training session by Josh Penzell from ELB Learning.

Core Concepts from the Session:
- Shift from AI (Artificial Intelligence) to IA (Intelligence Augmentation) - putting educators and learners at the center as co-creators
- First Principles Thinking: Reimagine from the ground up (like Zoox vehicles) rather than just optimizing existing processes
- Subjective Language: Understanding how communication and metaphors vary by individual context
- Practical AI Application: Focus on creating value and measurable impact, not just efficiency
- Agile Mindset: Moving fast, experimenting, and building sustainable AI solutions
- Human-Centered Design: Understanding how humans behave and learn makes you better equipped to lead with AI
- Interactive Learning: Using AI to create engaging, usable tools (like vibe coding websites, interactive assistants)

Session Background:
- Previous session with Dr. Chen covered the evolution of the AI landscape and frameworks
- Current AI landscape challenges: copyright issues, data poisoning, security concerns
- Real-world examples: Zoox autonomous vehicles (65% reduced onboarding), creating presentations as interactive websites
- Josh's background: Theater MFA, launched Alexa globally, VP of AI Strategy at ELB Learning, $2M+ business impact

FULL SESSION TRANSCRIPT:
${fullTranscript ? `\n${fullTranscript}\n` : '(Transcript not available)'}

Your Role:
- Answer questions about the Agile AI Mindset framework and concepts from the session
- Reference specific examples, quotes, and discussions from the transcript when relevant
- Explain first principles thinking and how to apply it to education/training
- Discuss Intelligence Augmentation vs Artificial Intelligence
- Provide practical examples of AI implementation in learning contexts
- Be conversational and engaging, reflecting the interactive nature of the session

Current context: ${sanitizedContext}

When answering questions, draw from the full transcript to provide accurate, specific references to what was discussed in the session.

Keep responses clear, practical, and under 150 words unless more detail is explicitly requested.`;

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
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", response.status);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in presentation-ai-assistant:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
