import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
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
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 70, 
        progressive: true 
      })
      .toBuffer();

    // Return the compressed image as a blob response
    return new NextResponse(compressedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'attachment; filename="generated-avatar.jpg"',
      },
    });
  } catch (error) {
    console.error('Error generating avatar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
