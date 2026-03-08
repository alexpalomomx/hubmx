import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch external events (those with source_id)
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, title, description, category, event_date, source_id")
      .not("source_id", "is", null)
      .order("event_date", { ascending: false })
      .limit(200);

    if (eventsError) throw eventsError;

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({
          themes: [],
          summary: "No hay eventos de fuentes externas para analizar.",
          total_events_analyzed: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a compact list of event titles and descriptions for the AI
    const eventList = events
      .map(
        (e, i) =>
          `${i + 1}. "${e.title}"${e.description ? ` - ${e.description.slice(0, 150)}` : ""}${e.category ? ` [${e.category}]` : ""}`
      )
      .join("\n");

    const systemPrompt = `Eres un analista de comunidades tecnológicas en México. Analiza la lista de eventos de fuentes externas y determina las temáticas principales que se abordan. Responde SOLO usando la función proporcionada.`;

    const userPrompt = `Analiza estos ${events.length} eventos importados de fuentes externas y determina las temáticas principales:\n\n${eventList}`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "report_themes",
                description:
                  "Report the main themes found in external events",
                parameters: {
                  type: "object",
                  properties: {
                    themes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: {
                            type: "string",
                            description: "Nombre de la temática (ej: Inteligencia Artificial, Web3, DevOps)",
                          },
                          count: {
                            type: "integer",
                            description: "Número aproximado de eventos que tocan esta temática",
                          },
                          description: {
                            type: "string",
                            description: "Breve descripción de qué abarca esta temática en los eventos analizados",
                          },
                          example_events: {
                            type: "array",
                            items: { type: "string" },
                            description: "2-3 nombres de eventos ejemplo de esta temática",
                          },
                        },
                        required: ["name", "count", "description", "example_events"],
                        additionalProperties: false,
                      },
                    },
                    summary: {
                      type: "string",
                      description: "Resumen ejecutivo de las temáticas identificadas en 2-3 oraciones",
                    },
                  },
                  required: ["themes", "summary"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "report_themes" },
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes excedido. Intenta de nuevo en unos minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Agrega fondos en tu workspace de Lovable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        ...result,
        total_events_analyzed: events.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze-event-themes error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Error desconocido",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
