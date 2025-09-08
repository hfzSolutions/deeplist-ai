-- Add DeepSeek R1 free model and set as default
-- Insert DeepSeek R1 free model
INSERT INTO public.models (name, display_name, provider_id, provider_name, model_id, context_length, max_tokens, is_enabled, is_free, requires_api_key, capabilities, description, sort_order) VALUES
('openrouter:deepseek/deepseek-r1:free', 'DeepSeek R1 (Free)', 'openrouter', 'OpenRouter', 'deepseek/deepseek-r1:free', 32768, 4096, true, true, false, ARRAY['chat', 'reasoning'], 'DeepSeek R1 free model via OpenRouter - advanced reasoning capabilities', 1)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  is_enabled = EXCLUDED.is_enabled,
  is_free = EXCLUDED.is_free,
  requires_api_key = EXCLUDED.requires_api_key,
  sort_order = EXCLUDED.sort_order;

-- Add a settings table to store dynamic configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings(key);

-- Create updated_at trigger for app_settings
CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow all users to read settings
CREATE POLICY "Users can view app settings" ON public.app_settings
    FOR SELECT USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage app settings" ON public.app_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- Grant permissions
GRANT SELECT ON public.app_settings TO anon;
GRANT ALL ON public.app_settings TO authenticated;

-- Insert default model setting
INSERT INTO public.app_settings (key, value, description) VALUES
('default_model', '"openrouter:deepseek/deepseek-r1:free"', 'Default model for new chats')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- Success message
SELECT 'DeepSeek R1 model and app settings created successfully!' AS status;