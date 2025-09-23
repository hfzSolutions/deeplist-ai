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

interface SyncResult {
  total_fetched: number;
  free_models: number;
  new_models: number;
  updated_models: number;
  errors: string[];
}

// POST - Preview OpenRouter models sync (no database changes)
export async function POST() {
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

    const result: SyncResult = {
      total_fetched: models.length,
      free_models: 0,
      new_models: 0,
      updated_models: 0,
      errors: [],
    };

    // Filter for free models (pricing.prompt === "0" and pricing.completion === "0")
    const freeModels = models.filter((model) => {
      const isFree =
        model.pricing?.prompt === '0' && model.pricing?.completion === '0';
      if (isFree) result.free_models++;
      return isFree;
    });

    // Preview changes without applying them
    for (const model of freeModels) {
      try {
        // Extract provider from model ID (e.g., "openai/gpt-4" -> "openai")
        const modelParts = model.id.split('/');
        const provider = modelParts[0] || 'unknown';
        const modelName = modelParts.slice(1).join('/') || model.id;

        // Generate capabilities based on model features
        const capabilities = ['chat'];
        if (model.architecture?.modality?.includes('image')) {
          capabilities.push('vision');
        }

        // Prepare model data
        const modelData = {
          name: `openrouter:${model.id}`,
          display_name: model.name,
          provider_id: 'openrouter',
          provider_name: 'OpenRouter',
          model_id: model.id,
          context_length: model.context_length || null,
          max_tokens: model.top_provider?.max_completion_tokens || null,
          is_enabled: false,
          is_free: true,
          requires_api_key: false,
          capabilities,
          description: model.description || null,
          sort_order: 0,
        };

        // Check if model already exists (preview only)
        const { data: existingModel } = await supabase
          .from('models')
          .select('id')
          .eq('name', modelData.name)
          .single();

        if (existingModel) {
          result.updated_models++;
        } else {
          result.new_models++;
        }
      } catch (error) {
        result.errors.push(`Error processing ${model.id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      result,
      preview: true, // Indicate this is a preview
    });
  } catch (error) {
    console.error('Error in POST /api/admin/sync-openrouter-models:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Apply OpenRouter models sync (actually update database)
export async function PUT() {
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

    const result: SyncResult = {
      total_fetched: models.length,
      free_models: 0,
      new_models: 0,
      updated_models: 0,
      errors: [],
    };

    // Filter for free models (pricing.prompt === "0" and pricing.completion === "0")
    const freeModels = models.filter((model) => {
      const isFree =
        model.pricing?.prompt === '0' && model.pricing?.completion === '0';
      if (isFree) result.free_models++;
      return isFree;
    });

    // Apply changes to database
    for (const model of freeModels) {
      try {
        // Extract provider from model ID (e.g., "openai/gpt-4" -> "openai")
        const modelParts = model.id.split('/');
        const provider = modelParts[0] || 'unknown';
        const modelName = modelParts.slice(1).join('/') || model.id;

        // Generate capabilities based on model features
        const capabilities = ['chat'];
        if (model.architecture?.modality?.includes('image')) {
          capabilities.push('vision');
        }

        // Prepare model data
        const modelData = {
          name: `openrouter:${model.id}`,
          display_name: model.name,
          provider_id: 'openrouter',
          provider_name: 'OpenRouter',
          model_id: model.id,
          context_length: model.context_length || null,
          max_tokens: model.top_provider?.max_completion_tokens || null,
          is_enabled: false,
          is_free: true,
          requires_api_key: false,
          capabilities,
          description: model.description || null,
          sort_order: 0,
        };

        // Check if model already exists
        const { data: existingModel } = await supabase
          .from('models')
          .select('id')
          .eq('name', modelData.name)
          .single();

        if (existingModel) {
          // Update existing model
          const { error } = await supabase
            .from('models')
            .update(modelData)
            .eq('name', modelData.name);

          if (error) {
            result.errors.push(
              `Failed to update ${model.id}: ${error.message}`
            );
          } else {
            result.updated_models++;
          }
        } else {
          // Insert new model
          const { error } = await supabase.from('models').insert(modelData);

          if (error) {
            result.errors.push(
              `Failed to insert ${model.id}: ${error.message}`
            );
          } else {
            result.new_models++;
          }
        }
      } catch (error) {
        result.errors.push(`Error processing ${model.id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/sync-openrouter-models:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
