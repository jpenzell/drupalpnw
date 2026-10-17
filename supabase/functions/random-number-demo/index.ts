import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiting (this is an expensive function)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // requests per 5 minutes
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

const PROMPT = "Pick a random number between 1 and 100. Just respond with the number, nothing else.";

interface ModelResult {
  model: string;
  displayName: string;
  number: number | null;
  rawResponse: string;
  error?: string;
}

// Call OpenAI/Google models via Lovable AI Gateway
async function callLovableAI(
  apiKey: string,
  model: string,
  displayName: string
): Promise<ModelResult> {
  try {
    console.log(`Calling ${displayName} via Lovable AI...`);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: PROMPT }],
        temperature: 1.0,
      }),
    });

    if (!response.ok) {
      console.error(`${displayName} error:`, response.status);
      return {
        model,
        displayName,
        number: null,
        rawResponse: "",
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const rawResponse = data.choices[0]?.message?.content || "";
    const match = rawResponse.match(/\d+/);
    const number = match ? parseInt(match[0], 10) : null;
    
    console.log(`${displayName} responded: ${number}`);
    
    return { model, displayName, number, rawResponse };
  } catch (error) {
    console.error(`${displayName} error:`, error);
    return {
      model,
      displayName,
      number: null,
      rawResponse: "",
      error: "Request failed",
    };
  }
}

// Call Anthropic Claude directly
async function callAnthropic(
  apiKey: string,
  displayName: string
): Promise<ModelResult> {
  const model = "claude-sonnet-4-20250514";
  try {
    console.log(`Calling ${displayName} via Anthropic API...`);
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 100,
        messages: [{ role: "user", content: PROMPT }],
      }),
    });

    if (!response.ok) {
      console.error(`${displayName} error:`, response.status);
      return {
        model,
        displayName,
        number: null,
        rawResponse: "",
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const rawResponse = data.content?.[0]?.text || "";
    const match = rawResponse.match(/\d+/);
    const number = match ? parseInt(match[0], 10) : null;
    
    console.log(`${displayName} responded: ${number}`);
    
    return { model, displayName, number, rawResponse };
  } catch (error) {
    console.error(`${displayName} error:`, error);
    return {
      model,
      displayName,
      number: null,
      rawResponse: "",
      error: "Request failed",
    };
  }
}

// Call Perplexity API
async function callPerplexity(
  apiKey: string,
  displayName: string
): Promise<ModelResult> {
  const model = "sonar";
  try {
    console.log(`Calling ${displayName} via Perplexity API...`);
    
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: PROMPT }],
      }),
    });

    if (!response.ok) {
      console.error(`${displayName} error:`, response.status);
      return {
        model,
        displayName,
        number: null,
        rawResponse: "",
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const rawResponse = data.choices?.[0]?.message?.content || "";
    const match = rawResponse.match(/\d+/);
    const number = match ? parseInt(match[0], 10) : null;
    
    console.log(`${displayName} responded: ${number}`);
    
    return { model, displayName, number, rawResponse };
  } catch (error) {
    console.error(`${displayName} error:`, error);
    return {
      model,
      displayName,
      number: null,
      rawResponse: "",
      error: "Request failed",
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again in a few minutes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("Configuration error");
    }

    console.log("Calling all models in parallel...");
    
    // Build array of promises based on available API keys
    const promises: Promise<ModelResult>[] = [
      callLovableAI(LOVABLE_API_KEY, "openai/gpt-5", "GPT-5"),
      callLovableAI(LOVABLE_API_KEY, "google/gemini-2.5-pro", "Gemini Pro"),
    ];
    
    if (ANTHROPIC_API_KEY) {
      promises.push(callAnthropic(ANTHROPIC_API_KEY, "Claude"));
    }
    
    if (PERPLEXITY_API_KEY) {
      promises.push(callPerplexity(PERPLEXITY_API_KEY, "Perplexity"));
    }

    const results = await Promise.all(promises);

    // Calculate statistics
    const validNumbers = results.filter((r) => r.number !== null).map((r) => r.number as number);
    const avg = validNumbers.length > 0 
      ? Math.round(validNumbers.reduce((a, b) => a + b, 0) / validNumbers.length) 
      : null;
    const range = validNumbers.length > 0 
      ? Math.max(...validNumbers) - Math.min(...validNumbers) 
      : null;

    console.log("Stats - Average:", avg, "Range:", range);

    return new Response(
      JSON.stringify({
        results,
        stats: {
          average: avg,
          range,
          count: validNumbers.length,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in random-number-demo:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});