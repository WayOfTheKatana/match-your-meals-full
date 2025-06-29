/*
  # Create Recipe Boards Table

  1. New Tables
    - `recipe_boards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text, board name)
      - `slug` (text, URL-friendly identifier)
      - `description` (text, optional description)
      - `is_private` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `recipe_boards` table
    - Add policies for authenticated users to manage their own boards

  3. Indexes
    - Index on user_id for faster lookups
    - Unique index on slug for URL generation
*/

-- Create recipe_boards table
CREATE TABLE IF NOT EXISTS public.recipe_boards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text,
    is_private boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recipe_boards_user_id ON public.recipe_boards USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_boards_slug ON public.recipe_boards USING btree (slug);

-- Enable RLS
ALTER TABLE public.recipe_boards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create their own recipe boards" ON public.recipe_boards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own recipe boards" ON public.recipe_boards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipe boards" ON public.recipe_boards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipe boards" ON public.recipe_boards
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_recipe_boards_updated_at
    BEFORE UPDATE ON public.recipe_boards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create board_recipes junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.board_recipes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id uuid NOT NULL REFERENCES public.recipe_boards(id) ON DELETE CASCADE,
    recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    added_at timestamp with time zone DEFAULT now(),
    UNIQUE(board_id, recipe_id)
);

-- Create indexes for board_recipes
CREATE INDEX IF NOT EXISTS idx_board_recipes_board_id ON public.board_recipes USING btree (board_id);
CREATE INDEX IF NOT EXISTS idx_board_recipes_recipe_id ON public.board_recipes USING btree (recipe_id);

-- Enable RLS for board_recipes
ALTER TABLE public.board_recipes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for board_recipes
CREATE POLICY "Users can manage recipes in their own boards" ON public.board_recipes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.recipe_boards 
      WHERE recipe_boards.id = board_recipes.board_id 
      AND recipe_boards.user_id = auth.uid()
    )
  );