'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { compressImage } from '@/lib/image-compression';
import { useUser } from '@/lib/user-store/provider';
import { Upload, User, X } from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export function UserProfile() {
  const { user, refreshUser, updateUser } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large. Maximum 5MB allowed.');
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const uploadAvatar = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Compress the image before uploading
      const compressedFile = await compressImage(file, {
        maxSizeMB: 0.3, // Smaller size for avatars
        maxWidthOrHeight: 800, // Smaller dimensions for avatars
        quality: 0.8,
      });

      const formData = new FormData();
      formData.append('file', compressedFile);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Update user state immediately with the new avatar URL
      if (data.profile_image) {
        updateUser({ profile_image: data.profile_image });
      }

      toast.success('Avatar updated successfully!');
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload avatar'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async () => {
    setIsUploading(true);
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Remove failed');
      }

      // Update user state immediately to remove the avatar
      updateUser({ profile_image: '' });

      toast.success('Avatar removed successfully!');
    } catch (error) {
      console.error('Remove error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to remove avatar'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const cancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium">Profile</h3>
      <div className="flex items-start space-x-4">
        <div className="flex flex-col items-center space-y-2">
          <div className="bg-muted relative flex items-center justify-center overflow-hidden rounded-full">
            {previewUrl ? (
              <Avatar className="size-12">
                <AvatarImage src={previewUrl} className="object-cover" />
                <AvatarFallback>{user?.display_name?.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : user?.profile_image ? (
              <Avatar className="size-12">
                <AvatarImage
                  src={user.profile_image}
                  className="object-cover"
                />
                <AvatarFallback>{user?.display_name?.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <User className="text-muted-foreground size-12" />
            )}
          </div>

          <div className="flex flex-col space-y-1">
            {previewUrl ? (
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  onClick={uploadAvatar}
                  disabled={isUploading}
                  className="text-xs"
                >
                  {isUploading ? 'Uploading...' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelPreview}
                  disabled={isUploading}
                  className="text-xs"
                >
                  <X className="size-3" />
                </Button>
              </div>
            ) : (
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-xs"
                >
                  <Upload className="mr-1 size-3" />
                  Upload
                </Button>
                {user?.profile_image && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={removeAvatar}
                    disabled={isUploading}
                    className="text-xs"
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div>
          <h4 className="text-sm font-medium">{user?.display_name}</h4>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}
