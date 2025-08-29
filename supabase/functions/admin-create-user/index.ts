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
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, display_name, role, frontend_url } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email es obligatorio" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Derivar dominio para redirect de forma robusta
    const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
    const forwardedHost = req.headers.get("x-forwarded-host");
    const referer = req.headers.get("referer");
    const headerOrigin = req.headers.get("origin");

    // Preferir valor explícito desde el cliente; luego Origin/Referer; luego X-Forwarded-Host
    const redirectBase = frontend_url
      || headerOrigin
      || (referer ? new URL(referer).origin : null)
      || (forwardedHost ? `${forwardedProto}://${forwardedHost}` : null);

    const allowedRoles = ["user", "admin", "coordinator", "community_leader", "collaborator"];
    if (role && !allowedRoles.includes(role)) {
      return new Response(JSON.stringify({ error: "Rol inválido" }), {
        status: 400,
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

    // Create or find auth user via invitation
    const { data: created, error: createErr } = await service.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: display_name || email.split("@")[0],
        invited_by_admin: true,
      },
      redirectTo: `${redirectBase || "https://" + new URL(SUPABASE_URL).host}/auth`,
    });

    let newUserId: string | null = created?.user?.id ?? null;

    // If user already exists, try to find the user id by email and continue gracefully
    if ((!newUserId || createErr) && (createErr?.message || "").toLowerCase().includes("already")) {
      const { data: list, error: listErr } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (!listErr && list?.users?.length) {
        const found = list.users.find((u: any) => (u.email || u.user_metadata?.email) === email);
        if (found) newUserId = found.id;
      }
    }

    if (!newUserId) {
      return new Response(
        JSON.stringify({ error: createErr?.message || "No se pudo obtener el ID de usuario" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Creating user profile for user:", newUserId);
    
    // Ensure profile (idempotent)
    const { error: profileErr } = await service
      .from("profiles")
      .upsert(
        { user_id: newUserId, display_name: display_name || email.split("@")[0] },
        { onConflict: "user_id", ignoreDuplicates: true }
      );
    if (profileErr && (profileErr as any).code !== "23505") {
      console.error("Profile creation error:", profileErr);
      return new Response(JSON.stringify({ error: profileErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Profile created successfully. Now assigning role:", role);

    // Assign role if provided and not 'user'
    if (role && role !== "user") {
      console.log("Attempting to assign role:", role, "to user:", newUserId);
      
      // First check if user already has a role
      const { data: existingRole, error: checkRoleErr } = await service
        .from("user_roles")
        .select("*")
        .eq("user_id", newUserId)
        .maybeSingle();
      
      console.log("Existing role check result:", existingRole, checkRoleErr);
      
      if (existingRole && existingRole.role === "user") {
        // Update the existing user role instead of inserting
        const { error: updateRoleErr } = await service
          .from("user_roles")
          .update({ role })
          .eq("user_id", newUserId)
          .eq("role", "user");
        
        console.log("Role update result, error:", updateRoleErr);
        
        if (updateRoleErr) {
          console.error("Role update error details:", updateRoleErr);
          return new Response(JSON.stringify({ error: updateRoleErr.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        // Insert the new role
        const { error: userRoleErr } = await service
          .from("user_roles")
          .insert({ user_id: newUserId, role });
        
        console.log("Role insertion result, error:", userRoleErr);
        
        if (userRoleErr) {
          console.error("Role assignment error details:", userRoleErr);
          return new Response(JSON.stringify({ error: userRoleErr.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitación enviada por email",
        user_id: newUserId 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});