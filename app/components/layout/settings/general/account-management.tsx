'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { useChats } from '@/lib/chat-store/chats/provider';
import { useMessages } from '@/lib/chat-store/messages/provider';
import { clearAllIndexedDBStores } from '@/lib/chat-store/persist';
import { useUser } from '@/lib/user-store/provider';
import { SignOut, Trash } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AccountManagement() {
  const { signOut, isLoading: userLoading, user } = useUser();
  const { resetChats } = useChats();
  const { resetMessages } = useMessages();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const handleSignOut = async () => {
    if (isSigningOut || userLoading) {
      return; // Prevent multiple simultaneous logout attempts
    }

    setIsSigningOut(true);

    try {
      // Clear local data first
      await Promise.all([
        resetMessages(),
        resetChats(),
        clearAllIndexedDBStores(),
      ]);

      // Then sign out from Supabase
      await signOut();

      // Show success message
      toast({
        title: 'Signed out successfully',
        status: 'success',
      });

      // Navigate to home page
      router.push('/');
    } catch (e) {
      console.error('Sign out failed:', e);

      // Provide more specific error messages
      const errorMessage =
        e instanceof Error ? e.message : 'Unknown error occurred';

      toast({
        title: 'Failed to sign out',
        description: errorMessage,
        status: 'error',
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'DELETE') {
      toast({
        title: 'Invalid confirmation',
        description: 'Please type "DELETE" to confirm account deletion.',
        status: 'error',
      });
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      // Clear local data
      await Promise.all([
        resetMessages(),
        resetChats(),
        clearAllIndexedDBStores(),
      ]);

      toast({
        title: 'Account deleted successfully',
        description:
          'Your account and all associated data have been permanently deleted.',
        status: 'success',
      });

      // Wait a moment for user to read the toast before refreshing
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Account deletion failed:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      toast({
        title: 'Failed to delete account',
        description: errorMessage,
        status: 'error',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setConfirmationText('');
    }
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setConfirmationText('');
  };

  return (
    <div className="space-y-6">
      {/* Sign Out Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Sign Out</h3>
          <p className="text-muted-foreground text-xs">
            Log out on this device
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleSignOut}
          disabled={isSigningOut || userLoading}
        >
          <SignOut className="size-4" />
          <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
        </Button>
      </div>

      {/* Delete Account Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-destructive">
            Delete Account
          </h3>
          <p className="text-muted-foreground text-xs">
            Permanently delete your account and all data
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={userLoading}
        >
          <Trash className="size-4" />
          <span>Delete Account</span>
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete Account
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <span className="block">
                This action cannot be undone. This will permanently delete your
                account and remove all of your data from our servers.
              </span>
              <span className="block">
                All your chats, agents, projects, and preferences will be
                permanently lost.
              </span>
              <span className="block">
                Please type <strong>DELETE</strong> to confirm.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmation">Type "DELETE" to confirm:</Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="DELETE"
                disabled={isDeleting}
              />
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="outline"
              onClick={handleDeleteDialogClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmationText !== 'DELETE'}
              className="flex items-center gap-2"
            >
              <Trash className="size-4" />
              <span>{isDeleting ? 'Deleting...' : 'Delete Account'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
