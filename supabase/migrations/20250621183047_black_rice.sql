/*
  # Storage Configuration for Recipe Images

  1. Storage Setup
    - Create or update `matchmymeals-images` bucket
    - Configure public access, file size limits, and allowed MIME types
  
  2. Security Policies
    - Public read access for all recipe images
    - Authenticated users can upload to their own folder (user_id/filename)
    - Users can only update/delete their own images
  
  3. File Organization
    - Images stored as: `user_id/timestamp-random.ext`
    - Public URLs available for recipe display
*/

-- First, ensure the bucket exists with proper configuration
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

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public read access for recipe images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload recipe images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own recipe images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own recipe images" ON storage.objects;

-- Create storage policies for recipe images
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