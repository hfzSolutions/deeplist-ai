import {
  FileUpload,
  FileUploadContent,
  FileUploadTrigger,
} from '@/components/prompt-kit/file-upload';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useModel } from '@/lib/model-store/provider';
import { isSupabaseEnabled } from '@/lib/supabase/config';
import { cn } from '@/lib/utils';
import { FileArrowUp, Paperclip } from '@phosphor-icons/react';
import React from 'react';
import { useRouter } from 'next/navigation';

type ButtonFileUploadProps = {
  onFileUpload: (files: File[]) => void;
  isUserAuthenticated: boolean;
  model: string;
};

export function ButtonFileUpload({
  onFileUpload,
  isUserAuthenticated,
  model,
}: ButtonFileUploadProps) {
  const router = useRouter();
  const { models } = useModel();

  if (!isSupabaseEnabled) {
    return null;
  }

  const selectedModel = models.find((m) => m.id === model);
  const isFileUploadAvailable = selectedModel?.vision;

  if (!isFileUploadAvailable) {
    return (
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="border-border dark:bg-secondary size-9 rounded-full border bg-transparent"
                type="button"
                aria-label="Add files"
              >
                <Paperclip className="size-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Add files</TooltipContent>
        </Tooltip>
        <PopoverContent className="p-2">
          <div className="text-secondary-foreground text-sm">
            This model does not support file uploads.
            <br />
            Please select another model.
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  const handleFileUploadClick = () => {
    if (!isUserAuthenticated) {
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      router.push(`/auth?returnUrl=${returnUrl}`);
      return;
    }
    // For authenticated users, the FileUpload component will handle the click
  };

  if (!isUserAuthenticated) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="secondary"
            className="border-border dark:bg-secondary size-9 rounded-full border bg-transparent"
            type="button"
            aria-label="Add files"
            onClick={handleFileUploadClick}
          >
            <Paperclip className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add files</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <FileUpload
      onFilesAdded={onFileUpload}
      multiple
      disabled={!isUserAuthenticated}
      accept=".txt,.md,image/jpeg,image/png,image/gif,image/webp,image/svg,image/heic,image/heif"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <FileUploadTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                'border-border dark:bg-secondary size-9 rounded-full border bg-transparent',
                !isUserAuthenticated && 'opacity-50'
              )}
              type="button"
              disabled={!isUserAuthenticated}
              aria-label="Add files"
            >
              <Paperclip className="size-4" />
            </Button>
          </FileUploadTrigger>
        </TooltipTrigger>
        <TooltipContent>Add files</TooltipContent>
      </Tooltip>
      <FileUploadContent>
        <div className="border-input bg-background flex flex-col items-center rounded-lg border border-dashed p-8">
          <FileArrowUp className="text-muted-foreground size-8" />
          <span className="mt-4 mb-1 text-lg font-medium">Drop files here</span>
          <span className="text-muted-foreground text-sm">
            Drop any files here to add it to the conversation
          </span>
        </div>
      </FileUploadContent>
    </FileUpload>
  );
}
