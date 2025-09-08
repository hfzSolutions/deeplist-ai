import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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
    } = await supabase.auth.getUser();

    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const tags = searchParams.get('tags') || '';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query with category relationship
    let query = supabase
      .from('external_ai_tools')
      .select(
        `
        *,
        category:categories(
          id,
          name,
          description,
          icon,
          sort_order,
          is_active
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Add category filter if provided
    if (category) {
      // Filter by category name or category_id
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single();

      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      }
    }

    // Add tag filter if provided
    if (tags) {
      const tagIds = tags.split(',').filter(Boolean);
      if (tagIds.length > 0) {
        // Filter tools that have any of the specified tags
        const { data: toolIdsData } = await supabase
          .from('external_ai_tool_tags')
          .select('tool_id')
          .in('tag_id', tagIds);

        if (toolIdsData && toolIdsData.length > 0) {
          const toolIds = toolIdsData.map((item) => item.tool_id);
          query = query.in('id', toolIds);
        } else {
          // No tools found with these tags, return empty result
          return NextResponse.json({
            tools: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
          });
        }
      }
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    const { data: tools, error, count } = await query;

    if (error) {
      console.error('Error fetching external AI tools:', error);
      return NextResponse.json(
        { error: 'Failed to fetch external AI tools' },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      tools,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    console.error('Error in external AI tools API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

      // Extract form fields with proper null checking
      const nameValue = formData.get('name');
      const descriptionValue = formData.get('description');
      const websiteValue = formData.get('website');
      const videoUrlValue = formData.get('video_url');
      const categoryIdValue = formData.get('category_id');
      const featuredValue = formData.get('featured');
      const pricingValue = formData.get('pricing');

      // Convert to proper types with null safety
      name = nameValue ? nameValue.toString() : null;
      description = descriptionValue ? descriptionValue.toString() : null;
      website = websiteValue ? websiteValue.toString() : null;
      video_url = videoUrlValue ? videoUrlValue.toString() : null;
      category_id = categoryIdValue ? categoryIdValue.toString() : null;
      featured = featuredValue === 'true';
      pricing = pricingValue ? pricingValue.toString() : null;

      const logoFile = formData.get('logo') as File;

      if (logoFile && logoFile.size > 0) {
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
      }
    } else {
      // Handle JSON data
      const body = await request.json();
      name = body.name;
      description = body.description;
      website = body.website;
      logo = body.logo;
      video_url = body.video_url;
      category_id = body.category_id;
      featured = body.featured;
      pricing = body.pricing;
    }

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!website) {
      return NextResponse.json(
        { error: 'Website is required' },
        { status: 400 }
      );
    }

    if (!category_id) {
      return NextResponse.json(
        {
          error:
            'Category is required. Please ensure category_id is properly sent in the form data.',
        },
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

    // Validate category_id format (should be UUID) and existence
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(category_id)) {
      return NextResponse.json(
        {
          error:
            'Invalid category ID format. Category ID must be a valid UUID.',
        },
        { status: 400 }
      );
    }

    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .single();

    if (categoryError || !categoryData) {
      console.error('Category validation error:', categoryError);
      return NextResponse.json(
        {
          error: 'Invalid category. The specified category does not exist.',
        },
        { status: 400 }
      );
    }

    const { data: tool, error } = await supabase
      .from('external_ai_tools')
      .insert({
        name,
        description,
        website,
        logo,
        video_url,
        category_id: category_id,
        featured: featured || false,
        pricing,
        user_id: user.id,
      })
      .select(
        `
        *,
        category:categories(
          id,
          name,
          description,
          icon,
          sort_order,
          is_active
        )
      `
      )
      .single();

    if (error) {
      console.error('Error creating external AI tool:', error);
      return NextResponse.json(
        { error: 'Failed to create external AI tool' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tool });
  } catch (error) {
    console.error('Error in external AI tools API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
