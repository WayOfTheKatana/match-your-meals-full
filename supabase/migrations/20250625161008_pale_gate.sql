/*
  # Create followers table for user following system

  1. New Tables
    - `followers`
      - `id` (uuid, primary key)
      - `follower_id` (uuid, foreign key to auth.users - the user who follows)
      - `followed_id` (uuid, foreign key to auth.users - the user being followed)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `followers` table
    - Add policy for users to follow others (insert their own follows)
    - Add policy for users to read follower relationships (public data)
    - Add policy for users to unfollow others (delete their own follows)

  3. Constraints
    - Unique constraint on (follower_id, followed_id) to prevent duplicate follows
    - Check constraint to prevent self-following
    - Foreign key constraints for data integrity

  4. Performance
    - Indexes on follower_id and followed_id for fast lookups
    - Index on created_at for chronological ordering
*/

-- Create followers table
CREATE TABLE IF NOT EXISTS followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  followed_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Unique constraint to prevent duplicate follows
  CONSTRAINT unique_follower_followed UNIQUE (follower_id, followed_id),
  
  -- Check constraint to prevent self-following
  CONSTRAINT no_self_follow CHECK (follower_id != followed_id)
);

-- Add foreign key constraints
DO $$
BEGIN
  -- Foreign key to auth.users for follower
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'followers_follower_id_fkey'
  ) THEN
    ALTER TABLE followers 
    ADD CONSTRAINT followers_follower_id_fkey 
    FOREIGN KEY (follower_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Foreign key to auth.users for followed user
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'followers_followed_id_fkey'
  ) THEN
    ALTER TABLE followers 
    ADD CONSTRAINT followers_followed_id_fkey 
    FOREIGN KEY (followed_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Create policies for followers table

-- Policy: Users can follow others (insert their own follows)
CREATE POLICY "Users can follow others"
  ON followers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

-- Policy: Anyone can read follower relationships (public data for follower counts)
CREATE POLICY "Anyone can read follower relationships"
  ON followers
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can unfollow others (delete their own follows)
CREATE POLICY "Users can unfollow others"
  ON followers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_followed_id ON followers(followed_id);
CREATE INDEX IF NOT EXISTS idx_followers_created_at ON followers(created_at DESC);

-- Create function to get follower count for a user
CREATE OR REPLACE FUNCTION get_follower_count(user_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM followers
    WHERE followed_id = user_id
  );
END;
$$;

-- Create function to get following count for a user
CREATE OR REPLACE FUNCTION get_following_count(user_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM followers
    WHERE follower_id = user_id
  );
END;
$$;

-- Create function to check if user A follows user B
CREATE OR REPLACE FUNCTION is_following(follower_user_id uuid, followed_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM followers
    WHERE follower_id = follower_user_id
    AND followed_id = followed_user_id
  );
END;
$$;

-- Grant execute permissions for the functions
GRANT EXECUTE ON FUNCTION get_follower_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_following_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_following(uuid, uuid) TO authenticated;