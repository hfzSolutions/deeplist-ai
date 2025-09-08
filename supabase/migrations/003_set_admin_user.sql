-- Set the first user as admin for testing
-- Replace 'your-email@example.com' with your actual email
UPDATE users 
SET is_admin = true 
WHERE email = 'your-email@example.com';

-- If you want to set the first user as admin regardless of email:
-- UPDATE users 
-- SET is_admin = true 
-- WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);