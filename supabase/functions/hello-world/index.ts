const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface RequestPayload {
  name?: string;
  message?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Parse request body
    let payload: RequestPayload = {}
    
    if (req.method === 'POST') {
      try {
        payload = await req.json()
      } catch (error) {
        console.log('No JSON body provided, using defaults')
      }
    }

    // Extract name from payload or use default
    const name = payload.name || 'World'
    const userMessage = payload.message || 'Hello from Supabase Edge Function!'

    // Create response data
    const responseData = {
      success: true,
      message: `Hello ${name}!`,
      userMessage: userMessage,
      timestamp: new Date().toISOString(),
      method: req.method,
      functionName: 'hello-world'
    }

    console.log('Hello World function executed successfully:', responseData)

    // Return successful response
    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    console.error('Error in hello-world function:', error)

    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
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