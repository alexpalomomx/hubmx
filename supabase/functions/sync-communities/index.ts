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

interface LegionMember {
  id: string
  community_id: string
  nickname: string
  phone: string
  joined_at: string
  status: string
}

interface HubMember {
  id: string
  community_id: string
  nickname: string
  phone: string
  joined_at: string
  status: string
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
    
    // Cliente del HUB (actual)
    const hubSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Cliente de Legion Hack MX
    const legionSupabase = createClient(
      Deno.env.get('LEGION_SUPABASE_URL') ?? '',
      Deno.env.get('LEGION_SUPABASE_KEY') ?? ''
    )

    if (action === 'sync') {
      if (direction === 'from_legion' || direction === 'bidirectional') {
        await syncFromLegion(legionSupabase, hubSupabase)
        await syncMembersFromLegion(legionSupabase, hubSupabase)
      }
      
      if (direction === 'to_legion' || direction === 'bidirectional') {
        await syncToLegion(hubSupabase, legionSupabase)
        await syncMembersToLegion(hubSupabase, legionSupabase)
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Sincronización completada' }),
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

async function syncFromLegion(legionSupabase: any, hubSupabase: any) {
  console.log('Sincronizando desde Legion Hack MX...')
  
  // Obtener comunidades de Legion
  const { data: legionCommunities, error: legionError } = await legionSupabase
    .from('communities')
    .select('*')
  
  if (legionError) {
    console.error('Error obteniendo comunidades de Legion:', legionError)
    throw legionError
  }
  
  console.log(`Encontradas ${legionCommunities?.length || 0} comunidades en Legion Hack MX`)
  if (legionCommunities && legionCommunities.length > 0) {
    console.log('Primera comunidad:', JSON.stringify(legionCommunities[0], null, 2))
  }

  for (const legion of legionCommunities as LegionCommunity[]) {
    // Mapear estructura de Legion a HUB
    const hubCommunity: Partial<HubCommunity> = {
      name: legion.nombre,
      category: mapCategoryFromLegion(legion.tipo),
      description: legion.descripcion,
      created_by: null, // Establecer como null para evitar problemas de foreign key
      members_count: legion.miembros_count || 0,
      location: legion.ubicacion,
      logo_url: legion.imagen_url,
      topics: legion.tags || [],
      status: 'active'
    }

    // Verificar si ya existe en HUB
    const { data: existing } = await hubSupabase
      .from('communities')
      .select('id')
      .eq('name', legion.nombre)
      .single()

    if (existing) {
      // Actualizar existente
      const { error: updateError } = await hubSupabase
        .from('communities')
        .update(hubCommunity)
        .eq('id', existing.id)
      
      if (updateError) {
        console.error(`Error actualizando ${legion.nombre}:`, updateError)
        throw updateError
      }
      console.log(`Actualizada: ${legion.nombre}`)
    } else {
      // Crear nueva
      const { error: insertError } = await hubSupabase
        .from('communities')
        .insert(hubCommunity)
      
      if (insertError) {
        console.error(`Error creando ${legion.nombre}:`, insertError)
        throw insertError
      }
      console.log(`Creada: ${legion.nombre}`)
    }
  }
}

async function syncToLegion(hubSupabase: any, legionSupabase: any) {
  console.log('Sincronizando hacia Legion Hack MX...')
  
  // Obtener comunidades del HUB
  const { data: hubCommunities, error: hubError } = await hubSupabase
    .from('communities')
    .select('*')
    .eq('status', 'active')
  
  if (hubError) throw hubError

  for (const hub of hubCommunities as HubCommunity[]) {
    // Mapear estructura de HUB a Legion
    const legionCommunity: Partial<LegionCommunity> = {
      nombre: hub.name,
      tipo: mapCategoryToLegion(hub.category),
      descripcion: hub.description,
      lider_id: hub.created_by,
      miembros_count: hub.members_count || 0,
      ubicacion: hub.location,
      imagen_url: hub.logo_url,
      tags: hub.topics || []
    }

    // Verificar si ya existe en Legion
    const { data: existing } = await legionSupabase
      .from('communities')
      .select('id')
      .eq('nombre', hub.name)
      .single()

    if (existing) {
      // Actualizar existente
      await legionSupabase
        .from('communities')
        .update(legionCommunity)
        .eq('id', existing.id)
      console.log(`Actualizada en Legion: ${hub.name}`)
    } else {
      // Crear nueva
      await legionSupabase
        .from('communities')
        .insert(legionCommunity)
      console.log(`Creada en Legion: ${hub.name}`)
    }
  }
}

function mapCategoryFromLegion(legionType: string): string {
  const mapping: Record<string, string> = {
    'tech': 'tecnologia',
    'education': 'educacion',
    'business': 'emprendimiento',
    'social': 'social',
    'cultural': 'cultura'
  }
  return mapping[legionType] || 'otros'
}

async function syncMembersFromLegion(legionSupabase: any, hubSupabase: any) {
  console.log('Sincronizando miembros desde Legion Hack MX...')
  
  // Obtener miembros de Legion
  const { data: legionMembers, error: legionError } = await legionSupabase
    .from('community_members')
    .select('*')
  
  if (legionError) {
    console.error('Error obteniendo miembros de Legion:', legionError)
    return // No fallar si no existe la tabla de miembros
  }
  
  console.log(`Encontrados ${legionMembers?.length || 0} miembros en Legion Hack MX`)

  for (const legionMember of legionMembers as LegionMember[]) {
    // Obtener la comunidad correspondiente en HUB
    const { data: hubCommunity } = await hubSupabase
      .from('communities')
      .select('id')
      .eq('name', legionMember.community_id) // Asumiendo que community_id contiene el nombre
      .single()

    if (!hubCommunity) continue

    // Verificar si el miembro ya existe en HUB
    const { data: existing } = await hubSupabase
      .from('community_members')
      .select('id')
      .eq('community_id', hubCommunity.id)
      .eq('phone', legionMember.phone)
      .single()

    const hubMember: Partial<HubMember> = {
      community_id: hubCommunity.id,
      nickname: legionMember.nickname,
      phone: legionMember.phone,
      status: legionMember.status || 'active'
    }

    if (existing) {
      // Actualizar existente
      await hubSupabase
        .from('community_members')
        .update(hubMember)
        .eq('id', existing.id)
      console.log(`Miembro actualizado: ${legionMember.nickname}`)
    } else {
      // Crear nuevo
      await hubSupabase
        .from('community_members')
        .insert(hubMember)
      console.log(`Miembro creado: ${legionMember.nickname}`)
    }
  }
}

async function syncMembersToLegion(hubSupabase: any, legionSupabase: any) {
  console.log('Sincronizando miembros hacia Legion Hack MX...')
  
  // Obtener miembros del HUB
  const { data: hubMembers, error: hubError } = await hubSupabase
    .from('community_members')
    .select(`
      *,
      communities!inner(name)
    `)
  
  if (hubError) {
    console.error('Error obteniendo miembros del HUB:', hubError)
    return
  }

  console.log(`Encontrados ${hubMembers?.length || 0} miembros en HUB`)

  for (const hubMember of hubMembers as any[]) {
    // Verificar si el miembro ya existe en Legion
    const { data: existing } = await legionSupabase
      .from('community_members')
      .select('id')
      .eq('community_id', hubMember.communities.name) // Usar el nombre de la comunidad
      .eq('phone', hubMember.phone)
      .single()

    const legionMember: Partial<LegionMember> = {
      community_id: hubMember.communities.name,
      nickname: hubMember.nickname,
      phone: hubMember.phone,
      status: hubMember.status || 'active'
    }

    if (existing) {
      // Actualizar existente
      await legionSupabase
        .from('community_members')
        .update(legionMember)
        .eq('id', existing.id)
      console.log(`Miembro actualizado en Legion: ${hubMember.nickname}`)
    } else {
      // Crear nuevo
      await legionSupabase
        .from('community_members')
        .insert(legionMember)
      console.log(`Miembro creado en Legion: ${hubMember.nickname}`)
    }
  }
}

function mapCategoryFromLegion(legionType: string): string {
  const mapping: Record<string, string> = {
    'tech': 'tecnologia',
    'education': 'educacion',
    'business': 'emprendimiento',
    'social': 'social',
    'cultural': 'cultura'
  }
  return mapping[legionType] || 'otros'
}

function mapCategoryToLegion(hubCategory: string): string {
  const mapping: Record<string, string> = {
    'tecnologia': 'tech',
    'educacion': 'education',
    'emprendimiento': 'business',
    'social': 'social',
    'cultura': 'cultural'
  }
  return mapping[hubCategory] || 'tech'
}