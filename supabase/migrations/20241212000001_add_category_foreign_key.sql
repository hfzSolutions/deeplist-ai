-- Modify external_ai_tools table to use foreign key relationship with categories

-- First, let's update existing category values to match the new category IDs
-- We'll create a temporary mapping and update the records

-- Add a new column for category_id (UUID)
ALTER TABLE public.external_ai_tools 
ADD COLUMN IF NOT EXISTS category_id UUID;

-- Update category_id based on existing category text values
UPDATE public.external_ai_tools 
SET category_id = (
    SELECT c.id 
    FROM public.categories c 
    WHERE c.name = external_ai_tools.category
)
WHERE category_id IS NULL;

-- Set default category for any tools that don't match existing categories
UPDATE public.external_ai_tools 
SET category_id = (
    SELECT c.id 
    FROM public.categories c 
    WHERE c.name = 'Other'
)
WHERE category_id IS NULL;

-- Make category_id NOT NULL
ALTER TABLE public.external_ai_tools 
ALTER COLUMN category_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE public.external_ai_tools 
ADD CONSTRAINT fk_external_ai_tools_category 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_external_ai_tools_category_id ON public.external_ai_tools(category_id);

-- Drop the old category column (we'll keep it for now for backward compatibility)
-- We can remove this in a future migration once all code is updated
-- ALTER TABLE public.external_ai_tools DROP COLUMN category;

-- Add comment
COMMENT ON COLUMN public.external_ai_tools.category_id IS 'Foreign key reference to categories table';

-- Update the existing index to use category_id instead of category
DROP INDEX IF EXISTS idx_external_ai_tools_category;
CREATE INDEX IF NOT EXISTS idx_external_ai_tools_category_id ON public.external_ai_tools(category_id);