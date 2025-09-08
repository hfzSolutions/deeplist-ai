-- Storage bucket policies for assets bucket
-- This file contains the RLS policies needed for the assets storage bucket
-- Run this in your Supabase SQL editor after creating the assets bucket

-- Enable RLS on storage.objects table (if not already enabled)
-- Note: This is usually enabled by default in Supabase

-- Assets bucket policies
-- Allow authenticated users to upload files to their own folder in assets bucket
CREATE POLICY "Users can upload to assets bucket" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assets' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow authenticated users to view files in assets bucket
CREATE POLICY "Users can view assets bucket" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'assets' AND
    auth.role() = 'authenticated'
  );

-- Allow users to update their own files in assets bucket
CREATE POLICY "Users can update their own files in assets bucket" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'assets' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow users to delete their own files in assets bucket
CREATE POLICY "Users can delete their own files in assets bucket" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'assets' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Success message
SELECT 'Assets bucket storage policies created successfully!' AS status;

-- Note: The folder structure expected is:
-- assets/{folder_type}/{user_id}/filename.ext
-- Examples:
-- assets/external-ai-tools/{user_id}/logo.png
-- assets/avatars/{user_id}/avatar.jpg
--
-- Where {user_id} is the authenticated user's UUID from auth.uid()
-- and {folder_type} can be any subfolder (external-ai-tools, avatars, etc.)