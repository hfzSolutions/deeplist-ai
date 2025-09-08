-- Add RLS policies to allow anonymous users to access public data

-- Policy for anonymous users to view public agents
CREATE POLICY "Allow anonymous users to view public agents" ON public.agents
  FOR SELECT
  TO anon
  USING (is_public = true);

-- Policy for anonymous users to view all external AI tools
CREATE POLICY "Allow anonymous users to view external AI tools" ON public.external_ai_tools
  FOR SELECT
  TO anon
  USING (true);

-- Grant SELECT permissions to anon role for these tables
GRANT SELECT ON public.agents TO anon;
GRANT SELECT ON public.external_ai_tools TO anon;

-- Note: The agents table already has a policy for authenticated users to view public agents
-- This migration adds the missing policy for anonymous (unauthenticate