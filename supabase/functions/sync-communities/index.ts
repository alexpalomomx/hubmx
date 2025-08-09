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

// En Legion Hack, los usuarios tienen comunidad_id directamente en la tabla users
interface LegionUser {
  id: string
  auth_user_id?: string
  nombre?: string
  correo?: string
  nickname?: string
  telefono?: string
  comunidad_id?: string
  estado?: string
  created_at?: string
  updated_at?: string
}

interface HubMember {
  id: string
  community_id: string
  nickname: string
  phone: string
  full_name?: string
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

  // Obtener mapa id -> nombre de comunidades en Legion
  const { data: legionCommunities, error: commErr } = await legionSupabase
    .from('communities')
    .select('id,nombre')
  if (commErr) {
    console.error('Error obteniendo comunidades (map) de Legion:', commErr)
  }
  const legionCommunityMap = new Map<string, string>()
  for (const c of (legionCommunities || [])) {
    legionCommunityMap.set(c.id, c.nombre)
  }

  // Obtener usuarios de Legion que tienen comunidad_id
  const { data: legionUsers, error: legionError } = await legionSupabase
    .from('users')
    .select('*')
    .not('comunidad_id', 'is', null)

  if (legionError) {
    console.error('Error obteniendo usuarios de Legion:', legionError)
    return
  }

  console.log(`Encontrados ${legionUsers?.length || 0} usuarios con comunidad en Legion Hack MX`)

  for (const legionUser of legionUsers as LegionUser[]) {
    if (!legionUser.comunidad_id || !legionUser.telefono || !legionUser.nickname) {
      continue // Saltar usuarios sin datos completos
    }

    // Resolver nombre de comunidad a partir del id de Legion
    const legionCommunityName = legionCommunityMap.get(legionUser.comunidad_id)
    if (!legionCommunityName) {
      console.log(`No se encontró nombre de comunidad para id: ${legionUser.comunidad_id}`)
      continue
    }

    // Buscar la comunidad en HUB por nombre (ya sincronizada previamente)
    const { data: hubCommunity } = await hubSupabase
      .from('communities')
      .select('id')
      .eq('name', legionCommunityName)
      .single()

    if (!hubCommunity) {
      console.log(`Comunidad no encontrada en HUB: ${legionCommunityName}`)
      continue
    }

    // Verificar si el miembro ya existe en HUB (por teléfono en la misma comunidad)
    const { data: existing } = await hubSupabase
      .from('community_members')
      .select('id')
      .eq('community_id', hubCommunity.id)
      .eq('phone', legionUser.telefono)
      .single()

    const hubMember: Partial<HubMember> = {
      community_id: hubCommunity.id,
      nickname: legionUser.nickname,
      phone: legionUser.telefono,
      full_name: legionUser.nombre,
      status: legionUser.estado === 'activo' ? 'active' : 'inactive'
    }

    if (existing) {
      // Actualizar existente
      const { error: updErr } = await hubSupabase
        .from('community_members')
        .update(hubMember)
        .eq('id', existing.id)
      if (updErr) console.error('Error actualizando miembro:', updErr)
      else console.log(`Miembro actualizado: ${legionUser.nickname}`)
    } else {
      // Crear nuevo
      const { error: insErr } = await hubSupabase
        .from('community_members')
        .insert(hubMember)
      if (insErr) console.error('Error creando miembro:', insErr)
      else console.log(`Miembro creado: ${legionUser.nickname}`)
    }
  }
}

async function syncMembersToLegion(hubSupabase: any, legionSupabase: any) {
  console.log('Sincronizando miembros hacia Legion Hack MX...')

  // Mapa nombre -> id de comunidades en Legion
  const { data: legionCommunities, error: lCommErr } = await legionSupabase
    .from('communities')
    .select('id,nombre')
  if (lCommErr) {
    console.error('Error obteniendo comunidades de Legion:', lCommErr)
    return
  }
  const legionNameToId = new Map<string, string>()
  for (const c of (legionCommunities || [])) {
    legionNameToId.set(c.nombre, c.id)
  }
  
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
    const legionCommunityId = legionNameToId.get(hubMember.communities.name)
    if (!legionCommunityId) {
      console.log(`No se encontró comunidad en Legion para: ${hubMember.communities.name}`)
      continue
    }

    // Buscar si existe un usuario en Legion con el mismo teléfono
    const { data: existingUser } = await legionSupabase
      .from('users')
      .select('id')
      .eq('telefono', hubMember.phone)
      .maybeSingle()

    const legionUser: Partial<LegionUser> = {
      comunidad_id: legionCommunityId,
      nickname: hubMember.nickname,
      nombre: hubMember.full_name || null,
      telefono: hubMember.phone,
      estado: hubMember.status === 'active' ? 'activo' : 'inactivo'
    }

    if (existingUser) {
      await legionSupabase
        .from('users')
        .update(legionUser)
        .eq('id', existingUser.id)
      console.log(`Usuario actualizado en Legion: ${hubMember.nickname}`)
    } else {
      await legionSupabase
        .from('users')
        .insert(legionUser)
      console.log(`Usuario creado en Legion: ${hubMember.nickname}`)
    }
  }
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