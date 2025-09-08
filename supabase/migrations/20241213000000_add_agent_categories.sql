-- Add category support to agents table
-- This migration adds category_id column to agents table with foreign key to categories

-- Add category_id column to agents table
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS category_id UUID;

-- Add foreign key constraint to categories table
ALTER TABLE public.agents 
ADD CONSTRAINT fk_agents_category_id 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_agents_category_id ON public.agents(category_id);

-- Update existing agents to have a default category ("Other")
-- This ensures backward compatibility
UPDATE public.agents 
SET category_id = (
    SELECT id 
    FROM public.categories 
    WHERE name = 'Other' 
    LIMIT 1
)
WHERE category_id IS NULL;

-- Add comment to the column
COMMENT ON COLUMN public.agents.category_id IS 'Foreign key reference to categories table for agent categorization';

-- Grant necessary permissions
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.agents TO anon, authenticated;