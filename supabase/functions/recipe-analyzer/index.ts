import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface RecipeData {
  title: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
  instructions: string[];
}

interface RequestPayload {
  recipeData: RecipeData;
  recipeId: string;
}

interface AnalysisResult {
  health_tags: string[];
  dietary_tags: string[];
  health_benefits: string[];
  nutritional_info: {
    calories_estimate: number;
    protein_grams: number;
    carbs_grams: number;
    fat_grams: number;
    fiber_grams: number;
    sodium_mg: number;
  };
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Get API keys from environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

async function testOpenAIConnection(): Promise<boolean> {
  try {
    console.log('🔍 Testing OpenAI connection...')
    
    if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not found in environment variables')
      return false
    }
    
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      console.log('✅ OpenAI connection successful')
      return true
    } else {
      console.error('❌ OpenAI connection failed:', response.status, response.statusText)
      return false
    }
  } catch (error) {
    console.error('❌ OpenAI connection error:', error)
    return false
  }
}

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

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log('🔄 Generating OpenAI embedding...')
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small',
        dimensions: 1536
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      throw new Error('Invalid embedding response from OpenAI')
    }

    console.log('✅ OpenAI embedding generated successfully')
    return data.data[0].embedding
  } catch (error) {
    console.error('❌ Error generating embedding:', error)
    throw error
  }
}

async function analyzeRecipeWithGemini(recipeData: RecipeData): Promise<AnalysisResult> {
  try {
    console.log('🔄 Analyzing recipe with Gemini 2.5 Flash...')
    
    // Prepare recipe text for analysis
    const ingredientsList = recipeData.ingredients
      .map(ing => `${ing.amount} ${ing.unit} ${ing.name}`)
      .join(', ')
    
    const instructionsText = recipeData.instructions.join(' ')
    
    const recipeText = `
Recipe: ${recipeData.title}
Description: ${recipeData.description}
Prep Time: ${recipeData.prep_time} minutes
Cook Time: ${recipeData.cook_time} minutes
Servings: ${recipeData.servings}
Difficulty: ${recipeData.difficulty}
Ingredients: ${ingredientsList}
Instructions: ${instructionsText}
    `.trim()

    const prompt = `
Analyze this recipe and provide health and nutritional information. Return ONLY a JSON object with no other text or explanation.

Requirements:
- health_tags: 2-5 specific health characteristics (heart-healthy, immune-boosting, anti-inflammatory, etc.)
- dietary_tags: applicable diet restrictions/types (empty array if none apply)
- health_benefits: 2-4 specific, scientifically-backed health benefits
- nutritional_info: realistic estimates per serving based on ingredients
- Consider cooking methods, ingredient combinations, and portion sizes
- Be conservative with health claims - only include well-established benefits
- Return ONLY the JSON object, no other text or explanation

Recipe to analyze:
${recipeText}

Expected JSON format:
{
  "health_tags": ["heart-healthy", "high-protein", "low-sodium", "antioxidant-rich"],
  "dietary_tags": ["gluten-free", "dairy-free", "vegan", "keto", "paleo", "low-carb"],
  "health_benefits": ["Supports heart health", "Rich in omega-3 fatty acids", "Good source of fiber"],
  "nutritional_info": {
    "calories_estimate": 450,
    "protein_grams": 35,
    "carbs_grams": 25,
    "fat_grams": 12,
    "fiber_grams": 8,
    "sodium_mg": 300
  }
}
`

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
          temperature: 0.1,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 1000,
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

    const generatedText = data.candidates[0].content.parts[0].text.trim()
    console.log('📝 Gemini raw response:', generatedText)

    // Extract JSON from the response
    let jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Try to find JSON in code blocks
      jsonMatch = generatedText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1]
      }
    }

    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response')
    }

    const analysisResult = JSON.parse(jsonMatch[0])
    
    // Validate the structure
    if (!analysisResult.health_tags || !analysisResult.dietary_tags || 
        !analysisResult.health_benefits || !analysisResult.nutritional_info) {
      throw new Error('Invalid analysis result structure from Gemini')
    }

    console.log('✅ Gemini analysis completed successfully')
    return analysisResult
  } catch (error) {
    console.error('❌ Error analyzing recipe with Gemini:', error)
    throw error
  }
}

async function updateRecipeInDatabase(recipeId: string, embedding: number[], analysisResult: AnalysisResult) {
  try {
    console.log('🔄 Updating recipe in database...')
    
    const { data, error } = await supabase
      .from('recipes')
      .update({
        health_tags: analysisResult.health_tags,
        dietary_tags: analysisResult.dietary_tags,
        health_benefits: analysisResult.health_benefits,
        nutritional_info: analysisResult.nutritional_info,
        embedding: `[${embedding.join(',')}]`
      })
      .eq('id', recipeId)
      .select()

    if (error) {
      throw error
    }

    console.log('✅ Recipe updated in database successfully')
    return data
  } catch (error) {
    console.error('❌ Error updating recipe in database:', error)
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
    console.log('🚀 Recipe Analyzer Edge Function started')
    
    if (req.method !== 'POST') {
      throw new Error('Only POST method is allowed')
    }

    // Check if API keys are available
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured in environment variables')
    }

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured in environment variables')
    }

    // Parse request body
    const payload: RequestPayload = await req.json()
    
    if (!payload.recipeData) {
      throw new Error('Recipe data is required')
    }

    if (!payload.recipeId) {
      throw new Error('Recipe ID is required')
    }

    console.log('📋 Recipe data received:', {
      title: payload.recipeData.title,
      ingredients: payload.recipeData.ingredients.length,
      instructions: payload.recipeData.instructions.length,
      recipeId: payload.recipeId
    })

    // Test API connections
    console.log('🔍 Testing API connections...')
    const [openaiConnected, geminiConnected] = await Promise.all([
      testOpenAIConnection(),
      testGeminiConnection()
    ])

    const connectionStatus = {
      openai: openaiConnected,
      gemini: geminiConnected
    }

    console.log('📊 Connection status:', connectionStatus)

    if (!openaiConnected) {
      throw new Error('Failed to connect to OpenAI API. Please check environment configuration.')
    }

    if (!geminiConnected) {
      throw new Error('Failed to connect to Gemini API. Please check environment configuration.')
    }

    // Prepare text for embedding
    const ingredientsList = payload.recipeData.ingredients
      .map(ing => `${ing.amount} ${ing.unit} ${ing.name}`)
      .join(', ')
    
    const embeddingText = `${payload.recipeData.title}. ${payload.recipeData.description}. Ingredients: ${ingredientsList}. Instructions: ${payload.recipeData.instructions.join(' ')}`

    // Generate embedding and analyze recipe in parallel
    console.log('🔄 Starting parallel processing...')
    const [embedding, analysisResult] = await Promise.all([
      generateEmbedding(embeddingText),
      analyzeRecipeWithGemini(payload.recipeData)
    ])

    // Update database with results
    const databaseResult = await updateRecipeInDatabase(payload.recipeId, embedding, analysisResult)

    // Prepare response
    const responseData = {
      success: true,
      message: 'Recipe analyzed and updated successfully',
      connectionStatus,
      analysisResult,
      embedding: {
        dimensions: embedding.length,
        preview: embedding.slice(0, 5) // Show first 5 dimensions for debugging
      },
      databaseUpdated: true,
      timestamp: new Date().toISOString(),
      processingTime: {
        embedding: 'Generated with OpenAI text-embedding-3-small',
        analysis: 'Analyzed with Gemini 2.5 Flash'
      }
    }

    console.log('✅ Recipe analysis completed successfully')
    console.log('📊 Final response:', {
      success: responseData.success,
      healthTags: analysisResult.health_tags.length,
      dietaryTags: analysisResult.dietary_tags.length,
      healthBenefits: analysisResult.health_benefits.length,
      embeddingDimensions: embedding.length,
      databaseUpdated: responseData.databaseUpdated
    })

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
    console.error('❌ Error in recipe-analyzer function:', error)

    const errorResponse = {
      success: false,
      error: 'Recipe analysis failed',
      message: error.message,
      timestamp: new Date().toISOString(),
      connectionStatus: {
        openai: false,
        gemini: false
      }
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