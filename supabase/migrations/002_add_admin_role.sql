-- Add is_admin field to users table
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Grant permissions for the new column
GRANT SELECT, UPDATE ON users TO authenticated;
GRANT SELECT ON users TO anon;

-- Update RLS policies to allow users to read their own admin status
CREATE POLICY "Users can read their own admin status" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow admins to read all user data
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (is_admin = true AND auth.uid() = id);