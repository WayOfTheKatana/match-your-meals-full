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
    console.log('🔄 Extracting search intent with Gemini...')
    
    const prompt = `Extract structured search intent from recipe query, return only valid JSON with these fields below and make sure do not explain anything.
- dietary_tags (array of strings) - like ["vegetarian", "gluten-free", "dairy-free"] 
- total_time (number in minutes) - prep_time + cook_time combined 
- health_tags (array of strings) - like ["high-protein", "low-carb", "heart-healthy"] 
- health_benefits (array of strings) - like ["weight-loss", "energy-boost", "immune-support"] 
- servings (number) - how many people it serves

User query: "${query}"

Return only the JSON object, no explanation or additional text.`

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
          maxOutputTokens: 500,
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
    console.log('📝 Gemini intent extraction response:', generatedText)

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
      console.log('⚠️ No JSON found, using fallback intent extraction')
      // Fallback: basic keyword extraction
      return {
        dietary_tags: [],
        health_tags: [],
        health_benefits: []
      }
    }

    const intent = JSON.parse(jsonMatch[0])
    console.log('✅ Search intent extracted:', intent)
    return intent
  } catch (error) {
    console.error('❌ Error extracting search intent:', error)
    // Return empty intent on error
    return {
      dietary_tags: [],
      health_tags: [],
      health_benefits: []
    }
  }
}

async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    console.log('🔄 Generating query embedding with OpenAI...')
    
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
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      throw new Error('Invalid embedding response from OpenAI')
    }

    console.log('✅ Query embedding generated successfully')
    return data.data[0].embedding
  } catch (error) {
    console.error('❌ Error generating query embedding:', error)
    throw error
  }
}

async function searchRecipes(query: string, intent: SearchIntent, embedding: number[], limit: number = 20): Promise<RecipeResult[]> {
  try {
    console.log('🔍 Searching recipes in database...')
    
    // Build the SQL query with filters and vector similarity
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
    // For dietary_tags (text[] array), use overlaps
    if (intent.dietary_tags && intent.dietary_tags.length > 0) {
      sqlQuery = sqlQuery.overlaps('dietary_tags', intent.dietary_tags)
    }

    // For health_tags (jsonb), use contains operator
    if (intent.health_tags && intent.health_tags.length > 0) {
      // Use cs (contains) operator for JSONB arrays
      sqlQuery = sqlQuery.cs('health_tags', intent.health_tags)
    }

    // For health_benefits (text[] array), use overlaps
    if (intent.health_benefits && intent.health_benefits.length > 0) {
      sqlQuery = sqlQuery.overlaps('health_benefits', intent.health_benefits)
    }

    if (intent.total_time) {
      // Filter by total cooking time (prep_time + cook_time)
      sqlQuery = sqlQuery.lte('prep_time', Math.floor(intent.total_time * 0.6)) // Assume 60% for prep
      sqlQuery = sqlQuery.lte('cook_time', Math.floor(intent.total_time * 0.8)) // Assume 80% for cook
    }

    if (intent.servings) {
      // Allow some flexibility in servings (±2)
      sqlQuery = sqlQuery.gte('servings', intent.servings - 2)
      sqlQuery = sqlQuery.lte('servings', intent.servings + 2)
    }

    // Execute the query
    const { data: filteredRecipes, error: filterError } = await sqlQuery.limit(limit * 2) // Get more for vector similarity

    if (filterError) {
      console.error('❌ Filter query error:', filterError)
      throw filterError
    }

    console.log(`📊 Found ${filteredRecipes?.length || 0} recipes after filtering`)

    if (!filteredRecipes || filteredRecipes.length === 0) {
      return []
    }

    // If we have embeddings, perform vector similarity search
    if (embedding && embedding.length > 0) {
      try {
        // Use RPC function for vector similarity (you'll need to create this)
        const { data: vectorResults, error: vectorError } = await supabase
          .rpc('search_recipes_by_similarity', {
            query_embedding: embedding,
            match_threshold: 0.1,
            match_count: limit
          })

        if (vectorError) {
          console.log('⚠️ Vector search failed, using filtered results:', vectorError.message)
          // Fall back to filtered results without similarity scores
          return filteredRecipes.slice(0, limit).map(recipe => ({
            ...recipe,
            similarity_score: 0.5 // Default score
          }))
        }

        if (vectorResults && vectorResults.length > 0) {
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
      similarity_score: 0.5 // Default score when no vector search
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
    console.log('🚀 Recipe Semantic Search started')
    
    if (req.method !== 'POST') {
      throw new Error('Only POST method is allowed')
    }

    // Parse request body
    const payload: RequestPayload = await req.json()
    
    if (!payload.query || payload.query.trim().length === 0) {
      throw new Error('Search query is required')
    }

    const query = payload.query.trim()
    const limit = payload.limit || 20

    console.log('🔍 Search query:', query)

    // Check if API keys are available
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured')
    }

    // Extract search intent and generate embedding in parallel
    console.log('🔄 Starting parallel processing...')
    const [intent, embedding] = await Promise.all([
      extractSearchIntent(query),
      generateQueryEmbedding(query)
    ])

    console.log('📋 Extracted intent:', intent)
    console.log('🔢 Generated embedding dimensions:', embedding.length)

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
        intent_extraction: 'Gemini 2.5 Flash',
        embedding_generation: 'OpenAI text-embedding-3-small',
        search_method: 'Hybrid (filters + vector similarity)'
      },
      timestamp: new Date().toISOString()
    }

    console.log(`✅ Search completed successfully with ${results.length} results`)

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
    console.error('❌ Error in recipe-semantic-search function:', error)

    const errorResponse = {
      success: false,
      error: 'Recipe search failed',
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