import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LegionCommunity {
  id: string
  nombre: string
  tipo: string
  descripcion?: string
  lider_id?: string
  miembros_count: number
  ubicacion?: string
  imagen_url?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

interface HubCommunity {
  id: string
  name: string
  category: string
  description?: string
  created_by?: string
  members_count: number
  location?: string
  logo_url?: string
  topics?: string[]
  created_at: string
  updated_at: string
  status: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, direction } = await req.json()
    
    const hubSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const legionSupabase = createClient(
      Deno.env.get('LEGION_SUPABASE_URL') ?? '',
      Deno.env.get('LEGION_SUPABASE_KEY') ?? ''
    )

    if (action === 'sync') {
      if (direction === 'from_legion' || direction === 'bidirectional') {
        await syncCommunitiesFromLegion(legionSupabase, hubSupabase)
        await syncInterestsFromLegion(legionSupabase, hubSupabase)
      }
      
      if (direction === 'to_legion' || direction === 'bidirectional') {
        await syncCommunitiesToLegion(hubSupabase, legionSupabase)
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Sincronización de comunidades e interesados completada' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en sincronización:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function loadCategoryMappings(hubSupabase: any): Promise<{ toHub: Record<string, string>, toLegion: Record<string, string> }> {
  const { data: categories } = await hubSupabase
    .from('community_categories')
    .select('value, label')
    .eq('is_active', true)

  // Build dynamic mappings based on category values
  const toHub: Record<string, string> = {}
  const toLegion: Record<string, string> = {}

  // Default static mappings as fallback
  const staticToHub: Record<string, string> = {
    'tech': 'tecnologia',
    'education': 'educacion',
    'business': 'emprendimiento',
    'social': 'social',
    'cultural': 'cultura'
  }
  const staticToLegion: Record<string, string> = {
    'tecnologia': 'tech',
    'educacion': 'education',
    'emprendimiento': 'business',
    'social': 'social',
    'cultura': 'cultural'
  }

  // Merge static mappings
  Object.assign(toHub, staticToHub)
  Object.assign(toLegion, staticToLegion)

  // Add dynamic categories: map each value to itself (identity) so they pass through
  // and also register them for Legion mapping
  if (categories) {
    for (const cat of categories) {
      // If a Legion type matches a Hub category value, map it
      toHub[cat.value] = cat.value
      toLegion[cat.value] = cat.value
    }
  }

  console.log(`Categorías cargadas: ${categories?.length || 0} dinámicas + estáticas`)
  return { toHub, toLegion }
}

async function syncCommunitiesFromLegion(legionSupabase: any, hubSupabase: any) {
  console.log('Sincronizando comunidades desde Legion Hack MX...')
  
  const { toHub } = await loadCategoryMappings(hubSupabase)
  
  const { data: legionCommunities, error: legionError } = await legionSupabase
    .from('communities')
    .select('*')
  
  if (legionError) {
    console.error('Error obteniendo comunidades de Legion:', legionError)
    throw legionError
  }
  
  console.log(`Encontradas ${legionCommunities?.length || 0} comunidades en Legion Hack MX`)

  for (const legion of legionCommunities as LegionCommunity[]) {
    const mappedCategory = toHub[legion.tipo] || 'otros'
    const hubCommunity: Partial<HubCommunity> = {
      name: legion.nombre,
      category: mappedCategory,
      description: legion.descripcion,
      created_by: null,
      members_count: legion.miembros_count || 0,
      location: legion.ubicacion,
      logo_url: legion.imagen_url,
      topics: legion.tags || [],
      status: 'active'
    }

    const { data: existing } = await hubSupabase
      .from('communities')
      .select('id')
      .eq('name', legion.nombre)
      .single()

    if (existing) {
      const { error: updateError } = await hubSupabase
        .from('communities')
        .update(hubCommunity)
        .eq('id', existing.id)
      
      if (updateError) {
        console.error(`Error actualizando ${legion.nombre}:`, updateError)
        throw updateError
      }
      console.log(`Actualizada: ${legion.nombre} (categoría: ${legion.tipo} -> ${mappedCategory})`)
    } else {
      const { error: insertError } = await hubSupabase
        .from('communities')
        .insert(hubCommunity)
      
      if (insertError) {
        console.error(`Error creando ${legion.nombre}:`, insertError)
        throw insertError
      }
      console.log(`Creada: ${legion.nombre} (categoría: ${legion.tipo} -> ${mappedCategory})`)
    }
  }
}

async function syncCommunitiesToLegion(hubSupabase: any, legionSupabase: any) {
  console.log('Sincronizando comunidades hacia Legion Hack MX...')
  
  const { toLegion } = await loadCategoryMappings(hubSupabase)
  
  const { data: hubCommunities, error: hubError } = await hubSupabase
    .from('communities')
    .select('*')
    .eq('status', 'active')
  
  if (hubError) throw hubError

  for (const hub of hubCommunities as HubCommunity[]) {
    const mappedType = toLegion[hub.category] || hub.category
    const legionCommunity: Partial<LegionCommunity> = {
      nombre: hub.name,
      tipo: mappedType,
      descripcion: hub.description,
      lider_id: hub.created_by,
      miembros_count: hub.members_count || 0,
      ubicacion: hub.location,
      imagen_url: hub.logo_url,
      tags: hub.topics || []
    }

    const { data: existing } = await legionSupabase
      .from('communities')
      .select('id')
      .eq('nombre', hub.name)
      .single()

    if (existing) {
      await legionSupabase
        .from('communities')
        .update(legionCommunity)
        .eq('id', existing.id)
      console.log(`Actualizada en Legion: ${hub.name} (categoría: ${hub.category} -> ${mappedType})`)
    } else {
      await legionSupabase
        .from('communities')
        .insert(legionCommunity)
      console.log(`Creada en Legion: ${hub.name} (categoría: ${hub.category} -> ${mappedType})`)
    }
  }
}
