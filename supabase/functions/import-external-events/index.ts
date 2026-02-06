import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mexico City timezone offset helper
function toMexicoCityTime(date: Date): { dateStr: string; timeStr: string } {
  // Format date in Mexico City timezone
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }
  
  const formatter = new Intl.DateTimeFormat('en-CA', options)
  const parts = formatter.formatToParts(date)
  
  const get = (type: string) => parts.find(p => p.type === type)?.value || '00'
  
  const dateStr = `${get('year')}-${get('month')}-${get('day')}`
  const timeStr = `${get('hour')}:${get('minute')}:${get('second')}`
  
  return { dateStr, timeStr }
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

// ==================== Eventbrite Parser ====================
async function fetchEventbriteEvents(url: string): Promise<ParsedEvent[]> {
  const events: ParsedEvent[] = []
  
  try {
    console.log(`Fetching Eventbrite page: ${url}`)
    
    // Fetch the page HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
      }
    })
    
    if (!response.ok) throw new Error(`Eventbrite fetch failed: ${response.status}`)
    const html = await response.text()
    
    console.log(`Eventbrite HTML length: ${html.length} chars`)
    
    // Method 1: Extract JSON-LD structured data
    const jsonLdMatches = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
    
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '').trim()
          const data = JSON.parse(jsonContent)
          
          // Handle array or single object
          const items = Array.isArray(data) ? data : [data]
          
          for (const item of items) {
            if (item['@type'] === 'Event' && item.name && item.startDate) {
              const eventUrl = item.url || url
              
              events.push({
                uid: eventUrl || crypto.randomUUID(),
                title: item.name,
                description: item.description || '',
                start: new Date(item.startDate),
                end: item.endDate ? new Date(item.endDate) : null,
                location: extractEventbriteLocation(item.location),
                url: eventUrl,
              })
            }
          }
        } catch (e) {
          console.log('Eventbrite JSON-LD parse error:', e.message)
        }
      }
    }
    
    // Method 2: Try to find __NEXT_DATA__ or window.__SERVER_DATA__
    if (events.length === 0) {
      const serverDataMatch = html.match(/window\.__SERVER_DATA__\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/i)
      if (serverDataMatch) {
        try {
          const serverData = JSON.parse(serverDataMatch[1])
          const foundEvents = findEventbriteEventsInObject(serverData, url)
          events.push(...foundEvents)
          console.log(`Found ${foundEvents.length} events from __SERVER_DATA__`)
        } catch (e) {
          console.log('Server data parse error:', e.message)
        }
      }
    }
    
    // Method 3: Parse event cards from HTML
    if (events.length === 0) {
      const eventCardMatches = html.match(/data-event-id="([^"]+)"/gi)
      const eventUrlMatches = html.match(/href="(https:\/\/www\.eventbrite\.com[^"]*\/e\/[^"]+)"/gi)
      
      if (eventUrlMatches) {
        const uniqueUrls = [...new Set(eventUrlMatches.map(m => m.match(/href="([^"]+)"/)?.[1]).filter(Boolean))]
        
        for (const eventUrl of uniqueUrls.slice(0, 20)) { // Limit to 20 events
          try {
            const eventData = await fetchSingleEventbriteEvent(eventUrl as string)
            if (eventData) {
              events.push(eventData)
            }
          } catch (e) {
            console.log(`Error fetching event ${eventUrl}:`, e.message)
          }
        }
      }
    }
    
    console.log(`Found ${events.length} Eventbrite events`)
  } catch (error) {
    console.error('Eventbrite parsing error:', error)
    throw error
  }
  
  return events
}

async function fetchSingleEventbriteEvent(url: string): Promise<ParsedEvent | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      }
    })
    
    if (!response.ok) return null
    const html = await response.text()
    
    // Extract JSON-LD
    const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i)
    if (jsonLdMatch) {
      const data = JSON.parse(jsonLdMatch[1].replace(/<script[^>]*>|<\/script>/gi, '').trim())
      if (data['@type'] === 'Event' && data.name && data.startDate) {
        return {
          uid: url,
          title: data.name,
          description: data.description || '',
          start: new Date(data.startDate),
          end: data.endDate ? new Date(data.endDate) : null,
          location: extractEventbriteLocation(data.location),
          url: url,
        }
      }
    }
  } catch (e) {
    console.log(`Single event fetch error: ${e.message}`)
  }
  return null
}

function extractEventbriteLocation(location: any): string {
  if (!location) return ''
  if (typeof location === 'string') return location
  if (location.name) {
    if (location.address) {
      const addr = location.address
      const parts = [
        location.name,
        addr.streetAddress,
        addr.addressLocality,
        addr.addressRegion
      ].filter(Boolean)
      return parts.join(', ')
    }
    return location.name
  }
  if (location.address) {
    const addr = location.address
    return [addr.streetAddress, addr.addressLocality, addr.addressRegion]
      .filter(Boolean).join(', ')
  }
  return ''
}

function findEventbriteEventsInObject(obj: any, baseUrl: string, events: ParsedEvent[] = []): ParsedEvent[] {
  if (!obj || typeof obj !== 'object') return events
  
  // Look for event-like objects
  if (obj.name && (obj.start || obj.startDate || obj.start_date)) {
    const startDate = obj.start?.utc || obj.start?.local || obj.startDate || obj.start_date
    const endDate = obj.end?.utc || obj.end?.local || obj.endDate || obj.end_date
    
    if (startDate) {
      events.push({
        uid: obj.url || obj.id || crypto.randomUUID(),
        title: obj.name?.text || obj.name,
        description: obj.description?.text || obj.description || obj.summary || '',
        start: new Date(startDate),
        end: endDate ? new Date(endDate) : null,
        location: obj.venue?.name || obj.venue?.address?.localized_address_display || '',
        url: obj.url || baseUrl,
      })
    }
  }
  
  for (const key of Object.keys(obj)) {
    if (Array.isArray(obj[key])) {
      obj[key].forEach((item: any) => findEventbriteEventsInObject(item, baseUrl, events))
    } else if (typeof obj[key] === 'object') {
      findEventbriteEventsInObject(obj[key], baseUrl, events)
    }
  }
  
  return events
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

function findLumaCalendarApiId(obj: any, maxDepth = 12): string | null {
  const seen = new Set<any>()

  function walk(node: any, depth: number): string | null {
    if (!node || depth > maxDepth) return null
    if (typeof node !== 'object') return null
    if (seen.has(node)) return null
    seen.add(node)

    // Common key patterns
    if (typeof (node as any).calendar_api_id === 'string') return (node as any).calendar_api_id

    if (typeof (node as any).api_id === 'string' && (node as any).api_id.startsWith('cal_')) {
      return (node as any).api_id
    }

    for (const key of Object.keys(node)) {
      const val = (node as any)[key]
      if (typeof val === 'string' && val.startsWith('cal_')) {
        return val
      }
      if (typeof val === 'object') {
        const found = walk(val, depth + 1)
        if (found) return found
      }
    }

    return null
  }

  return walk(obj, 0)
}

// ==================== Luma Parser ====================
async function fetchLumaEvents(url: string): Promise<ParsedEvent[]> {
  const events: ParsedEvent[] = []

  try {
    console.log(`Fetching Luma events from: ${url}`)

    // Extract slug from URL - handle both lu.ma and luma.com
    let slug = ''
    if (url.includes('lu.ma/')) {
      slug = url.split('lu.ma/')[1]?.split('/')[0]?.split('?')[0]
    } else if (url.includes('luma.com/')) {
      slug = url.split('luma.com/')[1]?.split('/')[0]?.split('?')[0]
    }

    if (!slug) {
      console.log('Could not extract Luma slug from URL')
      return events
    }

    console.log(`Luma slug: ${slug}`)

    // Fetch HTML once (used to resolve the real calendar_api_id and for fallback parsing)
    let html: string | null = null
    let pageProps: any = null
    const htmlUrl = url.startsWith('https://') ? url : `https://lu.ma/${slug}`

    try {
      const htmlRes = await fetch(htmlUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
        }
      })

      if (htmlRes.ok) {
        html = await htmlRes.text()
        console.log(`Luma HTML length: ${html.length} chars`)

        const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i)
        if (nextDataMatch) {
          console.log('Found __NEXT_DATA__ in Luma HTML')
          try {
            const nextData = JSON.parse(nextDataMatch[1])
            pageProps = nextData?.props?.pageProps || null
            console.log(`pageProps keys: ${pageProps ? Object.keys(pageProps).join(', ') : 'null'}`)

            if (pageProps?.initialData) {
              console.log(`initialData keys: ${Object.keys(pageProps.initialData).join(', ')}`)
            }
          } catch (e) {
            console.log(`Luma __NEXT_DATA__ parse error: ${e.message}`)
          }
        }
      } else {
        console.log(`Luma HTML fetch failed: ${htmlRes.status}`)
      }
    } catch (e) {
      console.log(`Luma HTML fetch error: ${e.message}`)
    }

    // IMPORTANT: the vanity slug in the URL is often NOT the calendar_api_id that Luma endpoints need.
    const calendarApiId = findLumaCalendarApiId(pageProps?.initialData || pageProps)
    const idForApi = calendarApiId || slug
    console.log(`Luma calendar_api_id resolved: ${calendarApiId || '(not found; using slug)'}`)

    // Method 1: Try ICS feeds
    const icsCandidates = calendarApiId
      ? [
          `https://api.lu.ma/ics/get?entity=${calendarApiId}`,
          `https://lu.ma/${slug}.ics`,
        ]
      : [
          `https://lu.ma/${slug}.ics`,
          `https://api.lu.ma/ics/get?entity=${slug}`,
        ]

    for (const icsUrl of icsCandidates) {
      console.log(`Trying Luma ICS feed: ${icsUrl}`)

      try {
        const icsResponse = await fetch(icsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; EventSyncBot/1.0)',
            'Accept': 'text/calendar, */*',
          }
        })

        console.log(`Luma ICS response status: ${icsResponse.status}`)

        if (icsResponse.ok) {
          const icsText = await icsResponse.text()
          if (icsText.includes('BEGIN:VCALENDAR')) {
            const parsed = parseICS(icsText)
            const normalized = parsed.map((e) => ({
              ...e,
              url: e.url || `https://lu.ma/${slug}`,
            }))

            events.push(...normalized)
            console.log(`Parsed ${events.length} events from Luma ICS feed`)

            if (events.length > 0) return events
          }
        }
      } catch (icsError) {
        console.log(`Luma ICS fetch failed: ${icsError.message}`)
      }
    }

    // Method 2: Try API with resolved calendar_api_id
    const apiUrl = `https://api.lu.ma/calendar/get-items?calendar_api_id=${idForApi}&period=future`
    console.log(`Trying Luma API: ${apiUrl}`)

    try {
      const apiResponse = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; EventSyncBot/1.0)',
        }
      })

      console.log(`Luma API response status: ${apiResponse.status}`)

      if (apiResponse.ok) {
        const responseText = await apiResponse.text()
        console.log(`Luma API response preview: ${responseText.substring(0, 300)}`)

        try {
          const data = JSON.parse(responseText)

          const entries = data.entries || data.events || data.items || data.data || []
          console.log(`Found ${entries.length} entries in Luma API`)

          for (const entry of entries) {
            const event = entry.event || entry.calendar_event || entry
            if (event && (event.name || event.title) && (event.start_at || event.startDate)) {
              events.push({
                uid: event.api_id || event.id || event.url || crypto.randomUUID(),
                title: event.name || event.title,
                description: event.description || event.summary || '',
                start: new Date(event.start_at || event.startDate),
                end: (event.end_at || event.endDate) ? new Date(event.end_at || event.endDate) : null,
                location: event.geo_address_info?.full_address || event.location || event.address || '',
                url: event.url ? `https://lu.ma/${event.url}` : `https://lu.ma/${slug}`,
              })
            }
          }

          console.log(`Found ${events.length} events from Luma API`)
          if (events.length > 0) return events
        } catch (parseError) {
          console.log(`Luma API JSON parse error: ${parseError.message}`)
        }
      }
    } catch (apiError) {
      console.log(`Luma API error: ${apiError.message}`)
    }

    // Method 3: Best-effort fallback (extract events from pageProps)
    function collectLumaEventsFromObject(obj: any, out: ParsedEvent[] = [], max = 50): ParsedEvent[] {
      if (!obj || typeof obj !== 'object') return out
      if (out.length >= max) return out

      if ((obj.name || obj.title) && (obj.start_at || obj.startDate)) {
        const start = new Date(obj.start_at || obj.startDate)
        if (!isNaN(start.getTime())) {
          out.push({
            uid: obj.api_id || obj.id || obj.url || crypto.randomUUID(),
            title: obj.name || obj.title,
            description: obj.description || obj.summary || '',
            start,
            end: (obj.end_at || obj.endDate) ? new Date(obj.end_at || obj.endDate) : null,
            location: obj.geo_address_info?.full_address || obj.location || '',
            url: obj.url ? (obj.url.startsWith('http') ? obj.url : `https://lu.ma/${obj.url}`) : `https://lu.ma/${slug}`,
          })
        }
      }

      for (const key of Object.keys(obj)) {
        const val = obj[key]
        if (Array.isArray(val)) {
          for (const item of val) collectLumaEventsFromObject(item, out, max)
        } else if (typeof val === 'object') {
          collectLumaEventsFromObject(val, out, max)
        }
        if (out.length >= max) break
      }

      return out
    }

    if (events.length === 0 && pageProps) {
      collectLumaEventsFromObject(pageProps.initialData || pageProps, events)
    }

    console.log(`Total Luma events found: ${events.length}`)
    return events
  } catch (error) {
    console.error('Luma parsing error:', error)
    throw error
  }
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
      return fetchEventbriteEvents(source.url)
    default:
      return []
  }
}

function detectSourceType(url: string): EventSource['type'] {
  const lowerUrl = url.toLowerCase()
  if (lowerUrl.includes('meetup.com')) return 'meetup'
  if (lowerUrl.includes('lu.ma') || lowerUrl.includes('luma.com')) return 'luma'
  if (lowerUrl.includes('eventbrite.com')) return 'eventbrite'
  if (lowerUrl.includes('.ics') || lowerUrl.includes('ical')) return 'ics'
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
    const { sources, single_url, sync_all } = body as { sources?: EventSource[], single_url?: string, sync_all?: boolean }
    
    let importedCount = 0
    let updatedCount = 0
    let errorCount = 0
    const results: { source: string, imported: number, updated: number, error?: string }[] = []
    
    // If sync_all is true OR no params provided, fetch all active sources from database
    let sourcesToProcess = sources || []
    if (sync_all || (!single_url && (!sources || sources.length === 0))) {
      console.log('Fetching all active event sources from database...')
      const { data: dbSources, error: dbError } = await supabase
        .from('event_sources')
        .select('id, name, source_type, url')
        .eq('is_active', true)
      
      if (dbError) {
        console.error('Error fetching sources:', dbError)
      } else if (dbSources && dbSources.length > 0) {
        console.log(`Found ${dbSources.length} active sources`)
        sourcesToProcess = dbSources.map(s => ({
          id: s.id,
          name: s.name,
          type: s.source_type as 'ics' | 'meetup' | 'luma' | 'eventbrite',
          url: s.url,
        }))
        
        // Update each source after processing
        for (const source of sourcesToProcess) {
          try {
            console.log(`Processing source: ${source.name} (${source.type})`)
            const events = await fetchEventsByType(source)
            let sourceImported = 0
            let sourceUpdated = 0
            
            for (const event of events) {
              const { dateStr: eventDate, timeStr: eventTime } = toMexicoCityTime(event.start)
              
              const { data: existingRows, error: existingError } = await supabase
                .from('events')
                .select('id')
                .eq('registration_url', event.url)

              if (existingError) {
                console.error('Existing lookup error:', existingError)
                errorCount++
                continue
              }

              const eventData = {
                title: event.title,
                description: event.description.substring(0, 5000),
                event_date: eventDate,
                event_time: eventTime,
                location: event.location,
                registration_url: event.url,
                event_type: event.location ? 'presencial' : 'virtual',
                status: 'upcoming',
                source_id: (source as any).id || null,
                updated_at: new Date().toISOString(),
              }

              if (existingRows && existingRows.length > 0) {
                const ids = existingRows.map((r) => r.id)
                const { error } = await supabase
                  .from('events')
                  .update(eventData)
                  .in('id', ids)

                if (error) {
                  console.error('Update error:', error)
                  errorCount++
                } else {
                  sourceUpdated += ids.length
                  updatedCount += ids.length
                }
              } else {
                const { error } = await supabase.from('events').insert({
                  ...eventData,
                  approval_status: 'pending',
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
            
            // Update source sync status
            await supabase
              .from('event_sources')
              .update({
                last_synced_at: new Date().toISOString(),
                events_imported: sourceImported + sourceUpdated,
                sync_error: null,
              })
              .eq('id', (source as any).id)
            
            results.push({ source: source.name, imported: sourceImported, updated: sourceUpdated })
          } catch (error) {
            console.error(`Error processing ${source.name}:`, error)
            
            // Update source with error
            await supabase
              .from('event_sources')
              .update({
                last_synced_at: new Date().toISOString(),
                sync_error: error.message,
              })
              .eq('id', (source as any).id)
            
            results.push({ source: source.name, imported: 0, updated: 0, error: error.message })
          }
        }
        
        // Return early if we processed sync_all
        return new Response(
          JSON.stringify({
            success: true,
            mode: 'sync_all',
            summary: { total_imported: importedCount, total_updated: updatedCount, total_errors: errorCount },
            results,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }
    }
    
    // Process single URL
    if (single_url) {
      const sourceType = detectSourceType(single_url)
      console.log(`Detected source type: ${sourceType} for ${single_url}`)
      
      try {
        const events = await fetchEventsByType({ name: single_url, type: sourceType, url: single_url })
        console.log(`Found ${events.length} events`)
        
        for (const event of events) {
          // Convert to Mexico City timezone
          const { dateStr: eventDate, timeStr: eventTime } = toMexicoCityTime(event.start)
          
          console.log(`Event: ${event.title} - Original UTC: ${event.start.toISOString()} -> Mexico City: ${eventDate} ${eventTime}`)
          
          // Check for existing event(s) by registration_url (identifier)
          const { data: existingRows, error: existingError } = await supabase
            .from('events')
            .select('id')
            .eq('registration_url', event.url)

          if (existingError) {
            console.error('Existing lookup error:', existingError)
            errorCount++
            continue
          }

          const eventData = {
            title: event.title,
            description: event.description.substring(0, 5000),
            event_date: eventDate,
            event_time: eventTime,
            location: event.location,
            registration_url: event.url,
            event_type: event.location ? 'presencial' : 'virtual',
            status: 'upcoming',
            updated_at: new Date().toISOString(),
          }

          if (existingRows && existingRows.length > 0) {
            // Update ALL matching rows (fixes duplicates with wrong time, including approved rows)
            const ids = existingRows.map((r) => r.id)
            const { error } = await supabase
              .from('events')
              .update(eventData)
              .in('id', ids)

            if (error) {
              console.error('Update error:', error)
              errorCount++
            } else {
              updatedCount += ids.length
              console.log(`Updated ${ids.length} row(s) for event: ${event.title}`)
            }
          } else {
            // Insert new event
            const { error } = await supabase.from('events').insert({
              ...eventData,
              approval_status: 'pending',
            })
            
            if (error) {
              console.error('Insert error:', error)
              errorCount++
            } else {
              importedCount++
              console.log(`Inserted new event: ${event.title}`)
            }
          }
        }
        
        results.push({ source: single_url, imported: importedCount, updated: updatedCount })
      } catch (error) {
        console.error(`Error processing ${single_url}:`, error)
        results.push({ source: single_url, imported: 0, updated: 0, error: error.message })
      }
    }
    
    // Process multiple sources
    if (sources && sources.length > 0) {
      for (const source of sources) {
        let sourceImported = 0
        let sourceUpdated = 0
        
        try {
          console.log(`Processing: ${source.name} (${source.type})`)
          const events = await fetchEventsByType(source)
          
          for (const event of events) {
            // Convert to Mexico City timezone
            const { dateStr: eventDate, timeStr: eventTime } = toMexicoCityTime(event.start)
            
            console.log(`Event: ${event.title} - Original UTC: ${event.start.toISOString()} -> Mexico City: ${eventDate} ${eventTime}`)
            
            // Check for existing event(s) by registration_url (identifier)
            const { data: existingRows, error: existingError } = await supabase
              .from('events')
              .select('id')
              .eq('registration_url', event.url)

            if (existingError) {
              console.error('Existing lookup error:', existingError)
              errorCount++
              continue
            }
            
            const eventData = {
              title: event.title,
              description: event.description.substring(0, 5000),
              event_date: eventDate,
              event_time: eventTime,
              location: event.location,
              registration_url: event.url,
              event_type: event.location ? 'presencial' : 'virtual',
              status: 'upcoming',
              organizer_id: source.community_id || null,
              updated_at: new Date().toISOString(),
            }
            
            if (existingRows && existingRows.length > 0) {
              // Update ALL matching rows (fixes duplicates with wrong time, including approved rows)
              const ids = existingRows.map((r) => r.id)
              const { error } = await supabase
                .from('events')
                .update(eventData)
                .in('id', ids)
              
              if (error) {
                console.error('Update error:', error)
                errorCount++
              } else {
                sourceUpdated += ids.length
                updatedCount += ids.length
                console.log(`Updated ${ids.length} row(s) for event: ${event.title}`)
              }
            } else {
              // Insert new event
              const { error } = await supabase.from('events').insert({
                ...eventData,
                approval_status: 'pending',
              })
              
              if (error) {
                console.error('Insert error:', error)
                errorCount++
              } else {
                sourceImported++
                importedCount++
                console.log(`Inserted new event: ${event.title}`)
              }
            }
          }
          
          results.push({ source: source.name, imported: sourceImported, updated: sourceUpdated })
        } catch (error) {
          console.error(`Error processing ${source.name}:`, error)
          results.push({ source: source.name, imported: 0, updated: 0, error: error.message })
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        summary: { total_imported: importedCount, total_updated: updatedCount, total_errors: errorCount },
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