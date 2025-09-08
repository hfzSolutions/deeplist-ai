-- Add pricing column to external_ai_tools table
ALTER TABLE public.external_ai_tools 
ADD COLUMN IF NOT EXISTS pricing TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN public.external_ai_tools.pricing IS 'Pricing model for the external AI tool: free, paid, or freemium';

-- Add check constraint to ensure valid pricing values
ALTER TABLE public.external_ai_tools 
ADD CONSTRAINT check_pricing_values 
CHECK (pricing IS NULL OR pricing IN ('free', 'paid', 'freemium'));

-- Create index for better performance when filtering by pricing
CREATE INDEX IF NOT EXISTS idx_external_ai_tools_pricing ON public.external_ai_tools(pricing);
