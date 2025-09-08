import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: tool, error } = await supabase
      .from('external_ai_tools')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!tool) {
      return NextResponse.json(
        { error: 'External AI tool not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tool);
  } catch (error) {
    console.error('Error fetching external AI tool:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get existing tool to check current logo
    const { data: existingTool, error: fetchError } = await supabase
      .from('external_ai_tools')
      .select('logo')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!existingTool) {
      return NextResponse.json(
        { error: 'External AI tool not found' },
        { status: 404 }
      );
    }

    const contentType = request.headers.get('content-type');
    let name,
      description,
      website,
      logo,
      video_url,
      category_id,
      featured,
      pricing;

    if (contentType?.includes('multipart/form-data')) {
      // Handle form data with file upload
      const formData = await request.formData();
      name = formData.get('name') as string;
      description = formData.get('description') as string;
      website = formData.get('website') as string;
      video_url = formData.get('video_url') as string;
      category_id = formData.get('category_id') as string;
      featured = formData.get('featured') === 'true';
      pricing = formData.get('pricing') as string;

      const logoFile = formData.get('logo') as File;

      if (logoFile && logoFile.size > 0) {
        // Delete old logo if it exists and is stored in our assets bucket
        if (
          existingTool.logo &&
          existingTool.logo.includes(
            '/storage/v1/object/public/assets/external-ai-tools/'
          )
        ) {
          const oldFileName = existingTool.logo.split(
            '/storage/v1/object/public/assets/'
          )[1];
          if (oldFileName.includes(`external-ai-tools/${user.id}/`)) {
            await supabase.storage.from('assets').remove([oldFileName]);
          }
        }

        // Validate file type
        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/svg+xml',
        ];
        if (!allowedTypes.includes(logoFile.type)) {
          return NextResponse.json(
            {
              error:
                'Invalid file type. Only JPEG, PNG, WebP, and SVG files are allowed.',
            },
            { status: 400 }
          );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (logoFile.size > maxSize) {
          return NextResponse.json(
            { error: 'File size too large. Maximum size is 5MB.' },
            { status: 400 }
          );
        }

        // Generate unique filename
        const fileExtension = logoFile.name.split('.').pop();
        const fileName = `external-ai-tools/${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

        // Convert file to buffer
        const arrayBuffer = await logoFile.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assets')
          .upload(fileName, buffer, {
            contentType: logoFile.type,
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          return NextResponse.json(
            { error: 'Failed to upload logo' },
            { status: 500 }
          );
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('assets')
          .getPublicUrl(fileName);

        logo = urlData.publicUrl;
      } else {
        // Keep existing logo if no new file uploaded
        logo = existingTool.logo;
      }
    } else {
      // Handle JSON data
      const body = await request.json();

      name = body.name;
      description = body.description;
      website = body.website;
      logo = body.logo !== undefined ? body.logo : existingTool.logo;
      video_url = body.video_url;
      category_id = body.category_id;
      featured = body.featured;
      pricing = body.pricing;
    }

    if (!name || !website || !category_id) {
      return NextResponse.json(
        { error: 'Name, website, and category_id are required' },
        { status: 400 }
      );
    }

    // Validate category_id exists
    const { data: categoryExists } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .single();

    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Invalid category_id' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(website);
    } catch {
      return NextResponse.json(
        { error: 'Invalid website URL' },
        { status: 400 }
      );
    }

    // Validate pricing if provided
    if (pricing && !['free', 'paid', 'freemium'].includes(pricing)) {
      return NextResponse.json(
        {
          error: 'Invalid pricing value. Must be one of: free, paid, freemium',
        },
        { status: 400 }
      );
    }

    const { data: tool, error } = await supabase
      .from('external_ai_tools')
      .update({
        name,
        description,
        website,
        logo,
        video_url,
        category_id,
        featured: featured || false,
        pricing,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!tool) {
      return NextResponse.json(
        { error: 'External AI tool not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tool });
  } catch (error) {
    console.error('Error updating external AI tool:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the tool to check if it has an uploaded logo
    const { data: tool, error: fetchError } = await supabase
      .from('external_ai_tools')
      .select('logo')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!tool) {
      return NextResponse.json(
        { error: 'External AI tool not found' },
        { status: 404 }
      );
    }

    // Delete the logo from storage if it's stored in our assets bucket
    if (
      tool.logo &&
      tool.logo.includes('/storage/v1/object/public/assets/external-ai-tools/')
    ) {
      const fileName = tool.logo.split('/storage/v1/object/public/assets/')[1];
      if (fileName.includes(`external-ai-tools/${user.id}/`)) {
        await supabase.storage.from('assets').remove([fileName]);
      }
    }

    const { error } = await supabase
      .from('external_ai_tools')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'External AI tool deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting external AI tool:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
