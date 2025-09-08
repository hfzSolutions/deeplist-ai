// @todo: move in /lib/user/api.ts
import { toast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/user/types';

export async function fetchUserProfile(
  id: string
): Promise<UserProfile | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) {
    console.error('Failed to fetch user:', error);
    return null;
  }

  // Don't return anonymous users
  if (data.anonymous) return null;

  return {
    ...data,
    profile_image: data.profile_image || '',
    display_name: data.display_name || '',
  };
}

export async function updateUserProfile(
  id: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase.from('users').update(updates).eq('id', id);

  if (error) {
    console.error('Failed to update user:', error);
    return false;
  }

  return true;
}

export async function signOutUser(): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) {
    console.warn('Supabase client not available for sign out');
    toast({
      title: 'Sign out is not supported in this deployment',
      status: 'info',
    });
    return false;
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Supabase sign out error:', error);
      
      // Provide more specific error handling
      if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error during sign out. Please check your connection.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Sign out request timed out. Please try again.');
      } else {
        throw new Error(`Sign out failed: ${error.message}`);
      }
    }

    console.log('Successfully signed out from Supabase');
    return true;
    
  } catch (error) {
    console.error('Error during sign out process:', error);
    
    // Re-throw the error so it can be handled by the calling component
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred during sign out');
    }
  }
}

export function subscribeToUserUpdates(
  userId: string,
  onUpdate: (newData: Partial<UserProfile>) => void
) {
  const supabase = createClient();
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`user_updates_${userId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: userId },
      },
    })
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        console.log('Real-time user update received:', payload);
        if (payload.new) {
          onUpdate(payload.new as Partial<UserProfile>);
        }
      }
    )
    .subscribe((status) => {
      console.log('User subscription status:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
