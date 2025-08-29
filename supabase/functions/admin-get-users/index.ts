// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Client with the requester JWT to check permissions
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });

  // Service client to perform admin actions
  const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    if (!(req.method === "POST" || req.method === "GET")) {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure requester is admin
    const { data: authUserData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authUserData.user) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requesterId = authUserData.user.id;
    const { data: roleRow, error: roleErr } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", requesterId)
      .maybeSingle();

    if (roleErr || roleRow?.role !== "admin") {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get profiles first
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('display_name');

    if (profilesError) {
      return new Response(JSON.stringify({ error: profilesError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user roles and emails using service role
    const usersWithDetails = await Promise.all(
      profiles.map(async (profile) => {
        const [{ data: roleData }, { data: userData, error: userError }] = await Promise.all([
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id)
            .single(),
          service.auth.admin.getUserById(profile.user_id)
        ]);

        return {
          ...profile,
          role: roleData?.role || 'user',
          email: userError ? 'Email no disponible' : userData.user?.email || 'Sin email'
        };
      })
    );

    return new Response(
      JSON.stringify({ users: usersWithDetails }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});