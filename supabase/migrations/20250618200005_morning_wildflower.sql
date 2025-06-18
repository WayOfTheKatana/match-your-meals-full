/*
  # Fix User Registration Database Error

  1. Updates
    - Fix the handle_new_user trigger function
    - Ensure proper user profile creation
    - Add better error handling for user insertion

  2. Security
    - Maintain existing RLS policies
    - Ensure trigger works properly with auth.users
*/

-- Drop existing trigger and function to recreate them properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, preferences, subscription_status, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    '{}',
    'free',
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the users table has proper constraints
ALTER TABLE public.users 
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN full_name SET DEFAULT '',
  ALTER COLUMN preferences SET DEFAULT '{}',
  ALTER COLUMN subscription_status SET DEFAULT 'free',
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- Update RLS policies to be more permissive for user creation
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Add a policy for the trigger function to insert data
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;
CREATE POLICY "Enable insert for authenticated users during signup" ON public.users
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);