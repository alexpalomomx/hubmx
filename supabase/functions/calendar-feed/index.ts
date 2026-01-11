import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "text/calendar; charset=utf-8",
};

function escapeICS(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatICSDate(date: string, time?: string): string {
  const d = new Date(date);
  if (time) {
    const [hours, minutes] = time.split(":");
    d.setHours(parseInt(hours), parseInt(minutes), 0);
  }
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function formatICSDateOnly(date: string): string {
  return date.replace(/-/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get URL params
    const url = new URL(req.url);
    const communityId = url.searchParams.get("community");
    const category = url.searchParams.get("category");

    // Fetch approved/upcoming events
    let query = supabase
      .from("events")
      .select("*, organizer:organizer_id(name)")
      .eq("approval_status", "approved")
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true });

    if (communityId) {
      query = query.eq("organizer_id", communityId);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data: events, error } = await query;

    if (error) {
      throw error;
    }

    // Generate ICS content
    const calendarName = "Hub de Comunidades - Eventos";
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Hub de Comunidades//Eventos//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${escapeICS(calendarName)}`,
      "X-WR-TIMEZONE:America/Mexico_City",
    ];

    for (const event of events || []) {
      const uid = `${event.id}@hubdecomunidades.mx`;
      const created = new Date(event.created_at).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const updated = new Date(event.updated_at).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      
      let dtStart: string;
      let dtEnd: string;
      
      if (event.event_time) {
        dtStart = `DTSTART:${formatICSDate(event.event_date, event.event_time)}`;
        // Assume 2 hour duration if no end time
        const endDate = new Date(event.event_date);
        const [hours, minutes] = event.event_time.split(":");
        endDate.setHours(parseInt(hours) + 2, parseInt(minutes), 0);
        dtEnd = `DTEND:${endDate.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`;
      } else {
        // All-day event
        dtStart = `DTSTART;VALUE=DATE:${formatICSDateOnly(event.event_date)}`;
        const nextDay = new Date(event.event_date);
        nextDay.setDate(nextDay.getDate() + 1);
        dtEnd = `DTEND;VALUE=DATE:${nextDay.toISOString().split("T")[0].replace(/-/g, "")}`;
      }

      const organizer = event.organizer?.name || "Hub de Comunidades";
      const location = event.location || (event.event_type === "virtual" ? "Evento Virtual" : "");

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${created}`,
        dtStart,
        dtEnd,
        `CREATED:${created}`,
        `LAST-MODIFIED:${updated}`,
        `SUMMARY:${escapeICS(event.title)}`,
        `DESCRIPTION:${escapeICS(event.description || "")}`,
        `LOCATION:${escapeICS(location)}`,
        `ORGANIZER;CN=${escapeICS(organizer)}:MAILTO:eventos@hubdecomunidades.mx`,
        event.registration_url ? `URL:${event.registration_url}` : "",
        `STATUS:CONFIRMED`,
        "END:VEVENT"
      );
    }

    icsContent.push("END:VCALENDAR");

    // Filter empty lines and join
    const icsString = icsContent.filter(line => line).join("\r\n");

    return new Response(icsString, {
      headers: {
        ...corsHeaders,
        "Content-Disposition": 'attachment; filename="hubdecomunidades-eventos.ics"',
      },
    });
  } catch (error) {
    console.error("Error generating calendar:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
