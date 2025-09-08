-- Add video_url column to external_ai_tools table
ALTER TABLE public.external_ai_tools 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN public.external_ai_tools.video_url IS 'Optional video URL for the external AI tool (e.g., demo, tutorial, or promotional video)';