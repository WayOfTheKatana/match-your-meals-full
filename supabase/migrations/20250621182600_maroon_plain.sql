/*
  # Storage Policies for Recipe Images

  1. Storage Setup
    - Configure matchmymeals-images bucket
    - Set up proper RLS policies for image uploads
    - Enable public read access for recipe images

  2. Security
    - Users can only upload to their own folder
    - Public read access for viewing recipe images
    - Authenticated users can manage their own images

  3. File Restrictions
    - Only image files allowed (JPEG, PNG, GIF, WebP)
    - 5MB file size limit
*/

-- First, ensure the bucket exists with proper configuration
-- This will create the bucket if it doesn't exist, or update it if it does
DO $$
BEGIN
  -- Insert or update the bucket configuration
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'matchmymeals-images',
    'matchmymeals-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  )
  ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
END $$;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public read access for recipe images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload recipe images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own recipe images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own recipe images" ON storage.objects;

-- Create storage policies using the proper approach
-- Policy for public read access to recipe images
CREATE POLICY "Public read access for recipe images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'matchmymeals-images');

-- Policy for authenticated users to upload images to their own folder
CREATE POLICY "Authenticated users can upload recipe images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'matchmymeals-images' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Policy for users to update their own images
CREATE POLICY "Users can update their own recipe images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'matchmymeals-images' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
)
WITH CHECK (
  bucket_id = 'matchmymeals-images' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Policy for users to delete their own images
CREATE POLICY "Users can delete their own recipe images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'matchmymeals-images' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Ensure RLS is enabled on storage.objects (this should already be enabled by default)
-- We'll use a safer approach that doesn't require table ownership
DO $$
BEGIN
  -- This will only enable RLS if it's not already enabled
  -- and we have the necessary permissions
  IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects') THEN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    -- RLS is likely already enabled, which is what we want
    NULL;
END $$;