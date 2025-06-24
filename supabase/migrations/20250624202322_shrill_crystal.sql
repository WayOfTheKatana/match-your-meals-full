/*
  # Add slug column to recipes table

  1. Schema Changes
    - Add `slug` column to `recipes` table
    - Make slug unique and not null
    - Add index for faster lookups
    - Add function to generate slugs from existing titles

  2. Data Migration
    - Generate slugs for existing recipes
    - Ensure uniqueness by appending numbers if needed

  3. Performance
    - Add index on slug column for fast lookups
*/

-- Add slug column to recipes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'slug'
  ) THEN
    ALTER TABLE recipes ADD COLUMN slug text;
  END IF;
END $$;

-- Create function to generate slug from text
CREATE OR REPLACE FUNCTION generate_slug(input_text text)
RETURNS text AS $$
DECLARE
  slug text;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  slug := lower(trim(input_text));
  slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  slug := trim(slug, '-');
  
  -- Ensure slug is not empty
  IF slug = '' THEN
    slug := 'recipe';
  END IF;
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Create function to ensure unique slug
CREATE OR REPLACE FUNCTION ensure_unique_slug(base_slug text, recipe_id uuid DEFAULT NULL)
RETURNS text AS $$
DECLARE
  final_slug text;
  counter integer := 0;
  slug_exists boolean;
BEGIN
  final_slug := base_slug;
  
  LOOP
    -- Check if slug exists (excluding current recipe if updating)
    SELECT EXISTS(
      SELECT 1 FROM recipes 
      WHERE slug = final_slug 
      AND (recipe_id IS NULL OR id != recipe_id)
    ) INTO slug_exists;
    
    IF NOT slug_exists THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Generate slugs for existing recipes that don't have them
UPDATE recipes 
SET slug = ensure_unique_slug(generate_slug(title), id)
WHERE slug IS NULL OR slug = '';

-- Make slug column NOT NULL and UNIQUE
ALTER TABLE recipes 
  ALTER COLUMN slug SET NOT NULL,
  ADD CONSTRAINT recipes_slug_unique UNIQUE (slug);

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_recipes_slug ON recipes(slug);

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION auto_generate_recipe_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate slug from title if not provided or if title changed
  IF NEW.slug IS NULL OR NEW.slug = '' OR (TG_OP = 'UPDATE' AND NEW.title != OLD.title) THEN
    NEW.slug := ensure_unique_slug(generate_slug(NEW.title), NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_recipe_slug ON recipes;
CREATE TRIGGER trigger_auto_generate_recipe_slug
  BEFORE INSERT OR UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION auto_generate_recipe_slug();