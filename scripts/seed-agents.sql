-- Insert default public agents
INSERT INTO agents (id, name, description, system_prompt, model, avatar_url, is_public, user_id, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'General Assistant',
    'A helpful AI assistant for general questions and tasks',
    'You are a helpful, harmless, and honest AI assistant. You provide accurate information and assist users with a wide variety of tasks.',
    'gpt-4',
    null,
    true,
    null,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Code Helper',
    'Specialized in programming and software development',
    'You are an expert software developer and programming assistant. You help users write, debug, and optimize code across various programming languages and frameworks.',
    'gpt-4',
    null,
    true,
    null,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Creative Writer',
    'Assists with creative writing and storytelling',
    'You are a creative writing assistant. You help users with storytelling, creative writing, poetry, and other forms of creative expression. You provide inspiration, feedback, and guidance.',
    'gpt-4',
    null,
    true,
    null,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Research Assistant',
    'Helps with research and analysis tasks',
    'You are a research assistant specializing in gathering, analyzing, and synthesizing information. You help users with research projects, fact-checking, and data analysis.',
    'gpt-4',
    null,
    true,
    null,
    now(),
    now()
  );