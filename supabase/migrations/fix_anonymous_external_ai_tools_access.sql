-- Fix anonymous access to external AI tools
-- This migration ensures anonymous users can view all external AI tools

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous users to view external AI tools" ON public.external_ai_tools;

-- Create policy for anonymous users to view all external AI tools
CREATE POLICY "Allow anonymous users to view external AI tools" ON public.external_ai_tools
  FOR SELECT
  TO anon
  USING (true);

-- Grant SELECT permissions to anon role
GRANT SELECT ON public.external_ai_tools TO anon;

-- Verify the policy was created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'external_ai_tools' 
  AND policyname = 'Allow anonymous users to view external AI tools';