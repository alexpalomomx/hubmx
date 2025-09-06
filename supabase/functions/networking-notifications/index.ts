import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      user_id, 
      notification_type, 
      title, 
      message, 
      data = {} 
    } = await req.json();
    
    if (!user_id || !notification_type || !title || !message) {
      throw new Error('Missing required notification data');
    }

    console.log('Creating notification:', { user_id, notification_type, title });

    // Insert notification into database
    const { data: notification, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id,
        notification_type,
        title,
        message,
        data
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting notification:', insertError);
      throw insertError;
    }

    // Track analytics for notification
    const { error: analyticsError } = await supabase
      .from('networking_analytics')
      .insert({
        user_id,
        action_type: 'notification_sent',
        metadata: {
          notification_type,
          title,
          notification_id: notification.id
        }
      });

    if (analyticsError) {
      console.log('Warning: Could not track analytics:', analyticsError.message);
    }

    console.log('Notification created successfully:', notification.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in networking-notifications function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});