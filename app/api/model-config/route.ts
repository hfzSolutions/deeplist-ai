import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Fetch the default model from database
    const { data: defaultModelData, error } = await supabase
      .from('models')
      .select('model_id')
      .eq('is_enabled', true)
      .eq('is_default', true)
      .single();

    if (error || !defaultModelData) {
      // Fallback to a known working model if no default is set
      return NextResponse.json({
        defaultModel: 'openrouter:deepseek/deepseek-r1:free',
      });
    }

    return NextResponse.json({
      defaultModel: defaultModelData.model_id,
    });
  } catch (error) {
    console.error('Error fetching model config:', error);
    return NextResponse.json(
      {
        defaultModel: 'openrouter:deepseek/deepseek-r1:free',
        error: 'Failed to fetch model config',
      },
      { status: 500 }
    );
  }
}
