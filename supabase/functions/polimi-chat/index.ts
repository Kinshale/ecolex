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
    const enhancedSystemPrompt = `Sei un assistente AI specializzato in normative e regolamenti per studenti e docenti del Politecnico di Milano.

CONTESTO ISTITUZIONALE:
- Operi esclusivamente nel contesto del Politecnico di Milano
- L'utente è uno studente o docente del corso: ${courseName}
- Le risposte devono essere pertinenti al contesto accademico, progettuale e professionale

${degreeKnowledge ? `AMBITO NORMATIVO SPECIFICO DEL CORSO:\n${degreeKnowledge}` : ''}

AREE DI COMPETENZA (rispondi SOLO a domande su):
1. Normative e leggi ambientali italiane ed europee
2. Regolamenti urbanistici ed edilizi
3. Norme su sicurezza, rischio industriale e sostenibilità
4. Applicazioni normative in ambito accademico, progettuale e professionale
5. Procedure autorizzative (VIA, VAS, AIA, permessi edilizi)
6. Direttive EU e loro recepimento in Italia
7. Regolamenti regionali (in particolare Lombardia)

REGOLE DI RISPOSTA RIGOROSE:
1. NON presentarti MAI. NON dire "Come esperto..." o "In qualità di...". Inizia subito con la risposta.
2. Risposte concise (150-200 parole max) salvo richiesta esplicita di approfondimento.
3. Usa elenchi puntati per migliorare la leggibilità.
4. Usa LaTeX per formule matematiche:
   - Inline: $formula$
   - Block: $$formula$$
5. Cita sempre gli articoli e i riferimenti normativi specifici.
6. Sii preciso e tecnico con terminologia universitaria.

GESTIONE DOMANDE FUORI AMBITO:
Se la domanda NON riguarda normative, regolamenti, leggi ambientali/urbanistiche/edilizie/di sicurezza, o NON è pertinente al contesto Polimi, rispondi:
"Mi dispiace, questa domanda non rientra nel mio ambito di competenza. Sono specializzato in normative ambientali, urbanistiche, edilizie e di sicurezza per studenti del Politecnico di Milano. Posso aiutarti con questioni relative a leggi, regolamenti e procedure autorizzative in questi ambiti."

${systemPrompt ? `\nISTRUZIONI AGGIUNTIVE: ${systemPrompt}` : ''}`;

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
          JSON.stringify({ error: 'Limite di richieste superato. Riprova tra un momento.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Quota di servizio esaurita. Riprova più tardi.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'Mi dispiace, non sono riuscito a generare una risposta.';

    console.log(`Successfully generated response for ${courseName}`);

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Polimi chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore imprevisto';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
