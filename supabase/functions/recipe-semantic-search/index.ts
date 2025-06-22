import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface SearchIntent {
  dietary_tags: string[];
  total_time?: number;
  health_tags: string[];
  health_benefits: string[];
  servings?: number;
}

interface RequestPayload {
  query: string;
  limit?: number;
}

interface RecipeResult {
  id: string;
  title: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  image_path: string;
  ingredients: any[];
  instructions: string[];
  health_tags: string[];
  dietary_tags: string[];
  health_benefits: string[];
  nutritional_info: any;
  similarity_score: number;
  creator_id: string;
  created_at: string;
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Get API keys from environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

async function extractSearchIntent(query: string): Promise<SearchIntent> {
  try {
    console.log('🔄 Extracting search intent with Gemini for query:', query)
    
    if (!GEMINI_API_KEY) {
      console.log('⚠️ Gemini API key not found, using fallback intent extraction')
      return createFallbackIntent(query)
    }
    
    const prompt = `Extract structured search intent from recipe query. Return ONLY a valid JSON object with these exact fields:

{
  "dietary_tags": [],
  "total_time": null,
  "health_tags": [],
  "health_benefits": [],
  "servings": null
}

Rules:
- dietary_tags: ["vegetarian", "vegan", "gluten-free", "dairy-free", "keto", "paleo", "low-carb"]
- total_time: number in minutes (prep + cook time combined)
- health_tags: ["high-protein", "low-carb", "heart-healthy", "low-sodium", "high-fiber", "antioxidant-rich"]
- health_benefits: ["weight-loss", "energy-boost", "immune-support", "muscle-building", "heart-health"]
- servings: number of people it serves

User query: "${query}"

Return ONLY the JSON object, no explanation:`

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
          maxOutputTokens: 300,
        }
      }),
    })

    if (!response.ok) {
      console.error('❌ Gemini API error:', response.status, response.statusText)
      return createFallbackIntent(query)
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ Invalid Gemini response structure')
      return createFallbackIntent(query)
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
      console.log('⚠️ No JSON found in Gemini response, using fallback')
      return createFallbackIntent(query)
    }

    try {
      const intent = JSON.parse(jsonMatch[0])
      
      // Validate and clean the intent
      const cleanedIntent = {
        dietary_tags: Array.isArray(intent.dietary_tags) ? intent.dietary_tags : [],
        total_time: typeof intent.total_time === 'number' ? intent.total_time : null,
        health_tags: Array.isArray(intent.health_tags) ? intent.health_tags : [],
        health_benefits: Array.isArray(intent.health_benefits) ? intent.health_benefits : [],
        servings: typeof intent.servings === 'number' ? intent.servings : null
      }
      
      console.log('✅ Search intent extracted successfully:', cleanedIntent)
      return cleanedIntent
    } catch (parseError) {
      console.error('❌ Error parsing Gemini JSON response:', parseError)
      return createFallbackIntent(query)
    }
  } catch (error) {
    console.error('❌ Error in extractSearchIntent:', error)
    return createFallbackIntent(query)
  }
}

function createFallbackIntent(query: string): SearchIntent {
  console.log('🔄 Creating fallback intent for query:', query)
  
  const lowerQuery = query.toLowerCase()
  const intent: SearchIntent = {
    dietary_tags: [],
    health_tags: [],
    health_benefits: []
  }

  // Extract dietary tags
  if (lowerQuery.includes('vegetarian')) intent.dietary_tags.push('vegetarian')
  if (lowerQuery.includes('vegan')) intent.dietary_tags.push('vegan')
  if (lowerQuery.includes('gluten-free') || lowerQuery.includes('gluten free')) intent.dietary_tags.push('gluten-free')
  if (lowerQuery.includes('dairy-free') || lowerQuery.includes('dairy free')) intent.dietary_tags.push('dairy-free')
  if (lowerQuery.includes('keto')) intent.dietary_tags.push('keto')
  if (lowerQuery.includes('paleo')) intent.dietary_tags.push('paleo')
  if (lowerQuery.includes('low carb') || lowerQuery.includes('low-carb')) intent.dietary_tags.push('low-carb')

  // Extract health tags
  if (lowerQuery.includes('healthy') || lowerQuery.includes('health')) intent.health_tags.push('heart-healthy')
  if (lowerQuery.includes('protein') || lowerQuery.includes('high protein')) intent.health_tags.push('high-protein')
  if (lowerQuery.includes('low carb') || lowerQuery.includes('low-carb')) intent.health_tags.push('low-carb')
  if (lowerQuery.includes('heart')) intent.health_tags.push('heart-healthy')
  if (lowerQuery.includes('fiber')) intent.health_tags.push('high-fiber')

  // Extract health benefits
  if (lowerQuery.includes('weight loss') || lowerQuery.includes('lose weight')) intent.health_benefits.push('weight-loss')
  if (lowerQuery.includes('energy') || lowerQuery.includes('boost')) intent.health_benefits.push('energy-boost')
  if (lowerQuery.includes('immune')) intent.health_benefits.push('immune-support')
  if (lowerQuery.includes('muscle') || lowerQuery.includes('building')) intent.health_benefits.push('muscle-building')
  if (lowerQuery.includes('heart')) intent.health_benefits.push('heart-health')

  // Extract time
  const timeMatch = lowerQuery.match(/(\d+)\s*(min|minute|minutes|hour|hours)/i)
  if (timeMatch) {
    const value = parseInt(timeMatch[1])
    const unit = timeMatch[2].toLowerCase()
    intent.total_time = unit.startsWith('hour') ? value * 60 : value
  }

  // Extract servings
  const servingsMatch = lowerQuery.match(/(\d+)\s*(people|person|serving|servings)/i)
  if (servingsMatch) {
    intent.servings = parseInt(servingsMatch[1])
  }

  console.log('✅ Fallback intent created:', intent)
  return intent
}

async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    console.log('🔄 Generating query embedding with OpenAI for:', query)
    
    if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not found')
      throw new Error('OpenAI API key not configured')
    }
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: query,
        model: 'text-embedding-3-small',
        dimensions: 1536
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ OpenAI API error:', response.status, errorData)
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      console.error('❌ Invalid OpenAI embedding response')
      throw new Error('Invalid embedding response from OpenAI')
    }

    const embedding = data.data[0].embedding
    console.log('✅ Query embedding generated successfully, dimensions:', embedding.length)
    console.log('📊 Embedding preview (first 5 values):', embedding.slice(0, 5))
    return embedding
  } catch (error) {
    console.error('❌ Error generating query embedding:', error)
    throw error
  }
}

async function searchRecipes(query: string, intent: SearchIntent, embedding: number[], limit: number = 20): Promise<RecipeResult[]> {
  try {
    console.log('🔍 Searching recipes in database with intent:', intent)
    
    // Start with a basic query
    let sqlQuery = supabase
      .from('recipes')
      .select(`
        id,
        title,
        description,
        prep_time,
        cook_time,
        servings,
        image_path,
        ingredients,
        instructions,
        health_tags,
        dietary_tags,
        health_benefits,
        nutritional_info,
        creator_id,
        created_at
      `)

    // Apply filters based on extracted intent
    let hasFilters = false

    // For dietary_tags (text[] array), use overlaps
    if (intent.dietary_tags && intent.dietary_tags.length > 0) {
      console.log('🏷️ Filtering by dietary tags:', intent.dietary_tags)
      sqlQuery = sqlQuery.overlaps('dietary_tags', intent.dietary_tags)
      hasFilters = true
    }

    // For health_benefits (text[] array), use overlaps
    if (intent.health_benefits && intent.health_benefits.length > 0) {
      console.log('💪 Filtering by health benefits:', intent.health_benefits)
      sqlQuery = sqlQuery.overlaps('health_benefits', intent.health_benefits)
      hasFilters = true
    }

    // For health_tags (jsonb), convert to JSON string format
    if (intent.health_tags && intent.health_tags.length > 0) {
      console.log('🏥 Filtering by health tags:', intent.health_tags)
      // Use contains operator for JSONB - convert array to JSON string
      for (const tag of intent.health_tags) {
        sqlQuery = sqlQuery.contains('health_tags', JSON.stringify([tag]))
        hasFilters = true
        break // For now, just use the first tag to avoid complex queries
      }
    }

    if (intent.total_time) {
      console.log('⏱️ Filtering by total time:', intent.total_time)
      // Filter by total cooking time (prep_time + cook_time)
      sqlQuery = sqlQuery.lte('prep_time', Math.floor(intent.total_time * 0.6))
      sqlQuery = sqlQuery.lte('cook_time', Math.floor(intent.total_time * 0.8))
      hasFilters = true
    }

    if (intent.servings) {
      console.log('👥 Filtering by servings:', intent.servings)
      // Allow some flexibility in servings (±2)
      sqlQuery = sqlQuery.gte('servings', Math.max(1, intent.servings - 2))
      sqlQuery = sqlQuery.lte('servings', intent.servings + 2)
      hasFilters = true
    }

    // If no specific filters, do a text search on title and description
    if (!hasFilters) {
      console.log('🔤 No specific filters, doing text search on title and description')
      sqlQuery = sqlQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // Execute the query
    const { data: filteredRecipes, error: filterError } = await sqlQuery.limit(limit * 2)

    if (filterError) {
      console.error('❌ Filter query error:', filterError)
      throw filterError
    }

    console.log(`📊 Found ${filteredRecipes?.length || 0} recipes after filtering`)

    if (!filteredRecipes || filteredRecipes.length === 0) {
      console.log('📭 No recipes found with current filters')
      return []
    }

    // If we have embeddings and recipes, try vector similarity search
    if (embedding && embedding.length > 0 && filteredRecipes.length > 0) {
      try {
        console.log('🔍 Attempting vector similarity search...')
        
        const { data: vectorResults, error: vectorError } = await supabase
          .rpc('search_recipes_by_similarity', {
            query_embedding: embedding,
            match_threshold: 0.1,
            match_count: limit
          })

        if (vectorError) {
          console.log('⚠️ Vector search failed, using filtered results:', vectorError.message)
        } else if (vectorResults && vectorResults.length > 0) {
          console.log(`✅ Vector similarity search returned ${vectorResults.length} results`)
          return vectorResults.slice(0, limit)
        }
      } catch (vectorError) {
        console.log('⚠️ Vector search error, using filtered results:', vectorError)
      }
    }

    // Return filtered results without similarity scores
    const results = filteredRecipes.slice(0, limit).map(recipe => ({
      ...recipe,
      similarity_score: 0.7 // Default score when no vector search
    }))

    console.log(`✅ Returning ${results.length} recipe results`)
    return results
  } catch (error) {
    console.error('❌ Error searching recipes:', error)
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
    console.log('🚀 Recipe Semantic Search Edge Function started')
    console.log('📋 Request method:', req.method)
    console.log('🔑 Environment check - OpenAI key:', OPENAI_API_KEY ? 'Present' : 'Missing')
    console.log('🔑 Environment check - Gemini key:', GEMINI_API_KEY ? 'Present' : 'Missing')
    
    if (req.method !== 'POST') {
      throw new Error('Only POST method is allowed')
    }

    // Parse request body
    const payload: RequestPayload = await req.json()
    console.log('📥 Request payload:', payload)
    
    if (!payload.query || payload.query.trim().length === 0) {
      throw new Error('Search query is required')
    }

    const query = payload.query.trim()
    const limit = payload.limit || 20

    console.log('🔍 Processing search query:', query)
    console.log('📊 Result limit:', limit)

    // Extract search intent and generate embedding in parallel
    console.log('🔄 Starting parallel processing of intent extraction and embedding generation...')
    
    let intent: SearchIntent
    let embedding: number[] = []

    try {
      // Try to run both in parallel, but handle failures gracefully
      const [intentResult, embeddingResult] = await Promise.allSettled([
        extractSearchIntent(query),
        generateQueryEmbedding(query)
      ])

      // Handle intent extraction result
      if (intentResult.status === 'fulfilled') {
        intent = intentResult.value
        console.log('✅ Intent extraction completed successfully')
      } else {
        console.error('❌ Intent extraction failed:', intentResult.reason)
        intent = createFallbackIntent(query)
      }

      // Handle embedding generation result
      if (embeddingResult.status === 'fulfilled') {
        embedding = embeddingResult.value
        console.log('✅ Embedding generation completed successfully')
      } else {
        console.error('❌ Embedding generation failed:', embeddingResult.reason)
        console.log('⚠️ Continuing without embeddings (will use text search only)')
      }
    } catch (parallelError) {
      console.error('❌ Error in parallel processing:', parallelError)
      intent = createFallbackIntent(query)
    }

    console.log('📋 Final extracted intent:', intent)
    console.log('🔢 Embedding dimensions:', embedding.length)

    // Search recipes using filters and vector similarity
    const results = await searchRecipes(query, intent, embedding, limit)

    // Prepare response
    const responseData = {
      success: true,
      query: query,
      intent: intent,
      results: results,
      total_results: results.length,
      processing_info: {
        intent_extraction: GEMINI_API_KEY ? 'Gemini 2.5 Flash' : 'Fallback keyword extraction',
        embedding_generation: OPENAI_API_KEY && embedding.length > 0 ? 'OpenAI text-embedding-3-small' : 'Not available',
        search_method: embedding.length > 0 ? 'Hybrid (filters + vector similarity)' : 'Text and filter search only'
      },
      timestamp: new Date().toISOString()
    }

    console.log(`✅ Search completed successfully with ${results.length} results`)
    console.log('📤 Sending response with processing info:', responseData.processing_info)

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
    console.error('❌ Critical error in recipe-semantic-search function:', error)
    console.error('❌ Error stack:', error.stack)

    const errorResponse = {
      success: false,
      error: 'Recipe search failed',
      message: error.message,
      timestamp: new Date().toISOString(),
      debug_info: {
        error_type: error.constructor.name,
        has_openai_key: !!OPENAI_API_KEY,
        has_gemini_key: !!GEMINI_API_KEY
      }
    }

    console.log('📤 Sending error response:', errorResponse)

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