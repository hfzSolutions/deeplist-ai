import { getEffectiveApiKey } from '@/lib/user-keys';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

export const maxDuration = 30;

type GenerateAgentRequest = {
  description: string;
};

type GeneratedAgentDetails = {
  name: string;
  description: string;
  system_prompt: string;
  avatar_description: string;
};

export async function POST(req: Request) {
  try {
    const { description } = (await req.json()) as GenerateAgentRequest;

    if (!description || description.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Description is required' }),
        { status: 400 }
      );
    }

    // Get system OpenRouter API key
    const apiKey = await getEffectiveApiKey();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not available' }), {
        status: 500,
      });
    }

    // Use OpenRouter SDK with a fast, capable model
    const openrouter = createOpenRouter({
      apiKey,
    });

    // Use a fast and capable model for generation
    const modelId =
      process.env.AGENT_GENERATION_MODEL || 'deepseek/deepseek-r1:free';
    const model = openrouter(modelId);

    const systemPrompt = `You are an AI assistant that helps create detailed agent configurations. Based on the user's description, generate appropriate agent details.

You must respond with a valid JSON object containing exactly these four fields:
- name: A concise, descriptive name for the agent (2-4 words)
- description: A brief description of what the agent does (1-2 sentences)
- system_prompt: A detailed system prompt that defines the agent's personality, expertise, and behavior (2-4 paragraphs)
- avatar_description: A detailed description for generating an avatar image that represents this agent (1-2 sentences, focus on visual appearance, style, and personality representation)

Make sure the system_prompt is comprehensive and includes:
- The agent's role and expertise
- Communication style and personality
- Specific instructions for how to behave
- Any relevant guidelines or constraints

Respond only with the JSON object, no additional text.`;

    const userPrompt = `Create an AI agent based on this description: "${description.trim()}"

Generate appropriate name, description, system_prompt, and avatar_description for this agent.`;

    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 1000,
    });

    // Parse the generated response
    let generatedDetails: GeneratedAgentDetails;
    try {
      generatedDetails = JSON.parse(result.text);
    } catch (parseError) {
      console.error('Failed to parse generated response:', result.text);
      return new Response(
        JSON.stringify({ error: 'Failed to generate valid agent details' }),
        { status: 500 }
      );
    }

    // Validate the response structure
    if (
      !generatedDetails.name ||
      !generatedDetails.description ||
      !generatedDetails.system_prompt ||
      !generatedDetails.avatar_description
    ) {
      return new Response(
        JSON.stringify({ error: 'Generated response missing required fields' }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(generatedDetails), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in /api/generate-agent-details:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate agent details' }),
      { status: 500 }
    );
  }
}
