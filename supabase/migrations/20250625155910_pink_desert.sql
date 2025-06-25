/*
  # Create RPC function for creator public profile data

  1. New Functions
    - `get_creator_public_profile_data` - fetches creator profile, published recipes, and total saves
    - Returns comprehensive data for creator profile pages

  2. Security
    - Function is accessible to all users (public profiles)
    - Uses existing RLS policies on recipes and users tables
*/

-- Create the RPC function to get creator public profile data
CREATE OR REPLACE FUNCTION get_creator_public_profile_data(creator_user_id uuid)
RETURNS TABLE (
  -- Creator profile data
  creator_id uuid,
  creator_name text,
  creator_avatar_url text,
  creator_joined_date timestamptz,
  
  -- Recipe data
  recipe_id uuid,
  recipe_slug text,
  recipe_title text,
  recipe_description text,
  recipe_prep_time integer,
  recipe_cook_time integer,
  recipe_servings integer,
  recipe_image_path text,
  recipe_ingredients jsonb,
  recipe_instructions text[],
  recipe_health_tags jsonb,
  recipe_dietary_tags text[],
  recipe_health_benefits text[],
  recipe_nutritional_info jsonb,
  recipe_created_at timestamp without time zone,
  
  -- Save count for this specific recipe
  recipe_save_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id as creator_id,
    u.full_name as creator_name,
    u.avatar_url as creator_avatar_url,
    u.created_at as creator_joined_date,
    
    r.id as recipe_id,
    r.slug as recipe_slug,
    r.title as recipe_title,
    r.description as recipe_description,
    r.prep_time as recipe_prep_time,
    r.cook_time as recipe_cook_time,
    r.servings as recipe_servings,
    r.image_path as recipe_image_path,
    r.ingredients as recipe_ingredients,
    r.instructions as recipe_instructions,
    r.health_tags as recipe_health_tags,
    r.dietary_tags as recipe_dietary_tags,
    r.health_benefits as recipe_health_benefits,
    r.nutritional_info as recipe_nutritional_info,
    r.created_at as recipe_created_at,
    
    COALESCE(sr.save_count, 0) as recipe_save_count
  FROM users u
  LEFT JOIN recipes r ON r.creator_id = u.id
  LEFT JOIN (
    SELECT 
      recipe_id, 
      COUNT(*) as save_count
    FROM saved_recipes 
    GROUP BY recipe_id
  ) sr ON sr.recipe_id = r.id
  WHERE u.id = creator_user_id
  ORDER BY r.created_at DESC NULLS LAST;
END;
$$;

-- Grant execute permission to all users (public profiles)
GRANT EXECUTE ON FUNCTION get_creator_public_profile_data TO anon;
GRANT EXECUTE ON FUNCTION get_creator_public_profile_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_creator_public_profile_data TO service_role;