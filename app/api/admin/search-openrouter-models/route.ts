import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Check if user is admin
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data: user } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single();

  return user?.is_admin || false;
}

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
  };
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string;
  };
}

interface SearchResult {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  is_free: boolean;
  capabilities: string[];
  provider: string;
}

// POST - Search OpenRouter models
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isUserAdmin = await isAdmin(supabase, authData.user.id);

    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchQuery } = await request.json();

    if (!searchQuery || searchQuery.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Fetch models from OpenRouter API
    const openRouterResponse = await fetch(
      'https://openrouter.ai/api/v1/models',
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!openRouterResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch models from OpenRouter' },
        { status: 500 }
      );
    }

    const openRouterData = await openRouterResponse.json();
    const models: OpenRouterModel[] = openRouterData.data || [];

    // Filter models based on search query
    const searchResults = models
      .filter((model) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          model.name.toLowerCase().includes(searchLower) ||
          model.id.toLowerCase().includes(searchLower) ||
          (model.description &&
            model.description.toLowerCase().includes(searchLower))
        );
      })
      .map((model) => {
        // Extract provider from model ID
        const modelParts = model.id.split('/');
        const provider = modelParts[0] || 'unknown';

        // Generate capabilities based on model features
        const capabilities = ['chat'];
        if (model.architecture?.modality?.includes('image')) {
          capabilities.push('vision');
        }

        // Check if model is free
        const isFree =
          model.pricing?.prompt === '0' && model.pricing?.completion === '0';

        return {
          id: model.id,
          name: model.name,
          description: model.description,
          context_length: model.context_length,
          pricing: model.pricing,
          is_free: isFree,
          capabilities,
          provider,
        } as SearchResult;
      })
      .slice(0, 50); // Limit to 50 results for performance

    return NextResponse.json({
      success: true,
      results: searchResults,
      total: searchResults.length,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/search-openrouter-models:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add selected model to database
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isUserAdmin = await isAdmin(supabase, authData.user.id);

    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const {
      modelId,
      modelName,
      description,
      contextLength,
      pricing,
      capabilities,
      provider,
    } = await request.json();

    if (!modelId || !modelName) {
      return NextResponse.json(
        { error: 'Model ID and name are required' },
        { status: 400 }
      );
    }

    // Check if model already exists
    const { data: existingModel } = await supabase
      .from('models')
      .select('id')
      .eq('name', `openrouter:${modelId}`)
      .single();

    if (existingModel) {
      return NextResponse.json(
        { error: 'Model already exists in database' },
        { status: 409 }
      );
    }

    // Prepare model data
    const modelData = {
      name: `openrouter:${modelId}`,
      display_name: modelName,
      provider_id: 'openrouter',
      provider_name: 'OpenRouter',
      model_id: modelId,
      context_length: contextLength || null,
      max_tokens: null, // We don't have this info from search
      is_enabled: true, // Enabled by default for search-added models
      is_free: pricing?.prompt === '0' && pricing?.completion === '0',
      requires_api_key: false, // Set to false for all new models
      capabilities: capabilities || ['chat'],
      description: description || null,
      sort_order: 0,
    };

    // Insert new model
    const { error } = await supabase.from('models').insert(modelData);

    if (error) {
      return NextResponse.json(
        { error: `Failed to add model: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Model added successfully',
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/search-openrouter-models:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
