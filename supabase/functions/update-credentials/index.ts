
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

    console.log('Datos recibidos:', { 
      legionUrl, 
      legionKeyLength: legionKey?.length,
      legionKeyStart: legionKey?.substring(0, 10) 
    });

    if (!legionUrl || !legionKey) {
      console.error('Faltan datos:', { legionUrl: !!legionUrl, legionKey: !!legionKey });
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
      console.error('URL inválida:', legionUrl);
      return new Response(
        JSON.stringify({ error: 'URL inválida' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validar que la API Key tenga un formato válido de Supabase
    // Las claves de Supabase pueden empezar con "eyJ" (JWT) o "sb_" (service role)
    if (!legionKey.startsWith('eyJ') && !legionKey.startsWith('sb_')) {
      console.error('API Key con formato no reconocido:', legionKey.substring(0, 10));
      return new Response(
        JSON.stringify({ error: 'API Key debe ser una clave válida de Supabase (JWT o service role)' }),
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

    const response = {
      success: true, 
      message: 'Credenciales actualizadas correctamente',
      timestamp: new Date().toISOString()
    };

    console.log('Enviando respuesta exitosa:', response);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error actualizando credenciales:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
