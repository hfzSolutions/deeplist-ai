-- Add agent_id column to messages table
ALTER TABLE public.messages 
ADD COLUMN agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON public.messages(agent_id);

-- Update existing messages to have null agent_id (they will show default avatar)
-- No need to update existing data as NULL is the default