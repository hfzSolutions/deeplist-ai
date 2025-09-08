-- Populate models table with OpenRouter model IDs
-- Clear existing models first
DELETE FROM public.models;

-- Insert popular OpenRouter models
INSERT INTO public.models (name, display_name, provider_id, provider_name, model_id, context_length, max_tokens, is_enabled, is_free, requires_api_key, capabilities, description, sort_order) VALUES
-- Free models
('openrouter:deepseek/deepseek-r1:free', 'DeepSeek R1 (Free)', 'openrouter', 'OpenRouter', 'deepseek/deepseek-r1:free', 32768, 4096, true, true, false, ARRAY['chat', 'reasoning'], 'DeepSeek R1 free model - advanced reasoning capabilities', 1),
('openrouter:meta-llama/llama-3.2-3b-instruct:free', 'Llama 3.2 3B (Free)', 'openrouter', 'OpenRouter', 'meta-llama/llama-3.2-3b-instruct:free', 131072, 2048, true, true, false, ARRAY['chat'], 'Meta Llama 3.2 3B Instruct free model', 2),
('openrouter:microsoft/phi-3-mini-128k-instruct:free', 'Phi-3 Mini (Free)', 'openrouter', 'OpenRouter', 'microsoft/phi-3-mini-128k-instruct:free', 128000, 4096, true, true, false, ARRAY['chat'], 'Microsoft Phi-3 Mini free model with 128k context', 3),
('openrouter:google/gemma-2-9b-it:free', 'Gemma 2 9B (Free)', 'openrouter', 'OpenRouter', 'google/gemma-2-9b-it:free', 8192, 8192, true, true, false, ARRAY['chat'], 'Google Gemma 2 9B Instruct free model', 4),

-- Premium OpenAI models
('openrouter:openai/gpt-4o', 'GPT-4o', 'openrouter', 'OpenRouter', 'openai/gpt-4o', 128000, 16384, true, false, false, ARRAY['chat', 'vision'], 'OpenAI GPT-4o - latest multimodal model', 10),
('openrouter:openai/gpt-4o-mini', 'GPT-4o Mini', 'openrouter', 'OpenRouter', 'openai/gpt-4o-mini', 128000, 16384, true, false, false, ARRAY['chat', 'vision'], 'OpenAI GPT-4o Mini - cost-effective multimodal model', 11),
('openrouter:openai/gpt-4-turbo', 'GPT-4 Turbo', 'openrouter', 'OpenRouter', 'openai/gpt-4-turbo', 128000, 4096, true, false, false, ARRAY['chat', 'vision'], 'OpenAI GPT-4 Turbo with vision capabilities', 12),
('openrouter:openai/gpt-3.5-turbo', 'GPT-3.5 Turbo', 'openrouter', 'OpenRouter', 'openai/gpt-3.5-turbo', 16385, 4096, true, false, false, ARRAY['chat'], 'OpenAI GPT-3.5 Turbo', 13),

-- Anthropic Claude models
('openrouter:anthropic/claude-3.5-sonnet', 'Claude 3.5 Sonnet', 'openrouter', 'OpenRouter', 'anthropic/claude-3.5-sonnet', 200000, 8192, true, false, false, ARRAY['chat', 'vision'], 'Anthropic Claude 3.5 Sonnet - most capable model', 20),
('openrouter:anthropic/claude-3.5-haiku', 'Claude 3.5 Haiku', 'openrouter', 'OpenRouter', 'anthropic/claude-3.5-haiku', 200000, 8192, true, false, false, ARRAY['chat', 'vision'], 'Anthropic Claude 3.5 Haiku - fast and efficient', 21),
('openrouter:anthropic/claude-3-opus', 'Claude 3 Opus', 'openrouter', 'OpenRouter', 'anthropic/claude-3-opus', 200000, 4096, true, false, false, ARRAY['chat', 'vision'], 'Anthropic Claude 3 Opus - most powerful model', 22),

-- Google models
('openrouter:google/gemini-pro-1.5', 'Gemini Pro 1.5', 'openrouter', 'OpenRouter', 'google/gemini-pro-1.5', 2097152, 8192, true, false, false, ARRAY['chat', 'vision'], 'Google Gemini Pro 1.5 with massive context window', 30),
('openrouter:google/gemini-flash-1.5', 'Gemini Flash 1.5', 'openrouter', 'OpenRouter', 'google/gemini-flash-1.5', 1048576, 8192, true, false, false, ARRAY['chat', 'vision'], 'Google Gemini Flash 1.5 - fast and efficient', 31),

-- Meta Llama models
('openrouter:meta-llama/llama-3.1-405b-instruct', 'Llama 3.1 405B', 'openrouter', 'OpenRouter', 'meta-llama/llama-3.1-405b-instruct', 131072, 4096, true, false, false, ARRAY['chat'], 'Meta Llama 3.1 405B Instruct - largest open model', 40),
('openrouter:meta-llama/llama-3.1-70b-instruct', 'Llama 3.1 70B', 'openrouter', 'OpenRouter', 'meta-llama/llama-3.1-70b-instruct', 131072, 4096, true, false, false, ARRAY['chat'], 'Meta Llama 3.1 70B Instruct', 41),
('openrouter:meta-llama/llama-3.1-8b-instruct', 'Llama 3.1 8B', 'openrouter', 'OpenRouter', 'meta-llama/llama-3.1-8b-instruct', 131072, 4096, true, false, false, ARRAY['chat'], 'Meta Llama 3.1 8B Instruct', 42),

-- Specialized models
('openrouter:perplexity/llama-3.1-sonar-large-128k-online', 'Perplexity Sonar Large', 'openrouter', 'OpenRouter', 'perplexity/llama-3.1-sonar-large-128k-online', 127072, 4096, true, false, false, ARRAY['chat', 'search'], 'Perplexity Sonar with web search capabilities', 50),
('openrouter:mistralai/mistral-large', 'Mistral Large', 'openrouter', 'OpenRouter', 'mistralai/mistral-large', 128000, 8192, true, false, false, ARRAY['chat'], 'Mistral Large - flagship model', 51),
('openrouter:cohere/command-r-plus', 'Command R+', 'openrouter', 'OpenRouter', 'cohere/command-r-plus', 128000, 4096, true, false, false, ARRAY['chat'], 'Cohere Command R+ - enterprise-grade model', 52)

ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  provider_id = EXCLUDED.provider_id,
  provider_name = EXCLUDED.provider_name,
  model_id = EXCLUDED.model_id,
  context_length = EXCLUDED.context_length,
  max_tokens = EXCLUDED.max_tokens,
  is_enabled = EXCLUDED.is_enabled,
  is_free = EXCLUDED.is_free,
  requires_api_key = EXCLUDED.requires_api_key,
  capabilities = EXCLUDED.capabilities,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Update default model setting to use DeepSeek R1 free
UPDATE public.app_settings 
SET value = '"openrouter:deepseek/deepseek-r1:free"', updated_at = NOW() 
WHERE key = 'default_model';