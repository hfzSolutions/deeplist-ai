-- Storage policies for chat-attachments bucket
-- This allows authenticated users to upload, view, and manage their own files

-- Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to upload files to chat-attachments bucket
CREATE POLICY "Allow authenticated users to upload files to chat-attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

-- Policy 2: Allow authenticated users to view files in chat-attachments bucket
CREATE POLICY "Allow authenticated users to view files in chat-attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'chat-attachments');

-- Policy 3: Allow authenticated users to update their own files in chat-attachments bucket
CREATE POLICY "Allow authenticated users to update their own files in chat-attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy 4: Allow authenticated users to delete their own files in chat-attachments bucket
CREATE POLICY "Allow authenticated users to delete their own files in chat-attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy 5: Allow public access to view files in chat-attachments bucket (for public URLs)
CREATE POLICY "Allow public to view files in chat-attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'chat-attachments');
