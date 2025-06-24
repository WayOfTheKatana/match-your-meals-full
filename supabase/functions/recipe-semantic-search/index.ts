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
  slug: string;
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
      console.log('⚠️ Gemini API key not found, using enhanced fallback intent extraction')
      return createEnhancedFallbackIntent(query)
    }
    
    const prompt = `Extract structured search intent from recipe query. Return ONLY a valid JSON object with these exact fields:

{
  "dietary_tags": [],
  "total_time": null,
  "health_tags": [],
  "health_benefits": [],
  "servings": null
}

COMPREHENSIVE TAG LISTS:

dietary_tags (select multiple if applicable):
["vegetarian", "vegan", "gluten-free", "dairy-free", "keto", "paleo", "low-carb", "pescatarian", "omnivore", "whole30", "mediterranean", "dash-diet", "flexitarian", "raw-food", "plant-based", "carnivore", "atkins", "south-beach", "zone-diet", "alkaline", "anti-inflammatory", "fodmap-friendly", "kosher", "halal", "sugar-free", "grain-free", "nut-free", "soy-free", "egg-free", "shellfish-free", "low-fat", "low-sodium", "diabetic-friendly", "renal-diet", "heart-healthy-diet"]

health_tags (select multiple if applicable):
["high-protein", "low-carb", "heart-healthy", "low-sodium", "high-fiber", "antioxidant-rich", "calcium-rich", "iron-rich", "vitamin-rich", "omega-3-rich", "low-fat", "high-potassium", "magnesium-rich", "zinc-rich", "vitamin-d-rich", "vitamin-c-rich", "vitamin-b12-rich", "folate-rich", "probiotic", "prebiotic", "anti-inflammatory", "low-glycemic", "high-energy", "metabolism-boosting", "detoxifying", "alkalizing", "hydrating", "collagen-boosting", "brain-food", "mood-boosting", "stress-reducing", "immune-boosting", "gut-healthy", "skin-healthy", "bone-healthy", "eye-healthy", "liver-healthy", "kidney-healthy", "thyroid-supporting", "hormone-balancing", "blood-sugar-friendly", "cholesterol-lowering", "blood-pressure-friendly", "circulation-boosting", "respiratory-supporting", "joint-healthy", "muscle-building", "recovery-enhancing", "endurance-boosting", "weight-management", "appetite-suppressing", "satiety-promoting"]

health_benefits (select multiple if applicable):
["weight-loss", "weight-gain", "muscle-building", "energy-boost", "immune-support", "heart-health", "bone-health", "brain-health", "digestive-health", "skin-health", "eye-health", "liver-health", "kidney-health", "respiratory-health", "joint-health", "mental-clarity", "mood-enhancement", "stress-reduction", "sleep-improvement", "hormone-balance", "blood-sugar-control", "cholesterol-management", "blood-pressure-control", "circulation-improvement", "detoxification", "anti-aging", "inflammation-reduction", "recovery-acceleration", "endurance-enhancement", "strength-building", "flexibility-improvement", "metabolism-boost", "appetite-control", "satiety-enhancement", "nutrient-absorption", "gut-microbiome-support", "cognitive-function", "memory-enhancement", "focus-improvement", "anxiety-relief", "depression-support", "seasonal-allergy-relief", "cold-flu-prevention", "wound-healing", "tissue-repair", "cellular-regeneration", "longevity-support", "disease-prevention", "cancer-prevention", "diabetes-prevention", "osteoporosis-prevention", "alzheimer-prevention", "cardiovascular-protection"]

Rules:
- total_time: number in minutes (prep + cook time combined)
- servings: number of people it serves
- Be generous with tag selection - include all relevant tags that apply
- Consider synonyms and related terms (e.g., "plant-based" and "vegan", "heart-healthy" and "cardiovascular")
- Look for cooking methods, ingredients, and health goals in the query
- Consider both explicit and implicit health intentions

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
          maxOutputTokens: 500,
        }
      }),
    })

    if (!response.ok) {
      console.error('❌ Gemini API error:', response.status, response.statusText)
      return createEnhancedFallbackIntent(query)
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ Invalid Gemini response structure')
      return createEnhancedFallbackIntent(query)
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
      console.log('⚠️ No JSON found in Gemini response, using enhanced fallback')
      return createEnhancedFallbackIntent(query)
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
      return createEnhancedFallbackIntent(query)
    }
  } catch (error) {
    console.error('❌ Error in extractSearchIntent:', error)
    return createEnhancedFallbackIntent(query)
  }
}

function createEnhancedFallbackIntent(query: string): SearchIntent {
  console.log('🔄 Creating enhanced fallback intent for query:', query)
  
  const lowerQuery = query.toLowerCase()
  const intent: SearchIntent = {
    dietary_tags: [],
    health_tags: [],
    health_benefits: []
  }

  // Enhanced dietary tags extraction with comprehensive coverage
  const dietaryMappings = {
    'vegetarian': ['vegetarian'],
    'vegan': ['vegan', 'plant-based'],
    'gluten-free': ['gluten-free', 'gluten free', 'celiac'],
    'dairy-free': ['dairy-free', 'dairy free', 'lactose-free', 'lactose free'],
    'keto': ['keto', 'ketogenic'],
    'paleo': ['paleo', 'paleolithic'],
    'low-carb': ['low carb', 'low-carb', 'low carbohydrate'],
    'pescatarian': ['pescatarian', 'pescetarian'],
    'mediterranean': ['mediterranean', 'med diet'],
    'whole30': ['whole30', 'whole 30'],
    'dash-diet': ['dash', 'dash diet'],
    'plant-based': ['plant-based', 'plant based'],
    'sugar-free': ['sugar-free', 'sugar free', 'no sugar'],
    'grain-free': ['grain-free', 'grain free'],
    'nut-free': ['nut-free', 'nut free', 'no nuts'],
    'soy-free': ['soy-free', 'soy free'],
    'egg-free': ['egg-free', 'egg free'],
    'low-fat': ['low fat', 'low-fat'],
    'low-sodium': ['low sodium', 'low-sodium', 'low salt'],
    'diabetic-friendly': ['diabetic', 'diabetes', 'diabetic-friendly'],
    'heart-healthy-diet': ['heart healthy', 'heart-healthy', 'cardiac']
  }

  for (const [tag, keywords] of Object.entries(dietaryMappings)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      intent.dietary_tags.push(tag)
    }
  }

  // Enhanced health tags extraction with comprehensive coverage
  const healthTagMappings = {
    'high-protein': ['protein', 'high protein', 'high-protein'],
    'low-carb': ['low carb', 'low-carb', 'low carbohydrate'],
    'heart-healthy': ['heart healthy', 'heart-healthy', 'cardiac', 'cardiovascular'],
    'low-sodium': ['low sodium', 'low-sodium', 'low salt'],
    'high-fiber': ['fiber', 'fibre', 'high fiber', 'high-fiber'],
    'antioxidant-rich': ['antioxidant', 'antioxidants', 'antioxidant-rich'],
    'calcium-rich': ['calcium', 'calcium rich', 'calcium-rich'],
    'iron-rich': ['iron', 'iron rich', 'iron-rich'],
    'vitamin-rich': ['vitamin', 'vitamins', 'vitamin rich'],
    'omega-3-rich': ['omega', 'omega-3', 'omega 3', 'fish oil'],
    'low-fat': ['low fat', 'low-fat'],
    'high-potassium': ['potassium', 'high potassium'],
    'magnesium-rich': ['magnesium', 'magnesium rich'],
    'anti-inflammatory': ['anti-inflammatory', 'anti inflammatory', 'inflammation'],
    'low-glycemic': ['low glycemic', 'low-glycemic', 'blood sugar'],
    'high-energy': ['energy', 'energizing', 'high energy'],
    'metabolism-boosting': ['metabolism', 'metabolic', 'fat burning'],
    'immune-boosting': ['immune', 'immunity', 'immune system'],
    'gut-healthy': ['gut', 'digestive', 'gut health'],
    'brain-food': ['brain', 'cognitive', 'mental'],
    'bone-healthy': ['bone', 'bones', 'bone health'],
    'skin-healthy': ['skin', 'skin health', 'complexion'],
    'muscle-building': ['muscle', 'muscles', 'muscle building'],
    'weight-management': ['weight loss', 'weight management', 'diet'],
    'probiotic': ['probiotic', 'probiotics', 'good bacteria'],
    'detoxifying': ['detox', 'detoxifying', 'cleanse']
  }

  for (const [tag, keywords] of Object.entries(healthTagMappings)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      intent.health_tags.push(tag)
    }
  }

  // Enhanced health benefits extraction with comprehensive coverage
  const healthBenefitMappings = {
    'weight-loss': ['weight loss', 'lose weight', 'fat loss', 'slimming'],
    'muscle-building': ['muscle building', 'build muscle', 'gain muscle', 'strength'],
    'energy-boost': ['energy', 'energizing', 'boost energy', 'stamina'],
    'immune-support': ['immune', 'immunity', 'immune system', 'cold prevention'],
    'heart-health': ['heart', 'cardiac', 'cardiovascular', 'heart health'],
    'bone-health': ['bone', 'bones', 'bone health', 'osteoporosis'],
    'brain-health': ['brain', 'cognitive', 'mental clarity', 'memory'],
    'digestive-health': ['digestive', 'digestion', 'gut health', 'stomach'],
    'skin-health': ['skin', 'complexion', 'skin health', 'anti-aging'],
    'stress-reduction': ['stress', 'anxiety', 'relaxation', 'calm'],
    'inflammation-reduction': ['inflammation', 'anti-inflammatory', 'joint pain'],
    'blood-sugar-control': ['blood sugar', 'diabetes', 'glucose', 'insulin'],
    'cholesterol-management': ['cholesterol', 'ldl', 'hdl'],
    'blood-pressure-control': ['blood pressure', 'hypertension', 'bp'],
    'detoxification': ['detox', 'cleanse', 'liver', 'toxins'],
    'recovery-acceleration': ['recovery', 'post-workout', 'muscle recovery'],
    'endurance-enhancement': ['endurance', 'stamina', 'athletic performance'],
    'mood-enhancement': ['mood', 'depression', 'happiness', 'serotonin'],
    'sleep-improvement': ['sleep', 'insomnia', 'rest', 'melatonin'],
    'hormone-balance': ['hormone', 'hormonal', 'pms', 'menopause']
  }

  for (const [benefit, keywords] of Object.entries(healthBenefitMappings)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      intent.health_benefits.push(benefit)
    }
  }

  // Extract time with more flexible patterns
  const timePatterns = [
    /(\d+)\s*(min|minute|minutes)/i,
    /(\d+)\s*(hour|hours|hr|hrs)/i,
    /under\s+(\d+)\s*(min|minute|minutes)/i,
    /less\s+than\s+(\d+)\s*(min|minute|minutes)/i,
    /quick\s+(\d+)\s*(min|minute|minutes)/i
  ]

  for (const pattern of timePatterns) {
    const timeMatch = lowerQuery.match(pattern)
    if (timeMatch) {
      const value = parseInt(timeMatch[1])
      const unit = timeMatch[2].toLowerCase()
      intent.total_time = unit.startsWith('hour') || unit.startsWith('hr') ? value * 60 : value
      break
    }
  }

  // Quick meal indicators
  if (lowerQuery.includes('quick') || lowerQuery.includes('fast') || lowerQuery.includes('easy')) {
    if (!intent.total_time) intent.total_time = 30 // Default quick meal time
  }

  // Extract servings with more patterns
  const servingPatterns = [
    /(\d+)\s*(people|person|serving|servings)/i,
    /serves?\s+(\d+)/i,
    /for\s+(\d+)/i,
    /(single|one)\s+(serving|person)/i,
    /(family|large)\s+(serving|meal)/i
  ]

  for (const pattern of servingPatterns) {
    const servingsMatch = lowerQuery.match(pattern)
    if (servingsMatch) {
      if (servingsMatch[1] === 'single' || servingsMatch[1] === 'one') {
        intent.servings = 1
      } else if (servingsMatch[1] === 'family' || servingsMatch[1] === 'large') {
        intent.servings = 6
      } else {
        intent.servings = parseInt(servingsMatch[1])
      }
      break
    }
  }

  console.log('✅ Enhanced fallback intent created:', intent)
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
    return embedding
  } catch (error) {
    console.error('❌ Error generating query embedding:', error)
    throw error
  }
}

async function searchRecipes(query: string, intent: SearchIntent, embedding: number[]): Promise<RecipeResult[]> {
  try {
    console.log('🔍 Starting vectorized search')
    console.log('🔍 Query:', query)
    console.log('🔍 Intent:', intent)
    console.log('🔍 Has embedding:', embedding.length > 0)
    
    let results: any[] = []

    // Try vector similarity search first (if embedding available)
    if (embedding && embedding.length > 0) {
      try {
        console.log('🚀 Attempting vector similarity search...')
        
        const { data: vectorResults, error: vectorError } = await supabase
          .rpc('search_recipes_by_similarity', {
            query_embedding: embedding,
            match_threshold: 0.1,
            match_count: 20
          })

        if (vectorError) {
          console.log('⚠️ Vector search failed:', vectorError.message)
        } else if (vectorResults && vectorResults.length > 0) {
          console.log(`✅ Vector search found ${vectorResults.length} results`)
          results = vectorResults
        } else {
          console.log('📭 Vector search returned no results')
        }
      } catch (vectorError) {
        console.log('⚠️ Vector search error:', vectorError)
      }
    }

    // Fallback to text search if vector search failed or returned no results
    if (results.length === 0) {
      console.log('🚀 Falling back to text search...')
      
      try {
        const { data: textResults, error: textError } = await supabase
          .from('recipes')
          .select(`
            id,
            slug,
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
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(20)

        if (textError) {
          console.error('❌ Text search error:', textError)
          throw textError
        }

        if (textResults && textResults.length > 0) {
          console.log(`✅ Text search found ${textResults.length} results`)
          results = textResults.map(recipe => ({
            ...recipe,
            similarity_score: 0.6 // Default score for text matches
          }))
        } else {
          console.log('📭 Text search returned no results')
          return []
        }
      } catch (textError) {
        console.error('❌ Text search failed:', textError)
        return []
      }
    }

    // Sort by similarity score and return only top 3
    const sortedResults = results
      .sort((a, b) => (b.similarity_score || 0) - (a.similarity_score || 0))
      .slice(0, 3) // LIMIT TO 3 RESULTS ONLY

    console.log(`✅ Returning top ${sortedResults.length} results`)
    
    return sortedResults
  } catch (error) {
    console.error('❌ Error in searchRecipes:', error)
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
    console.log('🚀 Recipe Search Edge Function started')
    
    if (req.method !== 'POST') {
      throw new Error('Only POST method is allowed')
    }

    // Parse request body
    const payload: RequestPayload = await req.json()
    
    if (!payload.query || payload.query.trim().length === 0) {
      throw new Error('Search query is required')
    }

    const query = payload.query.trim()

    console.log('🔍 Processing search query:', query)

    // Extract search intent and generate embedding in parallel
    let intent: SearchIntent
    let embedding: number[] = []

    try {
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
        intent = createEnhancedFallbackIntent(query)
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
      intent = createEnhancedFallbackIntent(query)
    }

    console.log('📋 Final extracted intent:', intent)

    // Search recipes - this will return max 3 results
    const results = await searchRecipes(query, intent, embedding)

    // Prepare response
    const responseData = {
      success: true,
      query: query,
      intent: intent,
      results: results,
      total_results: results.length,
      timestamp: new Date().toISOString()
    }

    console.log(`✅ Search completed with ${results.length} results`)

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
    console.error('❌ Error in recipe search function:', error)

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