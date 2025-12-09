import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert environmental compliance analyst for Polimi Environmental Engineers. Your task is to analyze documents and check them against environmental regulations.

You will analyze the provided document content and generate a compliance report. You MUST respond with a valid JSON object in exactly this format:

{
  "status": "pass" or "fail",
  "summary": "Brief summary of the compliance analysis",
  "violations": [
    {
      "regulation": "The specific regulation violated (e.g., D.Lgs. 152/2006, Art. 73)",
      "description": "Description of what's wrong",
      "severity": "low" or "medium" or "high",
      "location": "Where in the document this was found (optional)"
    }
  ],
  "suggestions": [
    {
      "title": "Short title for the suggestion",
      "description": "Detailed description of what to do",
      "regulation": "Related regulation"
    }
  ]
}

Key regulations to check against:
- EU: Water Framework Directive 2000/60/EC, Industrial Emissions Directive 2010/75/EU, Waste Framework Directive 2008/98/EC
- Italy: D.Lgs. 152/2006 (Environmental Code), D.Lgs. 81/2008 (Safety)
- Lombardy: L.R. 26/2003, various D.G.R. for specific sectors

Be thorough but practical. Focus on real compliance issues.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileContent, filters } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context based on filters
    let filterContext = "";
    if (filters?.regulatoryScopes?.length > 0) {
      const scopeMap: Record<string, string> = {
        european: "European Union regulations",
        national: "Italian national laws",
        lombardy: "Lombardy regional regulations"
      };
      const scopes = filters.regulatoryScopes.map((s: string) => scopeMap[s] || s).join(", ");
      filterContext += `\nFocus your analysis on compliance with: ${scopes}.`;
    }

    if (filters?.areaOfInterest) {
      const areaMap: Record<string, string> = {
        sewage: "sewage and wastewater regulations",
        air_quality: "air quality and emissions standards",
        waste_management: "waste management requirements",
        water_resources: "water protection regulations",
        noise_pollution: "noise pollution limits",
        soil_contamination: "soil contamination standards",
        energy: "energy efficiency requirements",
        general: "general environmental regulations"
      };
      filterContext += `\nSpecifically check compliance with: ${areaMap[filters.areaOfInterest] || filters.areaOfInterest}.`;
    }

    const userPrompt = `Analyze this document for environmental compliance:

Document name: ${fileName}
Document content (base64 encoded, analyze the metadata and any text you can extract):
${fileContent.substring(0, 5000)}...

${filterContext}

Provide your analysis as a JSON object with status, summary, violations, and suggestions.`;

    console.log("Analyzing document:", fileName);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
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
    const content = data.choices?.[0]?.message?.content || "";

    console.log("Raw AI response:", content);

    // Parse the JSON response
    let report;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        report = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a default report if parsing fails
      report = {
        status: "pending",
        summary: "Unable to fully analyze the document. Please try again or upload a different format.",
        violations: [],
        suggestions: [
          {
            title: "Manual Review Recommended",
            description: "The document could not be automatically analyzed. Please review manually against applicable regulations.",
            regulation: "General"
          }
        ]
      };
    }

    // Add document name and timestamps
    const finalReport = {
      id: crypto.randomUUID(),
      documentName: fileName,
      status: report.status || "pending",
      summary: report.summary,
      violations: report.violations || [],
      suggestions: report.suggestions || [],
      regulatoryFilters: filters?.regulatoryScopes || [],
      areaFilter: filters?.areaOfInterest || null,
      createdAt: new Date().toISOString(),
    };

    console.log("Compliance analysis completed:", finalReport.status);

    return new Response(
      JSON.stringify(finalReport),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Analyze compliance error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
