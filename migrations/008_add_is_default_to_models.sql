-- Add is_default field to models table
-- This migration adds the is_default boolean field to the models table
-- and sets the first enabled model as default if none exists

-- Add is_default column to models table
ALTER TABLE public.models 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Create index for better performance on is_default queries
CREATE INDEX IF NOT EXISTS idx_models_is_default ON public.models(is_default);

-- Create function to ensure only one default model and enable it
CREATE OR REPLACE FUNCTION ensure_single_default_model()
RETURNS TRIGGER AS $$
BEGIN
  -- If we're setting a model as default (is_default = true)
  IF NEW.is_default = true THEN
    -- Ensure the default model is also enabled
    NEW.is_enabled = true;
    
    -- Clear all other default flags
    UPDATE public.models 
    SET is_default = false 
    WHERE id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce single default model
DROP TRIGGER IF EXISTS trigger_ensure_single_default_model ON public.models;
CREATE TRIGGER trigger_ensure_single_default_model
  BEFORE INSERT OR UPDATE ON public.models
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_model();

-- Set the first enabled model as default if no default exists
UPDATE public.models 
SET is_default = true 
WHERE id = (
  SELECT id 
  FROM public.models 
  WHERE is_enabled = true 
  ORDER BY sort_order ASC, created_at ASC 
  LIMIT 1
)
AND NOT EXISTS (
  SELECT 1 FROM public.models WHERE is_default = true
);

-- Ensure only one model is marked as default
-- This constraint will be enforced by the application logic
-- but we can add a unique partial index to help with queries
CREATE UNIQUE INDEX IF NOT EXISTS idx_models_single_default 
ON public.models (is_default) 
WHERE is_default = true;
