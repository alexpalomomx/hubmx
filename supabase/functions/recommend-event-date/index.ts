import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { preferredMonth, eventType, duration, communityId } = await req.json();

    // Get events from the next 3 months
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("title, event_date, event_time, location, event_type, organizer_id")
      .gte("event_date", today.toISOString().split("T")[0])
      .lte("event_date", threeMonthsLater.toISOString().split("T")[0])
      .order("event_date", { ascending: true });

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      throw new Error("Failed to fetch events");
    }

    // Format events for AI analysis
    const eventsContext = events?.map(e => 
      `- ${e.event_date} ${e.event_time || ''}: "${e.title}" (${e.event_type}, ${e.location || 'sin ubicación'})`
    ).join("\n") || "No hay eventos programados";

    const systemPrompt = `Eres un asistente experto en planificación de eventos para comunidades tech en México. 
Tu rol es analizar el calendario de eventos existentes y recomendar las mejores fechas para nuevos eventos.

Considera:
1. Evitar conflictos con eventos existentes (especialmente del mismo tipo o audiencia)
2. Preferir días laborales (martes a jueves son ideales para eventos tech)
3. Evitar fines de semana largos y días festivos mexicanos
4. Dejar al menos 1-2 días entre eventos similares
5. Los horarios más populares son: 18:00-20:00 para eventos presenciales, 19:00-21:00 para virtuales

Responde siempre en español y de forma estructurada con:
- 3 fechas recomendadas con justificación breve
- Horario sugerido
- Advertencias si hay conflictos potenciales

Fecha actual: ${today.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

    const userPrompt = `Analiza los siguientes eventos programados y recomienda las mejores fechas para un nuevo evento.

**Eventos existentes:**
${eventsContext}

**Detalles del nuevo evento:**
- Mes preferido: ${preferredMonth || 'próximos 2 meses'}
- Tipo de evento: ${eventType || 'no especificado'}
- Duración estimada: ${duration || '2 horas'}
${communityId ? `- Comunidad organizadora: ${communityId}` : ''}

Por favor recomienda las 3 mejores fechas considerando el calendario actual.`;

    console.log("Calling Lovable AI Gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes excedido, intenta de nuevo más tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Se requiere pago, agrega fondos a tu workspace de Lovable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const recommendation = aiResponse.choices?.[0]?.message?.content || "No se pudo generar una recomendación";

    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendation,
        eventsAnalyzed: events?.length || 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in recommend-event-date:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Error desconocido" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
