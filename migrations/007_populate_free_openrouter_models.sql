-- Migration to populate free OpenRouter models
-- Clear existing models and insert free models from OpenRouter

-- Clear existing models first
TRUNCATE TABLE public.models RESTART IDENTITY CASCADE;

-- Insert key free OpenRouter models
INSERT INTO public.models (name, display_name, provider_id, provider_name, model_id, context_length, max_tokens, is_enabled, is_free, requires_api_key, capabilities, description, sort_order) VALUES
('openrouter:deepseek/deepseek-r1:free', 'DeepSeek: R1 (free)', 'openrouter', 'OpenRouter', 'deepseek/deepseek-r1:free', 163840, null, true, true, false, ARRAY['chat', 'reasoning'], 'DeepSeek R1: Performance on par with OpenAI o1, but open-sourced with fully open reasoning tokens.', 1),
('openrouter:meta-llama/llama-3.3-70b-instruct:free', 'Meta: Llama 3.3 70B Instruct (free)', 'openrouter', 'OpenRouter', 'meta-llama/llama-3.3-70b-instruct:free', 65536, null, true, true, false, ARRAY['chat', 'tools'], 'Meta Llama 3.3 multilingual large language model optimized for dialogue use cases.', 2),
('openrouter:meta-llama/llama-3.2-3b-instruct:free', 'Meta: Llama 3.2 3B Instruct (free)', 'openrouter', 'OpenRouter', 'meta-llama/llama-3.2-3b-instruct:free', 131072, null, true, true, false, ARRAY['chat'], 'Llama 3.2 3B is a 3-billion-parameter multilingual large language model.', 3),
('openrouter:meta-llama/llama-3.2-11b-vision-instruct:free', 'Meta: Llama 3.2 11B Vision Instruct (free)', 'openrouter', 'OpenRouter', 'meta-llama/llama-3.2-11b-vision-instruct:free', 131072, 2048, true, true, false, ARRAY['chat', 'vision'], 'Llama 3.2 11B Vision multimodal model for tasks combining visual and textual data.', 4),
('openrouter:google/gemma-2-9b-it:free', 'Google: Gemma 2 9B (free)', 'openrouter', 'OpenRouter', 'google/gemma-2-9b-it:free', 8192, 8192, true, true, false, ARRAY['chat'], 'Gemma 2 9B by Google is an advanced, open-source language model.', 5),
('openrouter:mistralai/mistral-7b-instruct:free', 'Mistral: Mistral 7B Instruct (free)', 'openrouter', 'OpenRouter', 'mistralai/mistral-7b-instruct:free', 32768, 16384, true, true, false, ARRAY['chat', 'tools'], 'A high-performing, industry-standard 7.3B parameter model.', 6),
('openrouter:mistralai/mistral-nemo:free', 'Mistral: Mistral Nemo (free)', 'openrouter', 'OpenRouter', 'mistralai/mistral-nemo:free', 131072, 128000, true, true, false, ARRAY['chat'], 'A 12B parameter model with 128k token context length built by Mistral.', 7),
('openrouter:qwen/qwen-2.5-72b-instruct:free', 'Qwen2.5 72B Instruct (free)', 'openrouter', 'OpenRouter', 'qwen/qwen-2.5-72b-instruct:free', 32768, null, true, true, false, ARRAY['chat'], 'Qwen2.5 72B brings significant improvements in coding and mathematics.', 8),
('openrouter:qwen/qwen-2.5-coder-32b-instruct:free', 'Qwen2.5 Coder 32B Instruct (free)', 'openrouter', 'OpenRouter', 'qwen/qwen-2.5-coder-32b-instruct:free', 32768, null, true, true, false, ARRAY['chat'], 'Qwen2.5-Coder brings significant improvements in code generation and reasoning.', 9),
('openrouter:google/gemini-2.0-flash-exp:free', 'Google: Gemini 2.0 Flash Experimental (free)', 'openrouter', 'OpenRouter', 'google/gemini-2.0-flash-exp:free', 1048576, 8192, true, true, false, ARRAY['chat', 'vision', 'tools'], 'Gemini Flash 2.0 offers significantly faster time to first token with multimodal capabilities.', 10);

-- Set DeepSeek R1 free model as default using is_default field
UPDATE public.models 
SET is_default = true 
WHERE model_id = 'deepseek/deepseek-r1:free' 
AND is_enabled = true;

-- Ensure only one model is marked as default
UPDATE public.models 
SET is_default = false 
WHERE model_id != 'deepseek/deepseek-r1:free' 
OR is_enabled = false;