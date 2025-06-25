/*
  # Create search_history table

  1. New Tables
    - `search_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `query` (text, the search string)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `search_history` table
    - Add policy for users to insert their own search history
    - Add policy for users to read their own search history
    - Add policy for users to delete their own search history

  3. Constraints
    - Unique constraint on (user_id, query) to prevent duplicate searches
    - Foreign key constraint for data integrity
*/

-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  query text NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Unique constraint to prevent duplicate searches for same user
  CONSTRAINT unique_user_query UNIQUE (user_id, query)
);

-- Add foreign key constraint
DO $$
BEGIN
  -- Foreign key to auth.users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'search_history_user_id_fkey'
  ) THEN
    ALTER TABLE search_history 
    ADD CONSTRAINT search_history_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Create policies for search_history
CREATE POLICY "Users can insert their own search history"
  ON search_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own search history"
  ON search_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history"
  ON search_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);