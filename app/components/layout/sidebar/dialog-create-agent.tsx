'use client';

import { LoginPrompt } from '@/app/components/auth/login-prompt';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAgents } from '@/lib/agent-store/provider';
import { Agent } from '@/lib/agent-store/types';
import { useCategories } from '@/lib/categories-store/provider';
import { compressImage } from '@/lib/image-compression';
import { useModel } from '@/lib/model-store/provider';
import { PROVIDERS } from '@/lib/providers';
import { useUser } from '@/lib/user-store/provider';
import {
  Robot,
  Upload,
  X,
  Sparkle,
  MagicWand,
  Shuffle,
  CaretDown,
  CaretUp,
} from '@phosphor-icons/react';
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
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAutoGenerateForm, setShowAutoGenerateForm] = useState(false);
  const [autoGeneratePrompt, setAutoGeneratePrompt] = useState('');
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [isRandomGenerating, setIsRandomGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isMoreSectionOpen, setIsMoreSectionOpen] = useState(false);
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

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
    model: getDefaultModel(),
    avatar_url: '',
    is_public: true,
    category_id: '',
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
        category_id: '',
      });
      setAvatarPreview(null);
    }
    setAvatarFile(null);
    setAvatarRemoved(false);
    setIsMoreSectionOpen(false);
    setShowAutoGenerateForm(false);
    setAutoGeneratePrompt('');
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
    setHasAttemptedSubmit(true);

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

    if (!formData.category_id || formData.category_id === 'none') {
      toast({
        title: 'Error',
        description: 'Category is required',
      });
      return;
    }

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
        model: 'none',
        avatar_url: '',
        is_public: true,
        category_id: '',
      });
      setAvatarFile(null);
      setAvatarPreview(null);
      setAvatarRemoved(false);
      setHasAttemptedSubmit(false);
      setShowAutoGenerateForm(false);
      setAutoGeneratePrompt('');
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

  const handleAutoGenerate = async () => {
    if (!autoGeneratePrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a description for the agent',
      });
      return;
    }

    setIsAutoGenerating(true);
    setGenerationProgress(10);
    try {
      const response = await fetch('/api/generate-agent-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: autoGeneratePrompt.trim() }),
      });

      if (response.ok) {
        const generatedDetails = await response.json();
        setGenerationProgress(50);

        // Populate form fields with generated data
        setFormData((prev) => ({
          ...prev,
          name: generatedDetails.name,
          description: generatedDetails.description,
          system_prompt: generatedDetails.system_prompt,
        }));

        // Auto-generate avatar using the avatar_description
        if (generatedDetails.avatar_description) {
          try {
            setGenerationProgress(70);
            const avatarResponse = await fetch('/api/generate-avatar', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prompt: generatedDetails.avatar_description,
              }),
            });

            if (avatarResponse.ok) {
              const blob = await avatarResponse.blob();
              const file = new File([blob], 'generated-avatar.png', {
                type: 'image/png',
              });

              setAvatarFile(file);
              setAvatarRemoved(false);
              setGenerationProgress(90);

              // Create preview
              const reader = new FileReader();
              reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string);
              };
              reader.readAsDataURL(file);
            }
          } catch (avatarError) {
            console.error('Error generating avatar:', avatarError);
            // Don't show error for avatar generation failure, just continue
          }
        }

        setGenerationProgress(100);
        setShowAutoGenerateForm(false);
        setAutoGeneratePrompt('');
        toast({
          title: 'Success',
          description: 'Agent details generated successfully!',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to generate agent details',
        });
      }
    } catch (error) {
      console.error('Error generating agent details:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate agent details',
      });
    } finally {
      setIsAutoGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleRandomGenerate = async () => {
    const randomAgentTypes = [
      'A helpful coding assistant that specializes in debugging and code optimization',
      'A creative writing companion that helps with storytelling and content creation',
      'A data analysis expert that can interpret charts, graphs, and statistical information',
      'A language learning tutor that provides conversational practice and grammar help',
      'A productivity coach that helps with time management and goal setting',
      'A research assistant that can summarize articles and find relevant information',
      'A technical documentation writer that creates clear and comprehensive guides',
      'A brainstorming partner that generates creative ideas and solutions',
      'A customer service representative that handles inquiries with empathy and efficiency',
      'A fitness and wellness advisor that provides health tips and workout suggestions',
      'A financial planning assistant that helps with budgeting and investment advice',
      'A travel planning companion that suggests destinations and creates itineraries',
    ];

    const randomDescription =
      randomAgentTypes[Math.floor(Math.random() * randomAgentTypes.length)];

    setIsRandomGenerating(true);
    setGenerationProgress(10);
    try {
      const response = await fetch('/api/generate-agent-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: randomDescription }),
      });

      if (response.ok) {
        const generatedDetails = await response.json();
        setGenerationProgress(50);

        // Populate form fields with generated data
        setFormData((prev) => ({
          ...prev,
          name: generatedDetails.name,
          description: generatedDetails.description,
          system_prompt: generatedDetails.system_prompt,
        }));

        // Auto-generate avatar using the avatar_description
        if (generatedDetails.avatar_description) {
          try {
            setGenerationProgress(70);
            const avatarResponse = await fetch('/api/generate-avatar', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prompt: generatedDetails.avatar_description,
              }),
            });

            if (avatarResponse.ok) {
              const blob = await avatarResponse.blob();
              const file = new File([blob], 'generated-avatar.png', {
                type: 'image/png',
              });

              setAvatarFile(file);
              setAvatarRemoved(false);
              setGenerationProgress(90);

              // Create preview
              const reader = new FileReader();
              reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string);
              };
              reader.readAsDataURL(file);
            }
          } catch (avatarError) {
            console.error('Error generating avatar:', avatarError);
            // Don't show error for avatar generation failure, just continue
          }
        }

        setGenerationProgress(100);
        toast({
          title: 'Success',
          description: 'Random agent and avatar generated successfully!',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to generate random agent',
        });
      }
    } catch (error) {
      console.error('Error generating random agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate random agent',
      });
    } finally {
      setIsRandomGenerating(false);
      setGenerationProgress(0);
    }
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

  // If user is not authenticated, don't render anything (redirect will happen in useEffect)
  if (!user) {
    return null;
  }

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="flex max-h-[95vh] flex-col">
          <DrawerHeader className="border-b px-6 py-4">
            <DrawerTitle className="flex items-center gap-2 text-left">
              <Robot className="h-5 w-5" />
              {isEditing ? 'Edit Agent' : 'Create New Agent'}
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <form
              id="create-agent-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Form content will be the same */}
              {/* Quick Start Section */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkle className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-medium text-foreground">
                        Quick Start
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Let AI generate all agent details for you
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRandomGenerate}
                        disabled={isRandomGenerating || isAutoGenerating}
                        className="flex items-center gap-1.5"
                      >
                        {isRandomGenerating ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Shuffle className="h-3 w-3" />
                        )}
                        {isRandomGenerating ? 'Generating...' : 'Random'}
                      </Button>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => setShowAutoGenerateForm(true)}
                            disabled={isRandomGenerating || isAutoGenerating}
                            className="flex items-center gap-1.5"
                          >
                            {isAutoGenerating ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <MagicWand className="h-3 w-3" />
                            )}
                            {isAutoGenerating
                              ? 'Generating...'
                              : 'Auto Generate'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Describe your agent and let AI create everything
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Progress Bar */}
                {(isRandomGenerating || isAutoGenerating) && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">
                        {isRandomGenerating
                          ? 'Generating Random Agent...'
                          : 'Generating Agent Details...'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {generationProgress}%
                      </span>
                    </div>
                    <Progress value={generationProgress} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                      {generationProgress < 30 && 'Preparing generation...'}
                      {generationProgress >= 30 &&
                        generationProgress < 60 &&
                        'Creating agent details...'}
                      {generationProgress >= 60 &&
                        generationProgress < 90 &&
                        'Generating avatar...'}
                      {generationProgress >= 90 && 'Finalizing...'}
                    </p>
                  </div>
                )}

                {/* Auto Generate Form */}
                {showAutoGenerateForm && (
                  <div className="mt-4 space-y-4 rounded-lg border border-border bg-background p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MagicWand className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-medium">
                          Auto Generate Agent
                        </h4>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowAutoGenerateForm(false);
                          setAutoGeneratePrompt('');
                        }}
                        disabled={isAutoGenerating}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="auto-generate-prompt">
                          Agent Description
                        </Label>
                        <Textarea
                          id="auto-generate-prompt"
                          placeholder="e.g., A coding assistant that helps with Python development, A creative writing helper for storytelling, A customer support agent for e-commerce..."
                          value={autoGeneratePrompt}
                          onChange={(e) =>
                            setAutoGeneratePrompt(e.target.value)
                          }
                          rows={3}
                          disabled={isAutoGenerating}
                        />
                        <p className="text-xs text-muted-foreground">
                          Be specific about the agent's purpose, expertise, and
                          personality for better results.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowAutoGenerateForm(false);
                            setAutoGeneratePrompt('');
                          }}
                          disabled={isAutoGenerating}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAutoGenerate}
                          disabled={
                            isAutoGenerating || !autoGeneratePrompt.trim()
                          }
                          className="flex items-center gap-2"
                        >
                          {isAutoGenerating ? (
                            <>
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <MagicWand className="h-3 w-3" />
                              Generate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 mt-6">
                {/* Agent Name */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="name">Agent Name *</Label>
                  </div>
                  <Input
                    id="name"
                    placeholder="e.g., Code Assistant, Writing Helper"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label>Avatar Image *</Label>
                  <div className="space-y-3">
                    {avatarPreview ? (
                      <div className="relative inline-block">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
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
                        className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400"
                        onClick={() => fileInputRef.current?.click()}
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
                        <Sparkle className="h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Upload an image file (JPEG, PNG, WebP, SVG). Max size:
                      5MB.
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

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of what this agent does"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
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
                  <p className="text-muted-foreground text-xs">
                    Categorize your agent to help organize and find it later.
                  </p>
                </div>

                {/* System Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="system_prompt">System Prompt</Label>
                  <Textarea
                    id="system_prompt"
                    placeholder="Define the agent's behavior, personality, and capabilities..."
                    value={formData.system_prompt}
                    onChange={(e) =>
                      handleInputChange('system_prompt', e.target.value)
                    }
                    rows={4}
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
                    If specified, this model will be automatically selected when
                    using this agent.
                  </p>
                </div>

                {/* More Options Section */}
                <Collapsible
                  open={isMoreSectionOpen}
                  onOpenChange={setIsMoreSectionOpen}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex w-full items-center justify-between p-0 text-sm font-medium hover:bg-transparent"
                    >
                      More Options
                      {isMoreSectionOpen ? (
                        <CaretUp className="h-4 w-4" />
                      ) : (
                        <CaretDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
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
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </form>
          </div>

          <DrawerFooter className="border-t px-6 py-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setHasAttemptedSubmit(false);
                  setIsMoreSectionOpen(false);
                }}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      form="create-agent-form"
                      type="submit"
                      disabled={
                        isLoading ||
                        !formData.name.trim() ||
                        (!avatarFile && !avatarPreview) ||
                        !formData.category_id
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
                  </TooltipTrigger>
                  {(isLoading ||
                    (!formData.name.trim() && hasAttemptedSubmit) ||
                    (!avatarFile && !avatarPreview && hasAttemptedSubmit) ||
                    (!formData.category_id && hasAttemptedSubmit)) && (
                    <TooltipContent>
                      <p>
                        {!formData.name.trim() &&
                        !avatarFile &&
                        !avatarPreview &&
                        !formData.category_id
                          ? 'Enter a name, add an avatar, and select a category to create your agent'
                          : !formData.name.trim() && !formData.category_id
                            ? 'Enter an agent name and select a category to continue'
                            : !formData.name.trim()
                              ? 'Enter an agent name to continue'
                              : !avatarFile &&
                                  !avatarPreview &&
                                  !formData.category_id
                                ? 'Add an avatar and select a category to create your agent'
                                : !avatarFile && !avatarPreview
                                  ? 'Add an avatar to create your agent'
                                  : 'Select a category to create your agent'}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Robot className="h-5 w-5" />
            {isEditing ? 'Edit Agent' : 'Create New Agent'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your agent&apos;s configuration and settings.'
              : 'Create a custom AI agent with specific instructions and behavior.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form
            id="create-agent-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Quick Start Section */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkle className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">
                      Quick Start
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Let AI generate all agent details for you
                  </p>
                </div>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRandomGenerate}
                      disabled={isRandomGenerating || isAutoGenerating}
                      className="flex items-center gap-1.5"
                    >
                      {isRandomGenerating ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Shuffle className="h-3 w-3" />
                      )}
                      {isRandomGenerating ? 'Generating...' : 'Random'}
                    </Button>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => setShowAutoGenerateForm(true)}
                          disabled={isRandomGenerating || isAutoGenerating}
                          className="flex items-center gap-1.5"
                        >
                          {isAutoGenerating ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <MagicWand className="h-3 w-3" />
                          )}
                          {isAutoGenerating ? 'Generating...' : 'Auto Generate'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Describe your agent and let AI create everything</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Progress Bar */}
              {(isRandomGenerating || isAutoGenerating) && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      {isRandomGenerating
                        ? 'Generating Random Agent...'
                        : 'Generating Agent Details...'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {generationProgress}%
                    </span>
                  </div>
                  <Progress value={generationProgress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">
                    {generationProgress < 30 && 'Preparing generation...'}
                    {generationProgress >= 30 &&
                      generationProgress < 60 &&
                      'Creating agent details...'}
                    {generationProgress >= 60 &&
                      generationProgress < 90 &&
                      'Generating avatar...'}
                    {generationProgress >= 90 && 'Finalizing...'}
                  </p>
                </div>
              )}

              {/* Auto Generate Form */}
              {showAutoGenerateForm && (
                <div className="mt-4 space-y-4 rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MagicWand className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-medium">
                        Auto Generate Agent
                      </h4>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAutoGenerateForm(false);
                        setAutoGeneratePrompt('');
                      }}
                      disabled={isAutoGenerating}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="auto-generate-prompt-desktop">
                        Agent Description
                      </Label>
                      <Textarea
                        id="auto-generate-prompt-desktop"
                        placeholder="e.g., A coding assistant that helps with Python development, A creative writing helper for storytelling, A customer support agent for e-commerce..."
                        value={autoGeneratePrompt}
                        onChange={(e) => setAutoGeneratePrompt(e.target.value)}
                        rows={3}
                        disabled={isAutoGenerating}
                      />
                      <p className="text-xs text-muted-foreground">
                        Be specific about the agent's purpose, expertise, and
                        personality for better results.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAutoGenerateForm(false);
                          setAutoGeneratePrompt('');
                        }}
                        disabled={isAutoGenerating}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAutoGenerate}
                        disabled={
                          isAutoGenerating || !autoGeneratePrompt.trim()
                        }
                        className="flex items-center gap-2"
                      >
                        {isAutoGenerating ? (
                          <>
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <MagicWand className="h-3 w-3" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 mt-6">
              {/* Agent Name */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="name">Agent Name *</Label>
                </div>
                <Input
                  id="name"
                  placeholder="e.g., Code Assistant, Writing Helper"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              {/* Avatar Upload */}
              <div className="space-y-2">
                <Label>Avatar Image *</Label>
                <div className="space-y-3">
                  {avatarPreview ? (
                    <div className="relative inline-block">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
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
                      className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400"
                      onClick={() => fileInputRef.current?.click()}
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
                      <Sparkle className="h-4 w-4" />
                      Generate
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Upload an image file (JPEG, PNG, WebP, SVG). Max size: 5MB.
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

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of what this agent does..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  rows={3}
                />
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label htmlFor="system_prompt">System Prompt *</Label>
                <Textarea
                  id="system_prompt"
                  placeholder="You are a helpful AI assistant that..."
                  value={formData.system_prompt}
                  onChange={(e) =>
                    handleInputChange('system_prompt', e.target.value)
                  }
                  rows={6}
                  required
                />
                <p className="text-muted-foreground text-xs">
                  Define the agent&apos;s behavior, personality, and
                  capabilities.
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
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
                <p className="text-muted-foreground text-xs">
                  Categorize your agent to help organize and find it later.
                </p>
              </div>

              {/* More Section */}
              <Collapsible
                open={isMoreSectionOpen}
                onOpenChange={setIsMoreSectionOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex w-full items-center justify-between p-0 text-sm font-medium"
                  >
                    More Options
                    {isMoreSectionOpen ? (
                      <CaretUp className="h-4 w-4" />
                    ) : (
                      <CaretDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  {/* Model Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="model">AI Model</Label>
                    <Select
                      value={formData.model}
                      onValueChange={(value) =>
                        handleInputChange('model', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((model) => {
                          const provider = PROVIDERS.find(
                            (p) => p.id === model.providerId
                          );
                          return (
                            <SelectItem
                              key={model.id}
                              value={model.id}
                              disabled={!model.accessible}
                            >
                              <div className="flex items-center gap-2">
                                {provider?.icon &&
                                  typeof provider.icon === 'string' && (
                                    <img
                                      src={provider.icon}
                                      alt={provider.name}
                                      className="h-4 w-4"
                                    />
                                  )}
                                <span>{model.name}</span>
                                {!model.accessible && (
                                  <span className="text-xs text-muted-foreground">
                                    (Premium)
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Public Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_public">Make Public</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow others to discover and use this agent
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
                </CollapsibleContent>
              </Collapsible>
            </div>
          </form>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setHasAttemptedSubmit(false);
                setIsMoreSectionOpen(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    form="create-agent-form"
                    type="submit"
                    disabled={
                      isLoading ||
                      !formData.name.trim() ||
                      (!avatarFile && !avatarPreview) ||
                      !formData.category_id
                    }
                  >
                    {isLoading
                      ? isEditing
                        ? 'Updating...'
                        : 'Creating...'
                      : isEditing
                        ? 'Update Agent'
                        : 'Create Agent'}
                  </Button>
                </TooltipTrigger>
                {(isLoading ||
                  (!formData.name.trim() && hasAttemptedSubmit) ||
                  (!avatarFile && !avatarPreview && hasAttemptedSubmit) ||
                  (!formData.category_id && hasAttemptedSubmit)) && (
                  <TooltipContent>
                    <p>
                      {!formData.name.trim() &&
                      !avatarFile &&
                      !avatarPreview &&
                      !formData.category_id
                        ? 'Enter a name, add an avatar, and select a category to create your agent'
                        : !formData.name.trim() && !avatarFile && !avatarPreview
                          ? 'Enter a name and add an avatar to create your agent'
                          : !formData.name.trim() && !formData.category_id
                            ? 'Enter a name and select a category to continue'
                            : !avatarFile &&
                                !avatarPreview &&
                                !formData.category_id
                              ? 'Add an avatar and select a category to create your agent'
                              : !formData.name.trim()
                                ? 'Enter an agent name to continue'
                                : !avatarFile && !avatarPreview
                                  ? 'Add an avatar to create your agent'
                                  : 'Select a category to create your agent'}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
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
