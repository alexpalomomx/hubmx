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

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatDateOnlyYYYYMMDD(dateStr: string): string {
  // dateStr expected YYYY-MM-DD
  return dateStr.replace(/-/g, "");
}

function formatLocalDateTimeYYYYMMDDTHHMMSS(dateStr: string, timeStr: string): string {
  const [hhRaw, mmRaw, ssRaw] = (timeStr || "").split(":");
  const hh = pad2(parseInt(hhRaw || "0", 10));
  const mm = pad2(parseInt(mmRaw || "0", 10));
  const ss = pad2(parseInt(ssRaw || "0", 10));
  return `${formatDateOnlyYYYYMMDD(dateStr)}T${hh}${mm}${ss}`;
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const base = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  base.setUTCDate(base.getUTCDate() + days);
  const yy = base.getUTCFullYear();
  const mm = pad2(base.getUTCMonth() + 1);
  const dd = pad2(base.getUTCDate());
  return `${yy}-${mm}-${dd}`;
}

function addHoursLocal(dateStr: string, timeStr: string, hoursToAdd: number): { date: string; time: string } {
  const [hhRaw, mmRaw, ssRaw] = (timeStr || "").split(":");
  const h = parseInt(hhRaw || "0", 10);
  const m = parseInt(mmRaw || "0", 10);
  const s = parseInt(ssRaw || "0", 10);

  const total = h * 3600 + m * 60 + s + hoursToAdd * 3600;
  const dayOffset = Math.floor(total / 86400);
  const rem = ((total % 86400) + 86400) % 86400;

  const nh = Math.floor(rem / 3600);
  const nm = Math.floor((rem % 3600) / 60);
  const ns = rem % 60;

  const newDate = addDays(dateStr, dayOffset);
  const newTime = `${pad2(nh)}:${pad2(nm)}:${pad2(ns)}`;

  return { date: newDate, time: newTime };
}

function getTodayInMexicoCityISODate(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
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
    const communities = url.searchParams.get("communities"); // comma-separated IDs
    const category = url.searchParams.get("category");

    // Fetch approved/upcoming events
    let query = supabase
      .from("events")
      .select("*, organizer:organizer_id(name)")
      .eq("approval_status", "approved")
      .gte("event_date", getTodayInMexicoCityISODate())
      .order("event_date", { ascending: true });

    // Filter by single community
    if (communityId) {
      query = query.eq("organizer_id", communityId);
    }
    
    // Filter by multiple communities (comma-separated)
    if (communities) {
      const communityIds = communities.split(",").filter(Boolean);
      if (communityIds.length > 0) {
        query = query.in("organizer_id", communityIds);
      }
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
      // Improve compatibility (Apple/Outlook) by defining the timezone
      "BEGIN:VTIMEZONE",
      "TZID:America/Mexico_City",
      "X-LIC-LOCATION:America/Mexico_City",
      "BEGIN:STANDARD",
      "TZOFFSETFROM:-0600",
      "TZOFFSETTO:-0600",
      "TZNAME:CST",
      "DTSTART:19700101T000000",
      "END:STANDARD",
      "END:VTIMEZONE",
    ];

    for (const event of events || []) {
      const uid = `${event.id}@hubdecomunidades.mx`;
      const created = new Date(event.created_at).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const updated = new Date(event.updated_at).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      
      let dtStart: string;
      let dtEnd: string;
      
      if (event.event_time) {
        dtStart = `DTSTART;TZID=America/Mexico_City:${formatLocalDateTimeYYYYMMDDTHHMMSS(event.event_date, event.event_time)}`;

        // Assume 2 hour duration if no end time
        const end = addHoursLocal(event.event_date, event.event_time, 2);
        dtEnd = `DTEND;TZID=America/Mexico_City:${formatLocalDateTimeYYYYMMDDTHHMMSS(end.date, end.time)}`;
      } else {
        // All-day event
        dtStart = `DTSTART;VALUE=DATE:${formatDateOnlyYYYYMMDD(event.event_date)}`;
        const nextDay = addDays(event.event_date, 1);
        dtEnd = `DTEND;VALUE=DATE:${formatDateOnlyYYYYMMDD(nextDay)}`;
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
