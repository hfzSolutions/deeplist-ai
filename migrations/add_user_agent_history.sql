-- Create user_agent_history table to track agents users have interacted with
CREATE TABLE IF NOT EXISTS public.user_agent_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, agent_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_agent_history_user_id ON public.user_agent_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agent_history_agent_id ON public.user_agent_history(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_agent_history_last_used_at ON public.user_agent_history(last_used_at DESC);

-- Enable RLS
ALTER TABLE public.user_agent_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own agent history" ON public.user_agent_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent history" ON public.user_agent_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent history" ON public.user_agent_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent history" ON public.user_agent_history
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.user_agent_history TO anon, authenticated;

-- Comment
COMMENT ON TABLE public.user_agent_history IS 'Track agents that users have interacted with for quick access history';