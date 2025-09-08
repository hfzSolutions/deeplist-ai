-- Add DELETE policy for users table
-- This allows users to delete their own profile if needed

CREATE POLICY "Users can delete their own profile" ON public.users
    FOR DELETE USING (auth.uid() = id);

-- Grant permissions (if not already granted)
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Success message
SELECT 'Users DELETE policy created successfully!' AS status;

-- Note: This policy allows users to delete their own profile.
-- Consider the implications of allowing profile deletion in your application.
-- You may want to implement soft deletion or additional safeguards.