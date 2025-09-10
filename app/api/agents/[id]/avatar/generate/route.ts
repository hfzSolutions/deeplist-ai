import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify agent ownership
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, avatar_url, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      );
    }

    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    // Get ImageRouter configuration from environment
    const apiKey = process.env.VITE_IMAGEROUTER_API_KEY;
    const modelName = process.env.VITE_IMAGEROUTER_MODEL_NAME;

    if (!apiKey || !modelName) {
      return NextResponse.json(
        { error: 'ImageRouter configuration not found' },
        { status: 500 }
      );
    }

    // Call ImageRouter API to generate image
    const imageResponse = await fetch(
      'https://ir-api.myqa.cc/v1/openai/images/generations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: modelName,
          quality: 'auto',
        }),
      }
    );

    if (!imageResponse.ok) {
      const errorData = await imageResponse.json().catch(() => ({}));
      console.error('ImageRouter API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      );
    }

    const imageData = await imageResponse.json();

    // Extract image URL from response
    const imageUrl = imageData?.data?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL in response' },
        { status: 500 }
      );
    }

    // Download the generated image
    const downloadResponse = await fetch(imageUrl);
    if (!downloadResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to download generated image' },
        { status: 500 }
      );
    }

    const imageBuffer = await downloadResponse.arrayBuffer();

    // Compress the image using Sharp
    const compressedBuffer = await sharp(Buffer.from(imageBuffer))
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 70,
        progressive: true,
      })
      .toBuffer();

    const buffer = new Uint8Array(compressedBuffer);

    // Delete existing avatar if it exists
    if (agent.avatar_url) {
      try {
        const urlParts = agent.avatar_url.split('/');
        const pathIndex = urlParts.findIndex((part) => part === 'agents');
        if (pathIndex !== -1 && pathIndex < urlParts.length - 1) {
          const filePath = urlParts.slice(pathIndex).join('/');
          await supabase.storage.from('assets').remove([filePath]);
        }
      } catch (error) {
        console.warn('Failed to delete existing avatar:', error);
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = `agents/${user.id}/${timestamp}-${randomId}-generated.jpg`;

    // Upload generated image to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('assets')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload generated avatar' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { error: 'Failed to get avatar URL' },
        { status: 500 }
      );
    }

    // Update agent with new avatar URL
    const { data: updatedAgent, error: updateError } = await supabase
      .from('agents')
      .update({
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update agent avatar' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Avatar generated successfully',
      avatar_url: urlData.publicUrl,
      agent: updatedAgent,
      prompt: prompt.trim(),
    });
  } catch (error) {
    console.error('Error generating agent avatar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
