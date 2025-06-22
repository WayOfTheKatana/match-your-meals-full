/*
  # Create vector similarity search function

  1. New Functions
    - `search_recipes_by_similarity` - searches recipes using vector similarity
    - Uses pgvector extension for similarity calculations
    - Returns recipes with similarity scores

  2. Security
    - Function is accessible to authenticated users
    - Uses existing RLS policies on recipes table
*/

-- Create the vector similarity search function
CREATE OR REPLACE FUNCTION search_recipes_by_similarity(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.1,
  match_count int DEFAULT 20
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
  ORDER BY r.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_recipes_by_similarity TO authenticated;