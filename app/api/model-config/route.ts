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
      .select('name')
      .eq('is_enabled', true)
      .eq('is_default', true)
      .single();

    if (error || !defaultModelData) {
      return NextResponse.json(
        { error: 'No default model configured' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      defaultModel: defaultModelData.name,
    });
  } catch (error) {
    console.error('Error fetching model config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model config' },
      { status: 500 }
    );
  }
}
