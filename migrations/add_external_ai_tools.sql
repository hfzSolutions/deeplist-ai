-- Create external_ai_tools table to store user's external AI tools
CREATE TABLE IF NOT EXISTS public.external_ai_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    website TEXT NOT NULL,
    logo TEXT,
    category TEXT NOT NULL,
    featured BOOLEAN DEFAULT false,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_external_ai_tools_user_id ON public.external_ai_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_external_ai_tools_category ON public.external_ai_tools(category);
CREATE INDEX IF NOT EXISTS idx_external_ai_tools_featured ON public.external_ai_tools(featured);
CREATE INDEX IF NOT EXISTS idx_external_ai_tools_created_at ON public.external_ai_tools(created_at DESC);

-- Enable RLS
ALTER TABLE public.external_ai_tools ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own external AI tools" ON public.external_ai_tools
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own external AI tools" ON public.external_ai_tools
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own external AI tools" ON public.external_ai_tools
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own external AI tools" ON public.external_ai_tools
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at column
CREATE TRIGGER update_external_ai_tools_updated_at
    BEFORE UPDATE ON public.external_ai_tools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.external_ai_tools TO authenticated;
GRANT ALL ON public.external_ai_tools TO service_role;