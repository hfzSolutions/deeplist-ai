-- Create categories table for external AI tools
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
-- Allow everyone to read categories (including anonymous users)
CREATE POLICY "Allow everyone to view categories" ON public.categories
    FOR SELECT
    USING (is_active = true);

-- Only authenticated users can manage categories (for admin functionality)
CREATE POLICY "Allow authenticated users to manage categories" ON public.categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create trigger for updated_at column
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON public.categories TO anon;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

-- Insert default categories from the existing hardcoded list
INSERT INTO public.categories (name, description, sort_order) VALUES
    ('Language Model', 'AI models focused on natural language processing and generation', 1),
    ('AI Assistant', 'General-purpose AI assistants for various tasks', 2),
    ('Image Generation', 'Tools for creating and editing images using AI', 3),
    ('Code Assistant', 'AI tools specifically designed for coding and development', 4),
    ('ML Platform', 'Machine learning platforms and frameworks', 5),
    ('Creative AI', 'AI tools for creative tasks like writing, design, and art', 6),
    ('Data Analysis', 'AI tools for analyzing and processing data', 7),
    ('Voice AI', 'AI tools for speech recognition, synthesis, and processing', 8),
    ('Video AI', 'AI tools for video creation, editing, and analysis', 9),
    ('Other', 'Miscellaneous AI tools that don''t fit other categories', 10)
ON CONFLICT (name) DO NOTHING;

-- Add comment to the table
COMMENT ON TABLE public.categories IS 'Categories for external AI tools with metadata and ordering';