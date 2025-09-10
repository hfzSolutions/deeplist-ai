'use client';

import { useBreakpoint } from '@/app/hooks/use-breakpoint';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { toast } from '@/components/ui/toast';
import { useAgents } from '@/lib/agent-store/provider';
import { Agent } from '@/lib/agent-store/types';
import { useCategories } from '@/lib/categories-store/provider';
import { compressImage } from '@/lib/image-compression';
import { useModel } from '@/lib/model-store/provider';
import { PROVIDERS } from '@/lib/providers';
import { PencilSimple, Robot, Upload, X, Sparkle } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';

type DialogEditAgentProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  agent: Agent | null;
};

export function DialogEditAgent({
  isOpen,
  setIsOpen,
  agent,
}: DialogEditAgentProps) {
  const { updateAgent } = useAgents();
  const { models } = useModel();
  const { categories } = useCategories();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const isMobile = useBreakpoint(768);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
    model: 'none',
    avatar_url: '',
    is_public: false,
    category_id: '',
  });

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
    }
  }, [agent]);

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
    if (!agent) return;

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

    if (!agent) {
      toast({
        title: 'Error',
        description: 'No agent selected for editing',
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Agent name is required',
      });
      return;
    }

    if (!formData.category_id || formData.category_id === 'none') {
      toast({
        title: 'Error',
        description: 'Category is required',
      });
      return;
    }

    setIsLoading(true);
    try {
      let newAvatarUrl = agent.avatar_url;

      // Upload avatar if a new file is selected
      if (avatarFile) {
        const avatarUrl = await uploadAvatar(agent.id);
        if (avatarUrl) {
          newAvatarUrl = avatarUrl;
        }
      } else if (avatarRemoved) {
        // If avatar was removed, set to null
        newAvatarUrl = null;
      }

      const updatedAgent = await updateAgent(agent.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        system_prompt: formData.system_prompt.trim() || null,
        model:
          formData.model === 'none' || !formData.model ? null : formData.model,
        avatar_url: newAvatarUrl,
        is_public: formData.is_public,
        category_id:
          formData.category_id === 'none' ? null : formData.category_id,
      });

      if (updatedAgent) {
        toast({
          title: 'Success',
          description: `Agent "${updatedAgent.name}" updated successfully`,
        });
        setIsOpen(false);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update agent',
        });
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to update agent',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Group models by provider for better organization
  const modelsByProvider = models.reduce(
    (acc, model) => {
      const provider = PROVIDERS.find((p) => p.id === model.icon);
      const providerName = provider?.name || 'Other';
      if (!acc[providerName]) {
        acc[providerName] = [];
      }
      acc[providerName].push(model);
      return acc;
    },
    {} as Record<string, typeof models>
  );

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {/* Agent Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Agent Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Code Assistant, Writing Helper"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="Brief description of what this agent does"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => handleInputChange('category_id', value)}
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
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            Categorize your agent to help with organization and discovery.
          </p>
        </div>

        {/* Avatar Upload */}
        <div className="space-y-2">
          <Label>Avatar Image</Label>
          <div className="space-y-3">
            {avatarPreview ? (
              <div className="relative inline-block">
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
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={handleRemoveAvatar}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div
                className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted transition-colors hover:border-muted-foreground/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center">
                  <Upload className="mx-auto mb-1 h-6 w-6 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Upload</p>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowGenerateDialog(true)}
                className="flex items-center gap-2"
              >
                <Sparkle className="h-4 w-4" />
                Generate Avatar
              </Button>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  className="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              Upload an avatar image (JPEG, PNG, WebP, SVG). Max size: 5MB.
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

        {/* Model Selection */}
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
              {Object.entries(modelsByProvider).map(
                ([providerName, providerModels]) => (
                  <div key={providerName}>
                    <div className="text-muted-foreground px-2 py-1.5 text-sm font-semibold">
                      {providerName}
                    </div>
                    {providerModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </div>
                )
              )}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            If specified, this model will be automatically selected when using
            this agent.
          </p>
        </div>

        {/* System Prompt */}
        <div className="space-y-2">
          <Label htmlFor="system_prompt">System Prompt</Label>
          <Textarea
            id="system_prompt"
            placeholder="Define the agent's personality, expertise, and behavior instructions..."
            value={formData.system_prompt}
            onChange={(e) => handleInputChange('system_prompt', e.target.value)}
            rows={6}
            className="resize-none"
          />
          <p className="text-muted-foreground text-xs">
            This prompt will guide the agent's responses and behavior. Be
            specific about the role, expertise, and communication style.
          </p>
        </div>

        {/* Public/Private Toggle */}
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
    </form>
  );

  const FooterContent = () => (
    <div className={`flex gap-2 ${isMobile ? '' : 'justify-end'}`}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(false)}
        disabled={isLoading}
        className={isMobile ? 'flex-1' : ''}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isLoading || !formData.name.trim() || !formData.category_id}
        onClick={handleSubmit}
        className={isMobile ? 'flex-1' : ''}
      >
        {isLoading ? 'Updating...' : 'Update Agent'}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="border-b px-6 py-4">
            <DrawerTitle className="flex items-center gap-2">
              <PencilSimple size={20} />
              Edit Agent
            </DrawerTitle>
            <DrawerDescription>
              Update your AI agent's configuration and behavior.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <FormContent />
          </div>
          <DrawerFooter className="border-t px-6 py-4">
            <FooterContent />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <PencilSimple size={20} />
            Edit Agent
          </DialogTitle>
          <DialogDescription>
            Update your AI agent's configuration and behavior.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <FormContent />
        </div>
        <DialogFooter className="border-t px-6 py-4">
          <FooterContent />
        </DialogFooter>
      </DialogContent>

      {/* Generate Avatar Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkle className="h-5 w-5" />
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
                placeholder="e.g., A friendly robot with blue eyes, professional business person, cute cartoon character..."
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowGenerateDialog(false);
                setGeneratePrompt('');
              }}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                if (!generatePrompt.trim()) {
                  toast({
                    title: 'Error',
                    description: 'Please enter a description for the avatar',
                  });
                  return;
                }

                if (!agent) {
                  toast({
                    title: 'Error',
                    description: 'Agent not found',
                  });
                  return;
                }

                setIsGenerating(true);
                try {
                  const response = await fetch(
                    `/api/agents/${agent.id}/avatar/generate`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ prompt: generatePrompt.trim() }),
                    }
                  );

                  if (response.ok) {
                    const data = await response.json();

                    // Update the avatar preview with the new URL
                    setAvatarPreview(data.avatar_url);
                    setAvatarFile(null); // Clear file since it's now uploaded
                    setAvatarRemoved(false);

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
              }}
              disabled={isGenerating || !generatePrompt.trim()}
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
