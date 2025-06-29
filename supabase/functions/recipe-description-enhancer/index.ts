import { corsHeaders } from '../_shared/cors.ts'

interface RequestPayload {
  description: string;
  title?: string;
  ingredients?: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
}

// Get API key from environment variables
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

async function testGeminiConnection(): Promise<boolean> {
  try {
    console.log('🔍 Testing Gemini connection...')
    
    if (!GEMINI_API_KEY) {
      console.error('❌ Gemini API key not found in environment variables')
      return false
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      console.log('✅ Gemini connection successful')
      return true
    } else {
      console.error('❌ Gemini connection failed:', response.status, response.statusText)
      return false
    }
  } catch (error) {
    console.error('❌ Gemini connection error:', error)
    return false
  }
}

async function enhanceDescription(description: string, title?: string, ingredients?: Array<{name: string; amount: string; unit: string}>): Promise<string> {
  try {
    console.log('🔄 Enhancing recipe description with Gemini...')
    
    // Prepare ingredients text if available
    let ingredientsText = '';
    if (ingredients && ingredients.length > 0) {
      ingredientsText = 'Ingredients: ' + ingredients
        .map(ing => `${ing.amount} ${ing.unit} ${ing.name}`)
        .join(', ');
    }
    
    // Prepare the prompt
    const prompt = `
Enhance this recipe description to make it more appealing, informative, and SEO-friendly. 
The enhanced description should:
- Be 2-3 sentences long (around 50-80 words)
- Highlight key flavors, textures, and cooking methods
- Mention health benefits if applicable
- Include when to serve this dish (breakfast, dinner, special occasions, etc.)
- Be written in an engaging, conversational tone
- NOT include generic phrases like "This recipe is" or "This dish is"
- Start with a strong, descriptive sentence that hooks the reader

Original Recipe Title: ${title || 'Not provided'}
${ingredientsText}
Original Description: ${description}

Provide ONLY the enhanced description text with no additional commentary, explanations, or formatting.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        }
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API')
    }

    const enhancedDescription = data.candidates[0].content.parts[0].text.trim()
    console.log('✅ Description enhanced successfully')
    
    return enhancedDescription
  } catch (error) {
    console.error('❌ Error enhancing description with Gemini:', error)
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
    console.log('🚀 Recipe Description Enhancer Edge Function started')
    
    if (req.method !== 'POST') {
      throw new Error('Only POST method is allowed')
    }

    // Parse request body
    const payload: RequestPayload = await req.json()
    
    if (!payload.description || payload.description.trim().length === 0) {
      throw new Error('Description is required')
    }

    console.log('📋 Description received:', payload.description.substring(0, 100) + (payload.description.length > 100 ? '...' : ''))
    
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured in environment variables')
    }

    // Test API connection
    console.log('🔍 Testing API connection...')
    const geminiConnected = await testGeminiConnection()

    if (!geminiConnected) {
      throw new Error('Failed to connect to Gemini API. Please check your API key configuration.')
    }

    // Enhance the description
    const enhancedDescription = await enhanceDescription(
      payload.description.trim(),
      payload.title,
      payload.ingredients
    )

    // Prepare response
    const responseData = {
      success: true,
      original_description: payload.description.trim(),
      enhanced_description: enhancedDescription,
      timestamp: new Date().toISOString()
    }

    console.log('✅ Description enhancement completed successfully')

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
    console.error('❌ Error in recipe-description-enhancer function:', error)

    const errorResponse = {
      success: false,
      error: 'Description enhancement failed',
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