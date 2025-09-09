'use client';

import { useBreakpoint } from '@/app/hooks/use-breakpoint';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useExternalAITools } from '@/lib/external-ai-tools-store/provider';
import { ExternalAITool } from '@/lib/external-ai-tools-store/types';
import { compressImage } from '@/lib/image-compression';
import { Image, Upload, X, Wrench } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/lib/user-store/provider';
import { LoginPrompt } from '@/app/components/auth/login-prompt';
import { useCategories } from '@/lib/categories-store/provider';
import { useRouter } from 'next/navigation';

interface DialogExternalAIToolProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool?: ExternalAITool | null;
}

export function DialogExternalAITool({
  open,
  onOpenChange,
  tool,
}: DialogExternalAIToolProps) {
  const router = useRouter();
  const { createTool, updateTool } = useExternalAITools();
  const { user } = useUser();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [isLoading, setIsLoading] = useState(false);

  const isMobile = useBreakpoint(768);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    logo: '',
    video_url: '',
    category_id: '',
    featured: false,
    pricing: null as 'free' | 'paid' | 'freemium' | null,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!tool;

  // Redirect to auth page if dialog is opened and user is not authenticated
  useEffect(() => {
    if (open && !user) {
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      router.push(`/auth?returnUrl=${returnUrl}`);
      onOpenChange(false);
    }
  }, [open, user, router, onOpenChange]);

  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name,
        description: tool.description || '',
        website: tool.website,
        logo: tool.logo || '',
        video_url: tool.video_url || '',
        category_id: tool.category_id,
        featured: tool.featured || false,
        pricing: tool.pricing || null,
      });
      setLogoPreview(tool.logo || null);
    } else {
      setFormData({
        name: '',
        description: '',
        website: '',
        logo: '',
        video_url: '',
        category_id: '',
        featured: false,
        pricing: null,
      });
      setLogoPreview(null);
    }
    setLogoFile(null);
    setLogoRemoved(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [tool, open]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/svg+xml',
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          'Invalid file type. Only JPEG, PNG, WebP, and SVG files are allowed.'
        );
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('File size too large. Maximum size is 5MB.');
        return;
      }

      try {
        // Compress the image before setting it (skip SVG files)
        let processedFile = file;
        if (file.type !== 'image/svg+xml') {
          processedFile = await compressImage(file, {
            maxSizeMB: 0.5, // Compress to 500KB max
            maxWidthOrHeight: 1000, // Reasonable size for logos
            quality: 0.8,
          });
        }

        setLogoFile(processedFile);
        setLogoRemoved(false);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setLogoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(processedFile);
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Failed to process image. Please try again.');
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (isEditing && tool) {
      // If editing an existing tool, call the DELETE endpoint
      try {
        const response = await fetch(`/api/external-ai-tools/${tool.id}/logo`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setLogoFile(null);
          setLogoPreview(null);
          setLogoRemoved(true);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          toast.success('Logo removed successfully');
        } else {
          toast.error('Failed to remove logo');
        }
      } catch (error) {
        console.error('Error removing logo:', error);
        toast.error('Failed to remove logo');
      }
    } else {
      // If creating a new tool, just clear local state
      setLogoFile(null);
      setLogoPreview(null);
      setLogoRemoved(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === 'pricing'
          ? value === ''
            ? null
            : (value as 'free' | 'paid' | 'freemium')
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.website.trim() ||
      !formData.category_id
    ) {
      console.error('Validation failed:', {
        name: formData.name.trim(),
        website: formData.website.trim(),
        category_id: formData.category_id,
        missing_fields: {
          name: !formData.name.trim(),
          website: !formData.website.trim(),
          category_id: !formData.category_id,
        },
      });
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate URLs
    try {
      new URL(formData.website);
    } catch {
      toast.error('Please enter a valid website URL');
      return;
    }

    if (formData.video_url && formData.video_url.trim()) {
      try {
        new URL(formData.video_url);
      } catch {
        toast.error('Please enter a valid video URL');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isEditing && tool) {
        // Handle logo removal case
        const updatedFormData = logoRemoved
          ? { ...formData, logo: undefined }
          : formData;
        const result = await updateTool(tool.id, updatedFormData, logoFile);
        if (result) {
          toast.success('External AI tool updated successfully');
          onOpenChange(false);
        } else {
          toast.error('Failed to update external AI tool');
        }
      } else {
        // For new tools, logo will be undefined if logoRemoved is true (though this shouldn't happen for new tools)
        const updatedFormData = logoRemoved
          ? { ...formData, logo: undefined }
          : formData;

        const result = await createTool(updatedFormData, logoFile);
        if (result) {
          toast.success('External AI tool created successfully');
          onOpenChange(false);
        } else {
          toast.error('Failed to create external AI tool');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // If user is not authenticated, don't render anything (redirect will happen in useEffect)
  if (!user) {
    return null;
  }

  const FooterContent = () => (
    <div className={`flex gap-2 ${isMobile ? '' : 'justify-end'}`}>
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isLoading}
        className={isMobile ? 'flex-1' : ''}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="external-ai-tool-form"
        disabled={isLoading}
        onClick={handleSubmit}
        className={isMobile ? 'flex-1' : ''}
      >
        {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="border-b px-6 py-4">
            <DrawerTitle className="flex items-center gap-2">
              <Wrench size={20} />
              {isEditing ? 'Edit External AI Tool' : 'Add External AI Tool'}
            </DrawerTitle>
            <DrawerDescription>
              {isEditing
                ? 'Update the details of your external AI tool.'
                : 'Add a new external AI tool to your collection.'}
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <form
              id="external-ai-tool-form"
              onSubmit={handleSubmit}
              className="space-y-4 p-1"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., OpenAI GPT-4"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="Brief description of the AI tool..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website *</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_url">Video URL</Label>
                <Input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) =>
                    handleInputChange('video_url', e.target.value)
                  }
                  placeholder="https://youtube.com/watch?v=... (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="space-y-3">
                  {logoPreview ? (
                    <div className="relative inline-block">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-full w-full rounded-lg object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400"
                      onClick={handleUploadClick}
                    >
                      <div className="text-center">
                        <Upload className="mx-auto mb-1 h-6 w-6 text-gray-400" />
                        <p className="text-xs text-gray-500">Upload</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUploadClick}
                      className="flex items-center gap-2"
                    >
                      <Image className="h-4 w-4" />
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveLogo}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Upload a logo image (JPEG, PNG, WebP, SVG). Max size: 5MB.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    handleInputChange('category_id', value)
                  }
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        categoriesLoading
                          ? 'Loading categories...'
                          : 'Select a category'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((category) => category.is_active)
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricing">Pricing</Label>
                <Select
                  value={formData.pricing || ''}
                  onValueChange={(value) => handleInputChange('pricing', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pricing model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Featured field hidden from users - only controllable from database */}
              {/* <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    handleInputChange('featured', checked)
                  }
                />
                <Label htmlFor="featured">Featured tool</Label>
              </div> */}
            </form>
          </div>
          <DrawerFooter className="border-t px-6 py-4">
            <FooterContent />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Wrench size={20} />
            {isEditing ? 'Edit External AI Tool' : 'Add External AI Tool'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of your external AI tool.'
              : 'Add a new external AI tool to your collection.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form
            id="external-ai-tool-form"
            onSubmit={handleSubmit}
            className="space-y-4 p-1"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., OpenAI GPT-4"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder="Brief description of the AI tool..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website *</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">Video URL</Label>
              <Input
                id="video_url"
                type="url"
                value={formData.video_url}
                onChange={(e) => handleInputChange('video_url', e.target.value)}
                placeholder="https://youtube.com/watch?v=... (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="space-y-3">
                {logoPreview ? (
                  <div className="relative inline-block">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-full w-full rounded-lg object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={handleRemoveLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400"
                    onClick={handleUploadClick}
                  >
                    <div className="text-center">
                      <Upload className="mx-auto mb-1 h-6 w-6 text-gray-400" />
                      <p className="text-xs text-gray-500">Upload</p>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUploadClick}
                    className="flex items-center gap-2"
                  >
                    <Image className="h-4 w-4" />
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                  {logoPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  Upload a logo image (JPEG, PNG, WebP, SVG). Max size: 5MB.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  handleInputChange('category_id', value)
                }
                disabled={categoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      categoriesLoading
                        ? 'Loading categories...'
                        : 'Select a category'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((category) => category.is_active)
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricing">Pricing</Label>
              <Select
                value={formData.pricing || ''}
                onValueChange={(value) => handleInputChange('pricing', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pricing model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="freemium">Freemium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Featured field hidden from users - only controllable from database */}
            {/* <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  handleInputChange('featured', checked)
                }
              />
              <Label htmlFor="featured">Featured tool</Label>
            </div> */}
          </form>
        </div>
        <DialogFooter className="border-t px-6 py-4">
          <FooterContent />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
