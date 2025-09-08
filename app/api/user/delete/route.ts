import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE() {
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

    // Delete avatar files from storage first (optional cleanup)
    const { data: existingFiles } = await supabase.storage
      .from('assets')
      .list(`avatars/${user.id}`);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(
        (file) => `avatars/${user.id}/${file.name}`
      );
      const { error: deleteError } = await supabase.storage
        .from('assets')
        .remove(filesToDelete);

      if (deleteError) {
        console.error('Error deleting avatar files:', deleteError);
        // Don't fail the entire operation for storage errors
      }
    }

    // Use admin client to delete auth user - this will CASCADE DELETE all related data
    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: 'Admin client not available' },
        { status: 500 }
      );
    }

    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(
      user.id
    );

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete user account' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
