/*
  # Fix Creator Profile Function

  1. Database Functions
    - Create or replace `get_creator_public_profile_data` function
    - Properly qualify all column references to avoid ambiguity
    - Return creator info along with their published recipes
    - Include recipe save counts for each recipe

  2. Function Features
    - Takes creator_user_id as parameter
    - Returns creator profile data with all their recipes
    - Includes save counts for each recipe
    - Handles cases where creator has no recipes
*/

-- Drop the function if it exists to recreate it properly
DROP FUNCTION IF EXISTS get_creator_public_profile_data(uuid);

-- Create the function with proper column qualification
CREATE OR REPLACE FUNCTION get_creator_public_profile_data(creator_user_id uuid)
RETURNS TABLE (
  creator_id uuid,
  creator_name text,
  creator_avatar_url text,
  creator_joined_date timestamptz,
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
  recipe_created_at timestamp,
  recipe_save_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
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
    COALESCE(save_counts.save_count, 0) as recipe_save_count
  FROM users u
  LEFT JOIN recipes r ON r.creator_id = u.id
  LEFT JOIN (
    SELECT 
      sr.recipe_id,
      COUNT(*) as save_count
    FROM saved_recipes sr
    GROUP BY sr.recipe_id
  ) save_counts ON save_counts.recipe_id = r.id
  WHERE u.id = creator_user_id
  ORDER BY r.created_at DESC NULLS LAST;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_creator_public_profile_data(uuid) TO authenticated;