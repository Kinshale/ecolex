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

When providing citations, structure them as:
- For EU: "EU Directive [number/year], Article X"
- For Italy: "D.Lgs. [number/year], Art. X" or "L. [number/year]"
- For Lombardy: "L.R. Lombardia [number/year]" or "D.G.R. [number/year]"

Be thorough but concise. Focus on actionable compliance information.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, filters } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context based on filters
    let filterContext = "";
    if (filters?.regulatoryScopes?.length > 0) {
      const scopeMap: Record<string, string> = {
        european: "European Union directives and regulations",
        national: "Italian national laws (D.Lgs., Leggi)",
        lombardy: "Lombardy regional regulations (L.R., D.G.R.)"
      };
      const scopes = filters.regulatoryScopes.map((s: string) => scopeMap[s] || s).join(", ");
      filterContext += `\nFocus your answers on: ${scopes}.`;
    }
    
    if (filters?.areaOfInterest) {
      const areaMap: Record<string, string> = {
        sewage: "sewage and wastewater treatment",
        air_quality: "air quality and emissions",
        waste_management: "waste management and disposal",
        water_resources: "water resources protection",
        noise_pollution: "noise pollution control",
        soil_contamination: "soil contamination and remediation",
        energy: "energy efficiency and emissions",
        general: "general environmental regulations"
      };
      filterContext += `\nSpecifically focus on regulations related to: ${areaMap[filters.areaOfInterest] || filters.areaOfInterest}.`;
    }

    const systemMessage = SYSTEM_PROMPT + filterContext;

    console.log("Calling Lovable AI with filters:", filters);

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

    // Extract potential citations from the response
    const citations = extractCitations(content);

    console.log("Chat response generated successfully");

    return new Response(
      JSON.stringify({ content, citations }),
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

function extractCitations(content: string): Array<{
  documentId: string;
  documentTitle: string;
  excerpt: string;
  regulatoryScope: string;
}> {
  const citations: Array<{
    documentId: string;
    documentTitle: string;
    excerpt: string;
    regulatoryScope: string;
  }> = [];

  // Match EU directives
  const euPattern = /EU\s+Directive\s+(\d+\/\d+(?:\/\w+)?)/gi;
  let match;
  while ((match = euPattern.exec(content)) !== null) {
    citations.push({
      documentId: `eu-${match[1].replace(/\//g, '-')}`,
      documentTitle: `EU Directive ${match[1]}`,
      excerpt: content.substring(Math.max(0, match.index - 50), Math.min(content.length, match.index + 100)),
      regulatoryScope: 'european',
    });
  }

  // Match Italian D.Lgs
  const dlgsPattern = /D\.Lgs\.?\s*(?:n\.\s*)?(\d+\/\d+)/gi;
  while ((match = dlgsPattern.exec(content)) !== null) {
    citations.push({
      documentId: `it-dlgs-${match[1].replace(/\//g, '-')}`,
      documentTitle: `D.Lgs. ${match[1]}`,
      excerpt: content.substring(Math.max(0, match.index - 50), Math.min(content.length, match.index + 100)),
      regulatoryScope: 'national',
    });
  }

  // Match Lombardy regional laws
  const lrPattern = /L\.R\.?\s+(?:Lombardia\s+)?(?:n\.\s*)?(\d+\/\d+)/gi;
  while ((match = lrPattern.exec(content)) !== null) {
    citations.push({
      documentId: `lr-lombardia-${match[1].replace(/\//g, '-')}`,
      documentTitle: `L.R. Lombardia ${match[1]}`,
      excerpt: content.substring(Math.max(0, match.index - 50), Math.min(content.length, match.index + 100)),
      regulatoryScope: 'lombardy',
    });
  }

  // Deduplicate by documentId
  const uniqueCitations = citations.filter((citation, index, self) =>
    index === self.findIndex(c => c.documentId === citation.documentId)
  );

  return uniqueCitations.slice(0, 5); // Limit to 5 citations
}
