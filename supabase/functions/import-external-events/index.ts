import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ParsedEvent {
  uid: string
  title: string
  description: string
  start: Date
  end: Date | null
  location: string
  url: string
}

interface EventSource {
  id?: string
  name: string
  type: 'ics' | 'meetup' | 'luma' | 'eventbrite'
  url: string
  community_id?: string
}

// ==================== ICS Parser ====================
function parseICS(icsContent: string): ParsedEvent[] {
  const events: ParsedEvent[] = []
  const lines = icsContent.split(/\r?\n/)
  
  let currentEvent: Partial<ParsedEvent> | null = null
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    
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
          case 'UID': currentEvent.uid = value; break
          case 'SUMMARY': currentEvent.title = decodeICSText(value); break
          case 'DESCRIPTION': currentEvent.description = decodeICSText(value); break
          case 'LOCATION': currentEvent.location = decodeICSText(value); break
          case 'URL': currentEvent.url = value; break
          case 'DTSTART': currentEvent.start = parseICSDate(value); break
          case 'DTEND': currentEvent.end = parseICSDate(value); break
        }
      }
    }
  }
  return events
}

function decodeICSText(text: string): string {
  return text.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\')
}

function parseICSDate(dateStr: string): Date {
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
    return clean.endsWith('Z') 
      ? new Date(Date.UTC(year, month, day, hour, minute, second))
      : new Date(year, month, day, hour, minute, second)
  }
  return new Date(dateStr)
}

async function fetchICSFeed(url: string): Promise<ParsedEvent[]> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ICS: ${response.statusText}`)
  return parseICS(await response.text())
}

// ==================== Meetup Parser ====================
async function fetchMeetupEvents(url: string): Promise<ParsedEvent[]> {
  const events: ParsedEvent[] = []
  
  try {
    console.log(`Fetching Meetup page: ${url}`)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })
    
    if (!response.ok) throw new Error(`Meetup fetch failed: ${response.status}`)
    const html = await response.text()
    
    // Extract JSON-LD data from script tags
    const jsonLdMatches = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
    
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '').trim()
          const data = JSON.parse(jsonContent)
          
          // Handle array of events or single event
          const items = Array.isArray(data) ? data : [data]
          
          for (const item of items) {
            if (item['@type'] === 'Event' || item.startDate) {
              events.push({
                uid: item.url || crypto.randomUUID(),
                title: item.name || item.headline || 'Evento Meetup',
                description: item.description || '',
                start: new Date(item.startDate),
                end: item.endDate ? new Date(item.endDate) : null,
                location: extractLocation(item.location),
                url: item.url || url,
              })
            }
          }
        } catch (e) {
          console.log('JSON-LD parse error:', e.message)
        }
      }
    }
    
    // Fallback: Try to find events in embedded data
    if (events.length === 0) {
      const dataMatch = html.match(/__NEXT_DATA__[^>]*>([^<]+)</i)
      if (dataMatch) {
        try {
          const nextData = JSON.parse(dataMatch[1])
          const upcomingEvents = findEventsInObject(nextData)
          events.push(...upcomingEvents)
        } catch (e) {
          console.log('Next.js data parse error:', e.message)
        }
      }
    }
    
    console.log(`Found ${events.length} Meetup events`)
  } catch (error) {
    console.error('Meetup parsing error:', error)
    throw error
  }
  
  return events
}

function extractLocation(location: any): string {
  if (!location) return ''
  if (typeof location === 'string') return location
  if (location.name) return location.name
  if (location.address) {
    const addr = location.address
    return [addr.streetAddress, addr.addressLocality, addr.addressRegion]
      .filter(Boolean).join(', ')
  }
  return ''
}

function findEventsInObject(obj: any, events: ParsedEvent[] = []): ParsedEvent[] {
  if (!obj || typeof obj !== 'object') return events
  
  if (obj.title && obj.dateTime && obj.eventUrl) {
    events.push({
      uid: obj.id || obj.eventUrl || crypto.randomUUID(),
      title: obj.title,
      description: obj.description || '',
      start: new Date(obj.dateTime),
      end: obj.endTime ? new Date(obj.endTime) : null,
      location: obj.venue?.name || obj.venue?.address || '',
      url: obj.eventUrl?.startsWith('http') ? obj.eventUrl : `https://www.meetup.com${obj.eventUrl}`,
    })
  }
  
  for (const key of Object.keys(obj)) {
    if (Array.isArray(obj[key])) {
      obj[key].forEach((item: any) => findEventsInObject(item, events))
    } else if (typeof obj[key] === 'object') {
      findEventsInObject(obj[key], events)
    }
  }
  
  return events
}

// ==================== Luma Parser ====================
async function fetchLumaEvents(url: string): Promise<ParsedEvent[]> {
  const events: ParsedEvent[] = []
  
  try {
    console.log(`Fetching Luma page: ${url}`)
    
    // Normalize URL to get the calendar/host page
    let apiUrl = url
    if (url.includes('lu.ma/')) {
      const slug = url.split('lu.ma/')[1]?.split('/')[0]?.split('?')[0]
      if (slug) {
        // Try to get events from the calendar API
        apiUrl = `https://api.lu.ma/calendar/get-items?calendar_api_id=${slug}&period=future`
      }
    }
    
    // First try the API approach
    try {
      const apiResponse = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json' }
      })
      
      if (apiResponse.ok) {
        const data = await apiResponse.json()
        if (data.entries) {
          for (const entry of data.entries) {
            const event = entry.event || entry
            if (event.name && event.start_at) {
              events.push({
                uid: event.api_id || event.url || crypto.randomUUID(),
                title: event.name,
                description: event.description || '',
                start: new Date(event.start_at),
                end: event.end_at ? new Date(event.end_at) : null,
                location: event.geo_address_info?.full_address || event.location || '',
                url: event.url ? `https://lu.ma/${event.url}` : url,
              })
            }
          }
        }
      }
    } catch (apiError) {
      console.log('Luma API failed, trying HTML:', apiError.message)
    }
    
    // Fallback: scrape HTML
    if (events.length === 0) {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        }
      })
      
      if (!response.ok) throw new Error(`Luma fetch failed: ${response.status}`)
      const html = await response.text()
      
      // Extract JSON-LD
      const jsonLdMatches = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
      if (jsonLdMatches) {
        for (const match of jsonLdMatches) {
          try {
            const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '').trim()
            const data = JSON.parse(jsonContent)
            
            if (data['@type'] === 'Event' || data.startDate) {
              events.push({
                uid: data.url || crypto.randomUUID(),
                title: data.name || 'Evento Luma',
                description: data.description || '',
                start: new Date(data.startDate),
                end: data.endDate ? new Date(data.endDate) : null,
                location: extractLocation(data.location),
                url: data.url || url,
              })
            }
          } catch (e) {
            console.log('Luma JSON-LD parse error:', e.message)
          }
        }
      }
      
      // Try __NEXT_DATA__ for Luma
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([^<]+)<\/script>/i)
      if (nextDataMatch && events.length === 0) {
        try {
          const nextData = JSON.parse(nextDataMatch[1])
          const pageProps = nextData?.props?.pageProps
          
          if (pageProps?.initialData?.events) {
            for (const event of pageProps.initialData.events) {
              events.push({
                uid: event.api_id || crypto.randomUUID(),
                title: event.name,
                description: event.description || '',
                start: new Date(event.start_at),
                end: event.end_at ? new Date(event.end_at) : null,
                location: event.geo_address_info?.full_address || '',
                url: `https://lu.ma/${event.url}`,
              })
            }
          }
          
          // Single event page
          if (pageProps?.event) {
            const event = pageProps.event
            events.push({
              uid: event.api_id || crypto.randomUUID(),
              title: event.name,
              description: event.description || '',
              start: new Date(event.start_at),
              end: event.end_at ? new Date(event.end_at) : null,
              location: event.geo_address_info?.full_address || '',
              url: url,
            })
          }
        } catch (e) {
          console.log('Luma Next.js parse error:', e.message)
        }
      }
    }
    
    console.log(`Found ${events.length} Luma events`)
  } catch (error) {
    console.error('Luma parsing error:', error)
    throw error
  }
  
  return events
}

// ==================== Main Handler ====================
async function fetchEventsByType(source: EventSource): Promise<ParsedEvent[]> {
  switch (source.type) {
    case 'ics':
      return fetchICSFeed(source.url)
    case 'meetup':
      return fetchMeetupEvents(source.url)
    case 'luma':
      return fetchLumaEvents(source.url)
    case 'eventbrite':
      // TODO: Eventbrite requires API key
      console.log('Eventbrite not yet implemented')
      return []
    default:
      return []
  }
}

function detectSourceType(url: string): EventSource['type'] {
  if (url.includes('.ics') || url.includes('ical')) return 'ics'
  if (url.includes('meetup.com')) return 'meetup'
  if (url.includes('lu.ma')) return 'luma'
  if (url.includes('eventbrite.com')) return 'eventbrite'
  return 'ics' // default
}

Deno.serve(async (req) => {
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
    
    // Process single URL
    if (single_url) {
      const sourceType = detectSourceType(single_url)
      console.log(`Detected source type: ${sourceType} for ${single_url}`)
      
      try {
        const events = await fetchEventsByType({ name: single_url, type: sourceType, url: single_url })
        console.log(`Found ${events.length} events`)
        
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
            skippedCount++
            continue
          }
          
          const { error } = await supabase.from('events').insert({
            title: event.title,
            description: event.description.substring(0, 5000),
            event_date: eventDate,
            event_time: event.start.toTimeString().substring(0, 8),
            location: event.location,
            registration_url: event.url,
            event_type: event.location ? 'presencial' : 'virtual',
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
        
        results.push({ source: single_url, imported: importedCount, skipped: skippedCount })
      } catch (error) {
        console.error(`Error processing ${single_url}:`, error)
        results.push({ source: single_url, imported: 0, skipped: 0, error: error.message })
      }
    }
    
    // Process multiple sources
    if (sources && sources.length > 0) {
      for (const source of sources) {
        let sourceImported = 0
        let sourceSkipped = 0
        
        try {
          console.log(`Processing: ${source.name} (${source.type})`)
          const events = await fetchEventsByType(source)
          
          for (const event of events) {
            const eventDate = event.start.toISOString().split('T')[0]
            
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
            
            const { error } = await supabase.from('events').insert({
              title: event.title,
              description: event.description.substring(0, 5000),
              event_date: eventDate,
              event_time: event.start.toTimeString().substring(0, 8),
              location: event.location,
              registration_url: event.url,
              event_type: event.location ? 'presencial' : 'virtual',
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
          
          results.push({ source: source.name, imported: sourceImported, skipped: sourceSkipped })
        } catch (error) {
          console.error(`Error processing ${source.name}:`, error)
          results.push({ source: source.name, imported: 0, skipped: 0, error: error.message })
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        summary: { total_imported: importedCount, total_skipped: skippedCount, total_errors: errorCount },
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})