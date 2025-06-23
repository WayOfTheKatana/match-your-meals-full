/*
  # Create saved_recipes table

  1. New Tables
    - `saved_recipes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `recipe_id` (uuid, foreign key to recipes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `saved_recipes` table
    - Add policy for users to insert their own saved recipes
    - Add policy for users to read their own saved recipes
    - Add policy for users to delete their own saved recipes

  3. Constraints
    - Unique constraint on (user_id, recipe_id) to prevent duplicate saves
    - Foreign key constraints for data integrity
*/

-- Create saved_recipes table
CREATE TABLE IF NOT EXISTS saved_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recipe_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Unique constraint to prevent duplicate saves
  CONSTRAINT unique_user_recipe UNIQUE (user_id, recipe_id)
);

-- Add foreign key constraints
DO $$
BEGIN
  -- Foreign key to auth.users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'saved_recipes_user_id_fkey'
  ) THEN
    ALTER TABLE saved_recipes 
    ADD CONSTRAINT saved_recipes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Foreign key to recipes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'saved_recipes_recipe_id_fkey'
  ) THEN
    ALTER TABLE saved_recipes 
    ADD CONSTRAINT saved_recipes_recipe_id_fkey 
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_recipes
CREATE POLICY "Users can insert their own saved recipes"
  ON saved_recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own saved recipes"
  ON saved_recipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved recipes"
  ON saved_recipes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_recipe_id ON saved_recipes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_created_at ON saved_recipes(created_at DESC);