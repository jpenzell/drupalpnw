import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Password hash stored server-side (SHA-256 hash of the actual password)
// This prevents the password from being visible in client-side code
const PASSWORD_HASH = "a1b2c3d4e5f6"; // Placeholder - will be replaced with actual hash check

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();

    // Input validation
    if (!password || typeof password !== "string") {
      return new Response(
        JSON.stringify({ valid: false, error: "Password required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password.length > 100) {
      return new Response(
        JSON.stringify({ valid: false, error: "Password too long" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the expected password from environment
    const expectedPassword = Deno.env.get("PRESENTATION_PASSWORD");
    
    if (!expectedPassword) {
      console.error("PRESENTATION_PASSWORD not configured");
      return new Response(
        JSON.stringify({ valid: false, error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Constant-time comparison to prevent timing attacks
    const encoder = new TextEncoder();
    const a = encoder.encode(password);
    const b = encoder.encode(expectedPassword);
    
    let valid = a.length === b.length;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] !== b[i]) valid = false;
    }

    // Generate a session token if valid
    if (valid) {
      const token = crypto.randomUUID();
      return new Response(
        JSON.stringify({ valid: true, token }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ valid: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in verify-password:", error);
    return new Response(
      JSON.stringify({ valid: false, error: "Invalid request" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
