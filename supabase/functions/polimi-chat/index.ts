import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const COURSE_KNOWLEDGE: Record<string, string> = {
  "Soil Remediation": `
    COURSE TITLE: Soil Remediation (095876)
    PROFESSOR: Sabrina Saponaro

    KEY OBJECTIVES:
    - Address contaminated sites (chemical pollution in soil, subsoil, groundwater).
    - Design management and intervention strategies.
    - Perform human health and environmental risk assessment.

    CORE TOPICS & TECHNOLOGIES:
    1. Soil Physics & Models:
       - Equations for water flow (saturated/unsaturated zones) and air flow.
       - Pollutant fate and transport models (dissolved in water vs vapor in soil gas).
    2. Characterization & Monitoring:
       - Procedures for soil, subsoil, groundwater, and soil gas sampling.
       - Chemical analysis methods.
    3. Risk Assessment:
       - Site-specific risk analysis (human health focus).
       - Calculation of acceptable remediation target limits.
    4. Remediation Technologies (The "Tech Stack"):
       - For SOIL: Solidification/Stabilization, Soil Washing, Soil Vapor Extraction (SVE), Biopiles, Bioventing, Thermal Conductive Heating.
       - For GROUNDWATER: Air Sparging, Permeable Reactive Barriers (PRB), In Situ Chemical Oxidation (ISCO).
       - For BIOLOGICAL: Biosparging, Biobarriers, Aerobic/Anaerobic Enhanced Bioremediation.
       - LNAPL: Recovery and soil interaction.

    LEGAL FRAMEWORK:
    - Focus on Italian Regulation (D.Lgs 152/2006) and EU directives.

    EXAM/PROJECT INFO:
    - Students work in teams to design remediation actions (Investigation plan, Risk assessment, Pilot test design).
  `,

  "Environmental Impact Assessment": `
    COURSE TITLE: Environmental Impact Assessment (054594)
    PROFESSOR: Arianna Azzellino

    KEY OBJECTIVES:
    - Quantify impacts of newly constructed works/infrastructure.
    - Evaluate environmental compatibility and design mitigation measures.
    - Use simulation tools (GIS, pollutant dispersion models).

    CORE TOPICS & PROCEDURES:
    1. Regulatory Framework:
       - EU Directives vs Italian Legislation (National vs Regional EIA).
       - Related procedures: SEA (VAS), IPPC/AIA, VINCA (Incidence Assessment).
    2. The EIA Study (SIA) Contents:
       - Programmatic and Project Framework.
       - Environmental Framework (Quadro Ambientale).
       - Impact Prediction, Mitigation, Compensation, and Monitoring Plan.
    3. Environmental Components Analyzed:
       - Atmosphere (Air quality models).
       - Water environment (Wastewater effects).
       - Soil & Subsoil.
       - Vegetation, Flora, Fauna, Ecosystems (Habitat directives).
       - Public Health & Physical Agents (Noise, Radiation).
       - Landscape.
    4. Methodologies:
       - Scenario Analysis (Comparison of alternatives).
       - Indicators for qualitative-quantitative assessment (Negligible, Perceptible, Mitigable impacts).

    PROJECT INFO:
    - Case studies include road infrastructures or wastewater plants.
    - Tools used: GIS software, Minitab, statistical models.
  `
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt, courseName } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get course-specific knowledge
    const courseKnowledge = COURSE_KNOWLEDGE[courseName] || '';

    // Build the enhanced system prompt with course knowledge
    const enhancedSystemPrompt = `${systemPrompt}

${courseKnowledge ? `OFFICIAL COURSE SYLLABUS KNOWLEDGE:\n${courseKnowledge}` : ''}

IMPORTANT GUIDELINES:
- When course materials are provided, prioritize information from those documents
- Use the official syllabus knowledge above to provide accurate, course-specific answers
- Be precise and technical in your explanations
- Use academic terminology appropriate for university-level engineering students
- Include relevant formulas, standards, and references when applicable
- If you're unsure about something, acknowledge it clearly
- Structure your answers clearly with headings or bullet points when appropriate

Course Context: ${courseName}
Institution: Politecnico di Milano`;

    console.log(`Processing chat request for course: ${courseName}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service quota exceeded. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    console.log(`Successfully generated response for ${courseName}`);

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Polimi chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
