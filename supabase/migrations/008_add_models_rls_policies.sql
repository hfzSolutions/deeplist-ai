-- Add RLS policies for models table
-- This migration adds row-level security policies to allow:
-- - Public read access to all models
-- - Admin-only write access (insert, update, delete)

-- Enable RLS on models table (if not already enabled)
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view models
CREATE POLICY "Anyone can view models" ON public.models
  FOR SELECT USING (true);

-- Policy: Admins can insert models
CREATE POLICY "Admins can insert models" ON public.models
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Admins can update models
CREATE POLICY "Admins can update models" ON public.models
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Admins can delete models
CREATE POLICY "Admins can delete models" ON public.models
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Grant necessary permissions for the models table
GRANT SELECT ON public.models TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.models TO authenticated;