-- Create favorite_agents table
CREATE TABLE IF NOT EXISTS public.favorite_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, agent_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorite_agents_user_id ON public.favorite_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_agents_agent_id ON public.favorite_agents(agent_id);

-- Enable RLS
ALTER TABLE public.favorite_agents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own favorite agents" ON public.favorite_agents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorite agents" ON public.favorite_agents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite agents" ON public.favorite_agents
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.favorite_agents TO anon, authenticated;

-- Comment
COMMENT ON TABLE public.favorite_agents IS 'User favorite agents for quick access';