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

    const { user_id } = await req.json();
    
    if (!user_id) {
      throw new Error('User ID is required');
    }

    console.log('Generating suggestions for user:', user_id);

    // Get user's profile and skills
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_skills(*),
        user_interests(*),
        user_networking_profile(*)
      `)
      .eq('user_id', user_id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      throw profileError;
    }

    // Get all other users with their profiles and skills
    const { data: allUsers, error: usersError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_skills(*),
        user_interests(*),
        user_networking_profile(*)
      `)
      .neq('user_id', user_id);

    if (usersError) {
      console.error('Error fetching all users:', usersError);
      throw usersError;
    }

    // Get existing connections to avoid duplicates
    const { data: existingConnections } = await supabase
      .from('user_connections')
      .select('*')
      .or(`requester_id.eq.${user_id},requested_id.eq.${user_id}`);

    const connectedUserIds = new Set(
      existingConnections?.map(conn => 
        conn.requester_id === user_id ? conn.requested_id : conn.requester_id
      ) || []
    );

    // Get existing suggestions to avoid duplicates
    const { data: existingSuggestions } = await supabase
      .from('networking_suggestions')
      .select('suggested_user_id')
      .eq('user_id', user_id);

    const suggestedUserIds = new Set(
      existingSuggestions?.map(s => s.suggested_user_id) || []
    );

    const userSkills = userProfile.user_skills?.map(s => s.skill_name.toLowerCase()) || [];
    const userInterests = userProfile.user_interests?.map(i => i.interest_name.toLowerCase()) || [];
    const userLocation = userProfile.user_networking_profile?.location?.toLowerCase() || '';

    // Calculate match scores and generate suggestions
    const suggestions = allUsers
      .filter(user => 
        !connectedUserIds.has(user.user_id) && 
        !suggestedUserIds.has(user.user_id) &&
        user.user_networking_profile?.available_for_connections !== false
      )
      .map(potentialMatch => {
        let score = 0;
        let reasons = [];

        const matchSkills = potentialMatch.user_skills?.map(s => s.skill_name.toLowerCase()) || [];
        const matchInterests = potentialMatch.user_interests?.map(i => i.interest_name.toLowerCase()) || [];
        const matchLocation = potentialMatch.user_networking_profile?.location?.toLowerCase() || '';

        // Skills matching (40% weight)
        const commonSkills = userSkills.filter(skill => matchSkills.includes(skill));
        if (commonSkills.length > 0) {
          score += (commonSkills.length / Math.max(userSkills.length, matchSkills.length)) * 0.4;
          reasons.push(`Comparten ${commonSkills.length} habilidad(es): ${commonSkills.slice(0, 2).join(', ')}`);
        }

        // Interests matching (30% weight)
        const commonInterests = userInterests.filter(interest => matchInterests.includes(interest));
        if (commonInterests.length > 0) {
          score += (commonInterests.length / Math.max(userInterests.length, matchInterests.length)) * 0.3;
          reasons.push(`Intereses comunes: ${commonInterests.slice(0, 2).join(', ')}`);
        }

        // Location matching (20% weight)
        if (userLocation && matchLocation && userLocation === matchLocation) {
          score += 0.2;
          reasons.push(`Misma ubicación: ${matchLocation}`);
        }

        // Mentorship compatibility (10% weight)
        const userAvailableForMentoring = userProfile.user_networking_profile?.is_available_for_mentoring;
        const userSeekingMentorship = userProfile.user_networking_profile?.is_seeking_mentorship;
        const matchAvailableForMentoring = potentialMatch.user_networking_profile?.is_available_for_mentoring;
        const matchSeekingMentorship = potentialMatch.user_networking_profile?.is_seeking_mentorship;

        if ((userSeekingMentorship && matchAvailableForMentoring) || 
            (userAvailableForMentoring && matchSeekingMentorship)) {
          score += 0.1;
          reasons.push('Compatible para mentoría');
        }

        return {
          user_id,
          suggested_user_id: potentialMatch.user_id,
          match_score: Math.min(score, 1.0), // Cap at 1.0
          suggestion_reason: reasons.join(' • ') || 'Perfil interesante para networking',
          status: 'pending'
        };
      })
      .filter(suggestion => suggestion.match_score > 0.1) // Only suggest if score > 0.1
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 10); // Top 10 suggestions

    console.log(`Generated ${suggestions.length} suggestions for user ${user_id}`);

    // Insert suggestions into database
    if (suggestions.length > 0) {
      const { error: insertError } = await supabase
        .from('networking_suggestions')
        .insert(suggestions);

      if (insertError) {
        console.error('Error inserting suggestions:', insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestions_count: suggestions.length,
        suggestions 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in connection-matcher function:', error);
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