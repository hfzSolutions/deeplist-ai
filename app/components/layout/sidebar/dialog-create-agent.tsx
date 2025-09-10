'use client';

import { useBreakpoint } from '@/app/hooks/use-breakpoint';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
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
import { toast } from '@/components/ui/toast';
import { useAgents } from '@/lib/agent-store/provider';
import { Agent } from '@/lib/agent-store/types';
import { useCategories } from '@/lib/categories-store/provider';
import { compressImage } from '@/lib/image-compression';
import { useModel } from '@/lib/model-store/provider';
import { PROVIDERS } from '@/lib/providers';
import { useUser } from '@/lib/user-store/provider';
import { Robot, Upload, X, CaretDown } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type DialogCreateAgentProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  agent?: Agent | null;
};

export function DialogCreateAgent({
  isOpen,
  setIsOpen,
  agent,
}: DialogCreateAgentProps) {
  const router = useRouter();
  const { user } = useUser();
  const { createAgent, updateAgent } = useAgents();
  const { models } = useModel();
  const { categories } = useCategories();
  const isMobile = useBreakpoint(768);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [showMoreSettings, setShowMoreSettings] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect to auth page if dialog is opened and user is not authenticated
  useEffect(() => {
    if (isOpen && !user) {
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      router.push(`/auth?returnUrl=${returnUrl}`);
      setIsOpen(false);
    }
  }, [isOpen, user, router, setIsOpen]);

  // Get default model - prefer first accessible model or fallback to first available
  const getDefaultModel = () => {
    if (models.length === 0) return 'none';
    const accessibleModel = models.find((model) => model.accessible);
    return accessibleModel?.id || models[0]?.id || 'none';
  };

  // Get default category - first category in the list
  const getDefaultCategory = () => {
    if (categories.length === 0) return '';
    return categories[0]?.id || '';
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
    model: getDefaultModel(),
    avatar_url: '',
    is_public: true,
    category_id: getDefaultCategory(),
  });

  const isEditing = !!agent;

  // Populate form data when agent changes
  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || '',
        description: agent.description || '',
        system_prompt: agent.system_prompt || '',
        model: agent.model || 'none',
        avatar_url: agent.avatar_url || '',
        is_public: agent.is_public || false,
        category_id: agent.category_id || '',
      });
      // Set avatar preview if agent has an avatar
      setAvatarPreview(agent.avatar_url || null);
      setAvatarFile(null);
      setAvatarRemoved(false);
    } else {
      setFormData({
        name: '',
        description: '',
        system_prompt: '',
        model: getDefaultModel(),
        avatar_url: '',
        is_public: true,
        category_id: getDefaultCategory(),
      });
      setAvatarPreview(null);
    }
    setAvatarFile(null);
    setAvatarRemoved(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [agent, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description:
          'Please select a valid image file (JPEG, PNG, WebP, or SVG)',
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 5MB',
      });
      return;
    }

    try {
      // Compress image (skip SVGs)
      let processedFile = file;
      if (file.type !== 'image/svg+xml') {
        processedFile = await compressImage(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1000,
          useWebWorker: true,
          quality: 0.8,
        });
      }

      setAvatarFile(processedFile);
      setAvatarRemoved(false); // Reset removed state when new file is selected

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: 'Error',
        description: 'Failed to process image',
      });
    }
  };

  const handleRemoveAvatar = async () => {
    if (isEditing && agent) {
      // If editing an existing agent, call the DELETE endpoint
      try {
        const response = await fetch(`/api/agents/${agent.id}/avatar`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setAvatarFile(null);
          setAvatarPreview(null);
          setAvatarRemoved(true);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          toast({
            title: 'Success',
            description: 'Avatar removed successfully',
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to remove avatar',
          });
        }
      } catch (error) {
        console.error('Error removing avatar:', error);
        toast({
          title: 'Error',
          description: 'Failed to remove avatar',
        });
      }
    } else {
      // If creating a new agent, just clear local state
      setAvatarFile(null);
      setAvatarPreview(null);
      setAvatarRemoved(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGenerateAvatar = async () => {
    if (!generatePrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a description for the avatar',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: generatePrompt.trim() }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const file = new File([blob], 'generated-avatar.png', {
          type: 'image/png',
        });

        setAvatarFile(file);
        setAvatarRemoved(false);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setAvatarPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        setShowGenerateDialog(false);
        setGeneratePrompt('');

        toast({
          title: 'Success',
          description: 'Avatar generated successfully!',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to generate avatar',
        });
      }
    } catch (error) {
      console.error('Error generating avatar:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate avatar',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const uploadAvatar = async (agentId: string): Promise<string | null> => {
    if (!avatarFile) return null;

    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await fetch(`/api/agents/${agentId}/avatar`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.avatar_url;
      } else {
        console.error('Failed to upload avatar');
        return null;
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Agent name is required',
      });
      return;
    }

    if (!avatarFile && !avatarPreview) {
      toast({
        title: 'Error',
        description: 'Avatar is required',
      });
      return;
    }

    // Category is optional since it has a default value

    setIsLoading(true);
    try {
      if (isEditing && agent) {
        // Update existing agent
        const updatedAgent = await updateAgent(agent.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          system_prompt: formData.system_prompt.trim() || null,
          model:
            formData.model === 'none' || !formData.model
              ? null
              : formData.model,
          avatar_url: avatarRemoved ? null : agent.avatar_url,
          is_public: formData.is_public,
          category_id:
            formData.category_id === 'none' ? null : formData.category_id,
        });

        if (updatedAgent) {
          // Upload new avatar if provided
          if (avatarFile) {
            const avatarUrl = await uploadAvatar(agent.id);
            if (avatarUrl) {
              // Update the agent in the store with the new avatar URL
              await updateAgent(agent.id, {
                ...updatedAgent,
                avatar_url: avatarUrl,
              });
            }
          }

          toast({
            title: 'Success',
            description: `Agent "${updatedAgent.name}" updated successfully`,
          });
        }
      } else {
        // Create new agent
        const newAgent = await createAgent({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          system_prompt: formData.system_prompt.trim() || null,
          model:
            formData.model === 'none' || !formData.model
              ? null
              : formData.model,
          avatar_url: null, // Will be updated after avatar upload
          is_public: formData.is_public,
          category_id:
            formData.category_id === 'none' ? null : formData.category_id,
        });

        if (newAgent) {
          // Upload avatar if provided
          if (avatarFile) {
            const avatarUrl = await uploadAvatar(newAgent.id);
            if (avatarUrl) {
              // Update the agent in the store with the new avatar URL
              await updateAgent(newAgent.id, {
                ...newAgent,
                avatar_url: avatarUrl,
              });
            }
          }

          toast({
            title: 'Success',
            description: `Agent "${newAgent.name}" created successfully`,
          });
        }
      }

      setIsOpen(false);
      setFormData({
        name: '',
        description: '',
        system_prompt: '',
        model: getDefaultModel(),
        avatar_url: '',
        is_public: true,
        category_id: getDefaultCategory(),
      });
      setAvatarFile(null);
      setAvatarPreview(null);
      setAvatarRemoved(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to create agent',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Filter accessible models for better user experience
  const accessibleModels = models.filter((model) => model.accessible);

  const renderGenerateDialog = () => (
    <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Robot className="h-5 w-5" />
            Generate Avatar
          </DialogTitle>
          <DialogDescription>
            Describe the avatar you want to generate for your agent.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="generate-prompt">Avatar Description</Label>
            <Textarea
              id="generate-prompt"
              placeholder="e.g., A friendly robot with blue eyes, A professional business person, A cute cartoon character..."
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowGenerateDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleGenerateAvatar}
              disabled={isGenerating || !generatePrompt.trim()}
              className="flex-1"
            >
              {isGenerating ? 'Generating...' : 'Generate Avatar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderFormFields = (isMobileView: boolean) => (
    <form id="create-agent-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Agent Name</Label>
        <Input
          id="name"
          placeholder="e.g., Code Assistant, Writing Helper"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Avatar Image</Label>
        <div className="flex items-start gap-3">
          {/* Avatar Preview/Upload Area */}
          <div className="flex-shrink-0">
            {avatarPreview ? (
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0"
                  onClick={handleRemoveAvatar}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div
                className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted hover:border-muted-foreground/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Action Buttons and Info */}
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {avatarPreview ? 'Change' : 'Upload'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowGenerateDialog(true)}
                className="flex items-center gap-2"
              >
                <Robot className="h-4 w-4" />
                Generate
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Upload or generate an image. Max 5MB.
            </p>
          </div>
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
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Brief description of what this agent does..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="system_prompt">System Prompt</Label>
        <Textarea
          id="system_prompt"
          placeholder="Define the agent's behavior, personality, and capabilities..."
          value={formData.system_prompt}
          onChange={(e) => handleInputChange('system_prompt', e.target.value)}
          rows={4}
        />
      </div>

      {/* More Settings Section */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowMoreSettings(!showMoreSettings)}
          className="flex w-full items-center justify-between p-2 h-auto text-sm text-muted-foreground hover:text-foreground"
        >
          <span>More Settings (Optional)</span>
          <CaretDown
            className={`h-4 w-4 transition-transform ${showMoreSettings ? 'rotate-180' : ''}`}
          />
        </Button>

        {showMoreSettings && (
          <div className="space-y-4 pl-4 border-l-2 border-muted">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  handleInputChange('category_id', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        {category.icon && (
                          <span className="text-sm">{category.icon}</span>
                        )}
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Preferred Model</Label>
              <Select
                value={formData.model}
                onValueChange={(value) => handleInputChange('model', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific model</SelectItem>
                  {accessibleModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="is_public">Make Public</Label>
                <p className="text-muted-foreground text-xs">
                  Public agents can be used by other users
                </p>
              </div>
              <Switch
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) =>
                  handleInputChange('is_public', checked)
                }
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(false)}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isLoading ||
            !formData.name.trim() ||
            (!avatarFile && !avatarPreview)
          }
          className="flex-1"
        >
          {isLoading
            ? isEditing
              ? 'Updating...'
              : 'Creating...'
            : isEditing
              ? 'Update Agent'
              : 'Create Agent'}
        </Button>
      </div>
    </form>
  );

  // If user is not authenticated, don't render anything (redirect will happen in useEffect)
  if (!user) {
    return null;
  }

  if (isMobile) {
    return (
      <>
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="flex max-h-[95vh] flex-col">
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-2 text-left">
                <Robot className="h-5 w-5" />
                {isEditing ? 'Edit Agent' : 'Create New Agent'}
              </DrawerTitle>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4">
              {renderFormFields(true)}
            </div>
          </DrawerContent>
        </Drawer>
        {renderGenerateDialog()}
      </>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Robot className="h-5 w-5" />
              {isEditing ? 'Edit Agent' : 'Create New Agent'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update your agent's configuration and settings."
                : 'Create a custom AI agent with specific instructions and behavior.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {renderFormFields(false)}
          </div>
        </DialogContent>
      </Dialog>
      {renderGenerateDialog()}
    </>
  );
}
