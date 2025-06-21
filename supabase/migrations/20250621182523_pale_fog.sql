/*
  # Storage Policies for Recipe Images

  1. Storage Setup
    - Create policies for matchmymeals-images bucket
    - Allow authenticated users to upload, view, and delete their own images
    - Enable public access for viewing images

  2. Security
    - Users can only upload to their own folder (user_id/)
    - Users can only delete their own images
    - Public read access for all images (for recipe viewing)
    - Authenticated users can upload images
*/

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for viewing images (public read access)
CREATE POLICY "Public read access for recipe images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'matchmymeals-images');

-- Policy for uploading images (authenticated users only, to their own folder)
CREATE POLICY "Authenticated users can upload recipe images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'matchmymeals-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for updating images (users can update their own images)
CREATE POLICY "Users can update their own recipe images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'matchmymeals-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'matchmymeals-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for deleting images (users can delete their own images)
CREATE POLICY "Users can delete their own recipe images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'matchmymeals-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Ensure the bucket exists and is public for reads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'matchmymeals-images',
  'matchmymeals-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];