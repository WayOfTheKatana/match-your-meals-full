/*
  # Update search function with intent filtering

  1. Enhanced Search Function
    - Add parameters for dietary_tags_filter, total_time_filter, health_tags_filter, health_benefits_filter, servings_filter
    - Apply WHERE clauses to filter results based on intent criteria
    - Use array overlap operators for tag filtering
    - Use comparison operators for numeric filtering

  2. Filtering Logic
    - dietary_tags: Use && (overlaps) operator for array filtering
    - health_tags: Use @> (contains) operator for JSONB array filtering
    - health_benefits: Use && (overlaps) operator for array filtering
    - total_time: Use <= operator for maximum time filtering
    - servings: Use = operator for exact serving size matching

  3. Performance
    - Maintain vector similarity ordering as primary sort
    - Apply filters efficiently using database indexes
    - Return filtered results with similarity scores
*/

-- Drop the existing function first
DROP FUNCTION IF EXISTS search_recipes_by_similarity(vector(1536), float, int);

-- Create the enhanced vector similarity search function with intent filtering
CREATE OR REPLACE FUNCTION search_recipes_by_similarity(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.1,
  match_count int DEFAULT 20,
  dietary_tags_filter text[] DEFAULT '{}',
  total_time_filter int DEFAULT NULL,
  health_tags_filter jsonb DEFAULT '[]',
  health_benefits_filter text[] DEFAULT '{}',
  servings_filter int DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  prep_time integer,
  cook_time integer,
  servings integer,
  image_path text,
  ingredients jsonb,
  instructions text[],
  health_tags jsonb,
  dietary_tags text[],
  health_benefits text[],
  nutritional_info jsonb,
  creator_id uuid,
  created_at timestamp without time zone,
  similarity_score float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.title,
    r.description,
    r.prep_time,
    r.cook_time,
    r.servings,
    r.image_path,
    r.ingredients,
    r.instructions,
    r.health_tags,
    r.dietary_tags,
    r.health_benefits,
    r.nutritional_info,
    r.creator_id,
    r.created_at,
    (1 - (r.embedding <=> query_embedding)) as similarity_score
  FROM recipes r
  WHERE r.embedding IS NOT NULL
    AND (1 - (r.embedding <=> query_embedding)) > match_threshold
    -- Filter by dietary tags (if provided)
    AND (
      array_length(dietary_tags_filter, 1) IS NULL 
      OR r.dietary_tags && dietary_tags_filter
    )
    -- Filter by total time (prep_time + cook_time <= total_time_filter)
    AND (
      total_time_filter IS NULL 
      OR (COALESCE(r.prep_time, 0) + COALESCE(r.cook_time, 0)) <= total_time_filter
    )
    -- Filter by health tags (if provided)
    AND (
      jsonb_array_length(health_tags_filter) = 0
      OR r.health_tags @> health_tags_filter
    )
    -- Filter by health benefits (if provided)
    AND (
      array_length(health_benefits_filter, 1) IS NULL 
      OR r.health_benefits && health_benefits_filter
    )
    -- Filter by servings (if provided)
    AND (
      servings_filter IS NULL 
      OR r.servings = servings_filter
    )
  ORDER BY r.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_recipes_by_similarity TO authenticated;

-- Grant execute permission to service role (for Edge Functions)
GRANT EXECUTE ON FUNCTION search_recipes_by_similarity TO service_role;