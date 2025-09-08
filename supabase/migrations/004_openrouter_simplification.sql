-- OpenRouter Simplification Migration
-- This migration removes all non-OpenRouter models and drops the user_keys table

-- Remove all models that are not OpenRouter models
DELETE FROM models WHERE provider_id != 'openrouter';

-- Update remaining models to ensure they have the correct OpenRouter prefix
UPDATE models 
SET name = CASE 
  WHEN name NOT LIKE 'openrouter:%' THEN 'openrouter:' || name
  ELSE name
END
WHERE provider_id = 'openrouter';

-- Drop the user_keys table as we no longer support BYOK
DROP TABLE IF EXISTS user_keys;

-- Remove any references to user API keys in other tables if they exist
-- (This is a safety measure in case there are foreign key references)
DO $$
BEGIN
  -- Check if there are any columns referencing user_keys and handle them
  -- This is a placeholder for any cleanup that might be needed
  NULL;
END $$;

-- Update any model configurations to reflect OpenRouter-only setup
-- Ensure all remaining models are properly configured
UPDATE models 
SET 
  provider_name = 'OpenRouter',
  provider_id = 'openrouter'
WHERE provider_id = 'openrouter';