import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ICSEvent {
  uid: string
  title: string
  description: string
  start: Date
  end: Date | null
  location: string
  url: string
}

interface EventSource {
  id: string
  name: string
  type: 'ics' | 'meetup' | 'luma' | 'eventbrite'
  url: string
  community_id?: string
}

// Parse ICS/iCal format
function parseICS(icsContent: string): ICSEvent[] {
  const events: ICSEvent[] = []
  const lines = icsContent.split(/\r?\n/)
  
  let currentEvent: Partial<ICSEvent> | null = null
  let currentField = ''
  let currentValue = ''
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    
    // Handle line continuations (lines starting with space or tab)
    while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
      i++
      line += lines[i].substring(1)
    }
    
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = {}
    } else if (line.startsWith('END:VEVENT') && currentEvent) {
      if (currentEvent.title && currentEvent.start) {
        events.push({
          uid: currentEvent.uid || crypto.randomUUID(),
          title: currentEvent.title,
          description: currentEvent.description || '',
          start: currentEvent.start,
          end: currentEvent.end || null,
          location: currentEvent.location || '',
          url: currentEvent.url || '',
        })
      }
      currentEvent = null
    } else if (currentEvent) {
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const field = line.substring(0, colonIndex).split(';')[0]
        const value = line.substring(colonIndex + 1)
        
        switch (field) {
          case 'UID':
            currentEvent.uid = value
            break
          case 'SUMMARY':
            currentEvent.title = decodeICSText(value)
            break
          case 'DESCRIPTION':
            currentEvent.description = decodeICSText(value)
            break
          case 'LOCATION':
            currentEvent.location = decodeICSText(value)
            break
          case 'URL':
            currentEvent.url = value
            break
          case 'DTSTART':
            currentEvent.start = parseICSDate(value)
            break
          case 'DTEND':
            currentEvent.end = parseICSDate(value)
            break
        }
      }
    }
  }
  
  return events
}

function decodeICSText(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

function parseICSDate(dateStr: string): Date {
  // Handle formats: 20250115T180000Z or 20250115T180000 or 20250115
  const clean = dateStr.replace(/[^0-9TZ]/g, '')
  
  if (clean.length >= 8) {
    const year = parseInt(clean.substring(0, 4))
    const month = parseInt(clean.substring(4, 6)) - 1
    const day = parseInt(clean.substring(6, 8))
    
    let hour = 0, minute = 0, second = 0
    
    if (clean.includes('T') && clean.length >= 15) {
      const timeStart = clean.indexOf('T') + 1
      hour = parseInt(clean.substring(timeStart, timeStart + 2))
      minute = parseInt(clean.substring(timeStart + 2, timeStart + 4))
      second = parseInt(clean.substring(timeStart + 4, timeStart + 6))
    }
    
    if (clean.endsWith('Z')) {
      return new Date(Date.UTC(year, month, day, hour, minute, second))
    } else {
      return new Date(year, month, day, hour, minute, second)
    }
  }
  
  return new Date(dateStr)
}

async function fetchICSFeed(url: string): Promise<ICSEvent[]> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ICS feed: ${response.statusText}`)
  }
  const content = await response.text()
  return parseICS(content)
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const body = await req.json().catch(() => ({}))
    const { sources, single_url } = body as { sources?: EventSource[], single_url?: string }
    
    let importedCount = 0
    let skippedCount = 0
    let errorCount = 0
    const results: { source: string, imported: number, skipped: number, error?: string }[] = []
    
    // If single URL provided, import from it directly
    if (single_url) {
      try {
        console.log(`Fetching events from: ${single_url}`)
        const events = await fetchICSFeed(single_url)
        console.log(`Found ${events.length} events`)
        
        for (const event of events) {
          // Check if event already exists (by title and date)
          const eventDate = event.start.toISOString().split('T')[0]
          const { data: existing } = await supabase
            .from('events')
            .select('id')
            .eq('title', event.title)
            .eq('event_date', eventDate)
            .maybeSingle()
          
          if (existing) {
            skippedCount++
            continue
          }
          
          // Insert new event
          const { error } = await supabase.from('events').insert({
            title: event.title,
            description: event.description.substring(0, 5000),
            event_date: eventDate,
            event_time: event.start.toTimeString().substring(0, 8),
            location: event.location,
            registration_url: event.url,
            event_type: 'presencial',
            status: 'upcoming',
            approval_status: 'pending',
          })
          
          if (error) {
            console.error('Insert error:', error)
            errorCount++
          } else {
            importedCount++
          }
        }
        
        results.push({ 
          source: single_url, 
          imported: importedCount, 
          skipped: skippedCount,
          error: errorCount > 0 ? `${errorCount} errors` : undefined
        })
      } catch (error) {
        console.error(`Error processing ${single_url}:`, error)
        results.push({ source: single_url, imported: 0, skipped: 0, error: error.message })
      }
    }
    
    // Process multiple sources if provided
    if (sources && sources.length > 0) {
      for (const source of sources) {
        let sourceImported = 0
        let sourceSkipped = 0
        
        try {
          console.log(`Processing source: ${source.name} (${source.type})`)
          
          if (source.type === 'ics') {
            const events = await fetchICSFeed(source.url)
            console.log(`Found ${events.length} events from ${source.name}`)
            
            for (const event of events) {
              const eventDate = event.start.toISOString().split('T')[0]
              
              // Check for duplicates
              const { data: existing } = await supabase
                .from('events')
                .select('id')
                .eq('title', event.title)
                .eq('event_date', eventDate)
                .maybeSingle()
              
              if (existing) {
                sourceSkipped++
                skippedCount++
                continue
              }
              
              // Insert event
              const { error } = await supabase.from('events').insert({
                title: event.title,
                description: event.description.substring(0, 5000),
                event_date: eventDate,
                event_time: event.start.toTimeString().substring(0, 8),
                location: event.location,
                registration_url: event.url,
                event_type: 'presencial',
                status: 'upcoming',
                approval_status: 'pending',
                organizer_id: source.community_id || null,
              })
              
              if (error) {
                console.error('Insert error:', error)
                errorCount++
              } else {
                sourceImported++
                importedCount++
              }
            }
          }
          // TODO: Add support for meetup, luma, eventbrite APIs
          
          results.push({ 
            source: source.name, 
            imported: sourceImported, 
            skipped: sourceSkipped 
          })
        } catch (error) {
          console.error(`Error processing ${source.name}:`, error)
          results.push({ 
            source: source.name, 
            imported: 0, 
            skipped: 0, 
            error: error.message 
          })
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_imported: importedCount,
          total_skipped: skippedCount,
          total_errors: errorCount,
        },
        results,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
