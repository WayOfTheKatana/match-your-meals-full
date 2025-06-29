import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ViewPayload {
  recipe_id: string;
  user_id?: string;
  session_id: string;
  country_code?: string;
  country_name?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    console.log('🚀 Recipe View Tracker Edge Function started')
    
    if (req.method !== 'POST') {
      throw new Error('Only POST method is allowed')
    }

    // Parse request body
    const payload: ViewPayload = await req.json()
    
    if (!payload.recipe_id) {
      throw new Error('Recipe ID is required')
    }

    if (!payload.session_id) {
      throw new Error('Session ID is required')
    }

    console.log('📋 View data received:', {
      recipe_id: payload.recipe_id,
      user_id: payload.user_id ? 'Present' : 'Not provided',
      session_id: payload.session_id,
      country: payload.country_name || 'Not provided',
      city: payload.city || 'Not provided'
    })

    // Insert view record with geolocation data
    const { data, error } = await supabase
      .from('recipe_views')
      .insert({
        recipe_id: payload.recipe_id,
        user_id: payload.user_id || null,
        session_id: payload.session_id,
        country_code: payload.country_code || null,
        country_name: payload.country_name || null,
        city: payload.city || null,
        region: payload.region || null,
        latitude: payload.latitude || null,
        longitude: payload.longitude || null,
        viewed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error recording view:', error)
      throw error
    }

    console.log('✅ View recorded successfully:', data.id)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'View recorded successfully',
        view_id: data.id,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    console.error('❌ Error in recipe-view-tracker function:', error)

    const errorResponse = {
      success: false,
      error: 'Failed to record view',
      message: error.message,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})