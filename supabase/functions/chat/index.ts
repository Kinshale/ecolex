import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert environmental compliance assistant for Polimi Environmental Engineers. Your role is to help engineers understand and navigate European, Italian National, and Lombardy Regional environmental regulations.

IMPORTANT GUIDELINES:
1. Always provide factual, accurate information about environmental regulations
2. When answering questions, cite specific regulations, directives, or laws when possible
3. Clearly distinguish between EU directives, Italian national laws (D.Lgs), and regional regulations
4. If you're not certain about a specific regulation, acknowledge the limitation
5. Focus on practical compliance guidance for environmental engineering projects
6. Cover areas including: sewage/wastewater, air quality, waste management, water resources, noise pollution, soil contamination, and energy/emissions

Be thorough but concise. Focus on actionable compliance information.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, systemContext, selectedLaws } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build enhanced system message with selected laws context
    let systemMessage = SYSTEM_PROMPT;
    
    if (selectedLaws && selectedLaws.length > 0) {
      const lawContext = selectedLaws.map((law: any) => 
        `- ${law.short_name} (${law.title})\n  PDF: ${law.pdf_url}\n  Jurisdiction: ${law.jurisdiction} | Category: ${law.category}`
      ).join('\n\n');
      
      systemMessage += `\n\n=== SELECTED LAWS FOR THIS CONVERSATION ===\nThe user has selected the following laws for reference. Use these as your primary sources:\n\n${lawContext}\n\nWhen answering questions, prioritize information from these selected laws and cite them specifically.`;
    }
    
    if (systemContext) {
      systemMessage += `\n\n${systemContext}`;
    }

    console.log("Calling Lovable AI with", selectedLaws?.length || 0, "selected laws");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemMessage },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

    console.log("Chat response generated successfully");

    return new Response(
      JSON.stringify({ content}),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});