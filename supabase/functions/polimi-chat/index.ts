import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Knowledge base for regulatory context
const DEGREE_KNOWLEDGE: Record<string, string> = {
  "Ingegneria per l'Ambiente e il Territorio": `
    AMBITO NORMATIVO PRINCIPALE:
    - Normative ambientali italiane (D.Lgs 152/2006 - Testo Unico Ambientale)
    - Direttive europee ambientali (VIA, VAS, IPPC/AIA)
    - Regolamenti sulla bonifica dei siti contaminati
    - Normative sulla gestione dei rifiuti e acque reflue
    - Regolamenti sulla qualità dell'aria e dell'acqua
    - Procedure di Valutazione di Impatto Ambientale (VIA/SIA)
    - Normative sulla sicurezza idraulica e idrogeologica
    - Regolamenti regionali lombardi in materia ambientale
  `,
  "Ingegneria Civile": `
    AMBITO NORMATIVO PRINCIPALE:
    - Norme Tecniche per le Costruzioni (NTC 2018)
    - Normative antisismiche
    - Codice della Strada e regolamenti infrastrutturali
    - Normative sulla sicurezza nei cantieri (D.Lgs 81/2008)
    - Regolamenti edilizi comunali
  `,
  "Ingegneria Edile e delle Costruzioni": `
    AMBITO NORMATIVO PRINCIPALE:
    - Normative edilizie e Testo Unico Edilizia (DPR 380/2001)
    - Norme Tecniche per le Costruzioni
    - Certificazione energetica degli edifici
    - Normative sulla sicurezza nei cantieri
    - Regolamenti urbanistici
  `,
  "Ingegneria Edile-Architettura": `
    AMBITO NORMATIVO PRINCIPALE:
    - Normative edilizie e urbanistiche
    - Codice dei Beni Culturali e del Paesaggio
    - Normative sulla sostenibilità degli edifici
    - Regolamenti paesaggistici
    - Norme sul risparmio energetico
  `,
  "Industrial Safety and Risk Engineering": `
    REGULATORY FOCUS:
    - Seveso III Directive (2012/18/EU)
    - Italian D.Lgs 105/2015 (Major accident hazards)
    - Workplace safety regulations (D.Lgs 81/2008)
    - ATEX Directives (explosive atmospheres)
    - Risk assessment methodologies (HAZOP, FMEA)
    - Emergency planning regulations
  `,
  "Sustainable Architecture and Landscape Design": `
    REGULATORY FOCUS:
    - EU Energy Performance of Buildings Directive (EPBD)
    - Italian energy efficiency regulations
    - Landscape protection laws
    - Environmental sustainability standards (LEED, BREEAM)
    - EU Taxonomy for sustainable activities
  `,
  "Urban Planning and Policy Design": `
    REGULATORY FOCUS:
    - Italian urban planning law (L. 1150/1942 and updates)
    - Regional territorial planning regulations
    - Strategic Environmental Assessment (SEA/VAS)
    - Urban regeneration regulations
    - EU Cohesion Policy framework
  `,
  "Urban Planning: Cities, Environment and Landscapes": `
    REGULATORY FOCUS:
    - Environmental urban planning regulations
    - EU Green Deal and urban sustainability
    - Climate adaptation regulations
    - Protected areas and ecological networks
    - Landscape planning instruments
  `
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    // Get degree-specific regulatory knowledge
    const degreeKnowledge = DEGREE_KNOWLEDGE[courseName] || '';

    // Build the enhanced system prompt focused on regulatory topics
    const enhancedSystemPrompt = `You are an AI assistant specialized in regulations and laws for students and faculty at Politecnico di Milano.

INSTITUTIONAL CONTEXT:
- You operate exclusively within the context of Politecnico di Milano
- The user is a student or faculty member of: ${courseName}
- Responses must be relevant to academic, project, and professional contexts

${degreeKnowledge ? `DEGREE-SPECIFIC REGULATORY FOCUS:\n${degreeKnowledge}` : ''}

AREAS OF COMPETENCE (respond ONLY to questions about):
1. Italian and European environmental laws and regulations
2. Urban planning and building regulations
3. Safety, industrial risk, and sustainability regulations
4. Regulatory applications in academic, project, and professional contexts
5. Authorization procedures (EIA, SEA, IPPC, building permits)
6. EU Directives and their transposition into Italian law
7. Regional regulations (particularly Lombardy)

STRICT RESPONSE RULES:
1. NEVER introduce yourself. Do NOT say "As an expert..." or "In my capacity...". Start immediately with the answer.
2. Keep responses concise (150-200 words max) unless explicitly asked for detailed analysis.
3. Use bullet points for lists to improve readability.
4. Use LaTeX formatting for ALL math, formulas, and chemical equations:
   - Use single dollar signs for inline math: $formula$
   - Use double dollar signs for block equations: $$formula$$
5. Always cite specific articles and regulatory references.
6. Be precise and technical with university-level terminology.
7. Respond in English unless the user writes in Italian.

OFF-TOPIC QUESTION HANDLING:
If the question is NOT about regulations, laws, environmental/urban/building/safety matters, or is NOT relevant to the Polimi context, respond:
"I'm sorry, this question is outside my area of expertise. I specialize in environmental, urban planning, building, and safety regulations for Politecnico di Milano students. I can help you with questions about laws, regulations, and authorization procedures in these fields."

${systemPrompt ? `\nADDITIONAL INSTRUCTIONS: ${systemPrompt}` : ''}`;

    console.log(`Processing chat request for degree: ${courseName}`);

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
