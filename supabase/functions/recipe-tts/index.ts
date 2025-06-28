import { corsHeaders } from '../_shared/cors.ts'

interface RequestPayload {
  text: string;
  voice_id?: string;
  model_id?: string;
}

// Get ElevenLabs API key from environment variables
const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')

// Default voice settings - Updated voice ID
const DEFAULT_VOICE_ID = 'v8DWAeuEGQSfwxqdH9t2' // Updated voice ID
const DEFAULT_MODEL_ID = 'eleven_monolingual_v1'

async function testElevenLabsConnection(): Promise<boolean> {
  try {
    console.log('🔍 Testing ElevenLabs connection...')
    
    if (!ELEVENLABS_API_KEY) {
      console.error('❌ ElevenLabs API key not found in environment variables')
      return false
    }
    
    const response = await fetch('https://api.elevenlabs.io/v2/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      },
    })

    if (response.ok) {
      console.log('✅ ElevenLabs connection successful')
      return true
    } else {
      console.error('❌ ElevenLabs connection failed:', response.status, response.statusText)
      return false
    }
  } catch (error) {
    console.error('❌ ElevenLabs connection error:', error)
    return false
  }
}

async function generateSpeech(text: string, voiceId: string, modelId: string): Promise<ArrayBuffer> {
  try {
    console.log('🔄 Generating speech with ElevenLabs...')
    console.log('📝 Text length:', text.length, 'characters')
    console.log('🎤 Voice ID:', voiceId)
    console.log('🤖 Model ID:', modelId)
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    })

    if (!response.ok) {
      let errorMessage = `ElevenLabs API error: ${response.status} ${response.statusText}`
      
      try {
        // Safely extract error body with proper error handling
        const errorBody = await response.text()
        
        // Ensure errorBody is a valid string and truncate if too long
        if (errorBody && typeof errorBody === 'string' && errorBody.trim().length > 0) {
          const truncatedError = errorBody.length > 500 ? errorBody.substring(0, 500) + '...' : errorBody
          errorMessage += ` - ${truncatedError}`
        }
      } catch (parseError) {
        console.error('❌ Failed to parse error response from ElevenLabs:', parseError)
        // Don't include the unparseable error body in the message
      }
      
      throw new Error(errorMessage)
    }

    const audioBuffer = await response.arrayBuffer()
    console.log('✅ Speech generated successfully, audio size:', audioBuffer.byteLength, 'bytes')
    
    return audioBuffer
  } catch (error) {
    console.error('❌ Error generating speech:', error)
    throw error
  }
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
    console.log('🚀 Recipe TTS Edge Function started')
    
    if (req.method !== 'POST') {
      throw new Error('Only POST method is allowed')
    }

    // Check if request has a body
    const contentLength = req.headers.get('content-length')
    if (!contentLength || parseInt(contentLength) === 0) {
      console.error('❌ Request has no body or empty body')
      throw new Error('Request body is empty')
    }

    // Log request headers for debugging
    console.log('📋 Request headers:')
    for (const [key, value] of req.headers.entries()) {
      // Don't log authorization headers
      if (!key.toLowerCase().includes('auth') && !key.toLowerCase().includes('key')) {
        console.log(`${key}: ${value}`)
      }
    }

    // Parse request body with robust error handling
    let payload: RequestPayload
    
    try {
      // Clone the request to avoid consuming the body
      const clonedReq = req.clone()
      
      // First, read the request body as text
      const bodyText = await clonedReq.text()
      console.log('📋 Raw request body length:', bodyText.length)
      
      // Check if body is empty
      if (!bodyText || bodyText.trim().length === 0) {
        throw new Error('Request body is empty')
      }
      
      // Log first 100 characters of body for debugging (without sensitive data)
      console.log('📋 Request body preview:', bodyText.substring(0, 100).replace(/"/g, "'"))
      
      // Parse the JSON
      try {
        payload = JSON.parse(bodyText)
      } catch (jsonError) {
        console.error('❌ JSON parse error:', jsonError)
        throw new Error(`Invalid JSON format: ${jsonError.message}`)
      }
      
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError)
      throw new Error(`Invalid JSON in request body: ${parseError.message}`)
    }
    
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid request payload: must be a JSON object')
    }
    
    if (!payload.text || typeof payload.text !== 'string' || payload.text.trim().length === 0) {
      throw new Error('Text is required for speech generation and must be a non-empty string')
    }

    console.log('📋 TTS request received:', {
      textLength: payload.text.length,
      voiceId: payload.voice_id || DEFAULT_VOICE_ID,
      modelId: payload.model_id || DEFAULT_MODEL_ID
    })

    // Check if API key is available
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured in environment variables')
    }

    // Test API connection
    console.log('🔍 Testing API connection...')
    const isConnected = await testElevenLabsConnection()

    if (!isConnected) {
      throw new Error('Failed to connect to ElevenLabs API. Please check your API key configuration.')
    }

    // Prepare text for speech generation
    const textToSpeak = payload.text.trim()
    const voiceId = payload.voice_id || DEFAULT_VOICE_ID
    const modelId = payload.model_id || DEFAULT_MODEL_ID

    // Limit text length to prevent excessive API usage
    const MAX_TEXT_LENGTH = 5000 // ElevenLabs has character limits
    if (textToSpeak.length > MAX_TEXT_LENGTH) {
      throw new Error(`Text is too long. Maximum ${MAX_TEXT_LENGTH} characters allowed.`)
    }

    console.log('🔄 Starting speech generation...')
    
    // Generate speech
    const audioBuffer = await generateSpeech(textToSpeak, voiceId, modelId)

    console.log('✅ Speech generation completed successfully')
    console.log('📊 Final response:', {
      audioSize: audioBuffer.byteLength,
      contentType: 'audio/mpeg',
      voiceUsed: voiceId,
      modelUsed: modelId
    })

    // Return audio response
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('❌ Error in recipe-tts function:', error)

    // Ensure error message is always a valid string
    const errorMessage = error && typeof error.message === 'string' ? error.message : 'Unknown error occurred'

    const errorResponse = {
      success: false,
      error: 'Text-to-speech generation failed',
      message: errorMessage,
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