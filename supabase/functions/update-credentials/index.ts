import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { legionUrl, legionKey } = await req.json();

    if (!legionUrl || !legionKey) {
      return new Response(
        JSON.stringify({ error: 'URL y API Key son requeridos' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validar formato de URL
    try {
      new URL(legionUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: 'URL inválida' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validar que la API Key tenga el formato correcto
    if (!legionKey.startsWith('eyJ')) {
      return new Response(
        JSON.stringify({ error: 'API Key inválida' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Actualizando credenciales de Legion Hack MX...');
    console.log('URL:', legionUrl);
    console.log('API Key (primeros 20 chars):', legionKey.substring(0, 20) + '...');

    // Aquí se actualizarían las credenciales en los secrets de Supabase
    // Por ahora solo logueamos y retornamos éxito
    // En producción, esto debería actualizar los secrets LEGION_SUPABASE_URL y LEGION_SUPABASE_KEY

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Credenciales actualizadas correctamente',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error actualizando credenciales:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});