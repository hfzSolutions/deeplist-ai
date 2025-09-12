// app/providers/user-provider.tsx
'use client';

import {
  fetchUserProfile,
  signOutUser,
  subscribeToUserUpdates,
  updateUserProfile,
} from '@/lib/user-store/api';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/user/types';
import { createContext, useContext, useEffect, useState } from 'react';

type UserContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: UserProfile | null;
}) {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const updatedUser = await fetchUserProfile(user.id);
      if (updatedUser) setUser(updatedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserFromAuth = async (userId: string) => {
    setIsLoading(true);
    try {
      const userProfile = await fetchUserProfile(userId);
      setUser(userProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user?.id) return;

    // Optimistically update the local state immediately
    setUser((prev) => (prev ? { ...prev, ...updates } : null));

    // Update the database in the background
    try {
      await updateUserProfile(user.id, updates);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      // Revert the optimistic update on error
      setUser((prev) => {
        if (!prev) return null;
        const reverted = { ...prev };
        Object.keys(updates).forEach((key) => {
          delete reverted[key as keyof UserProfile];
        });
        return reverted;
      });
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await signOutUser();
      // If we reach here, sign out was successful
      setUser(null);
      console.log('User state cleared after successful sign out');
    } catch (error) {
      console.error('Sign out failed in provider:', error);
      // Re-throw the error so the component can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Set up Supabase auth state listener
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // User just signed in, fetch their profile
        await fetchUserFromAuth(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        // User signed out, clear the user state
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Set up realtime subscription for user data changes
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToUserUpdates(user.id, (newData) => {
      setUser((prev) => (prev ? { ...prev, ...newData } : null));
    });

    // Fallback: periodically refresh user data to ensure consistency
    // This helps in case real-time subscriptions fail
    const fallbackInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshUser();
      }
    }, 30000); // Check every 30 seconds when tab is visible

    return () => {
      unsubscribe();
      clearInterval(fallbackInterval);
    };
  }, [user?.id]);

  return (
    <UserContext.Provider
      value={{ user, isLoading, updateUser, refreshUser, signOut }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
