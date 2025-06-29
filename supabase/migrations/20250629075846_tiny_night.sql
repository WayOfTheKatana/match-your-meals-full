/*
  # Add geolocation tracking to recipe views

  1. New Columns
    - `country_code` (text) - Two-letter country code (e.g., US, CA)
    - `country_name` (text) - Full country name (e.g., United States)
    - `city` (text) - City name
    - `region` (text) - Region/state name
    - `latitude` (float) - Latitude coordinate
    - `longitude` (float) - Longitude coordinate
  
  2. Indexing
    - Add index on country_code for faster filtering by country
*/

-- Add geolocation columns to recipe_views table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recipe_views' AND column_name = 'country_code'
  ) THEN
    ALTER TABLE public.recipe_views ADD COLUMN country_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recipe_views' AND column_name = 'country_name'
  ) THEN
    ALTER TABLE public.recipe_views ADD COLUMN country_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recipe_views' AND column_name = 'city'
  ) THEN
    ALTER TABLE public.recipe_views ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recipe_views' AND column_name = 'region'
  ) THEN
    ALTER TABLE public.recipe_views ADD COLUMN region text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recipe_views' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE public.recipe_views ADD COLUMN latitude float;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recipe_views' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE public.recipe_views ADD COLUMN longitude float;
  END IF;
END $$;

-- Create index on country_code for faster filtering
CREATE INDEX IF NOT EXISTS idx_recipe_views_country_code ON public.recipe_views USING btree (country_code);