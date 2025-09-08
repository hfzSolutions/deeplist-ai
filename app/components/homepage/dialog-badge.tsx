'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExternalAITool } from '@/lib/external-ai-tools-store/types';
import { Copy } from '@phosphor-icons/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DialogBadgeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: ExternalAITool | null;
}

export function DialogBadge({ open, onOpenChange, tool }: DialogBadgeProps) {
  const [copied, setCopied] = useState(false);

  if (!tool) return null;

  const generateBadgeCode = (tool: ExternalAITool) => {
    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://deeplist.ai';
    const toolUrl = `${baseUrl}/tools/${tool.id}`;
    const logoUrl = `${baseUrl}/deeplistai-logo.png`;

    return `<!-- DeepList AI Badge -->
<a href="${toolUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 12px; padding: 12px 16px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #475569; transition: all 0.2s ease; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0, 0, 0, 0.1)'">
  <img src="${logoUrl}" alt="DeepList AI" width="24" height="24" style="flex-shrink: 0; object-fit: contain;" />
  <div style="display: flex; flex-direction: column; line-height: 1.2;">
    <span style="font-size: 10px; color: #64748b; font-weight: 500;">LISTED ON</span>
    <span style="font-size: 12px; color: #1e293b; font-weight: 700;">DeepList AI</span>
  </div>
</a>`;
  };

  const handleCopyCode = async () => {
    try {
      const badgeCode = generateBadgeCode(tool);
      await navigator.clipboard.writeText(badgeCode);
      setCopied(true);
      toast.success('Badge code copied to clipboard!');

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy badge code:', error);
      toast.error('Failed to copy badge code');
    }
  };

  const BadgePreview = () => {
    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://deeplist.ai';
    const toolUrl = `${baseUrl}/tools/${tool.id}`;

    return (
      <a
        href={toolUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg shadow-sm transition-all hover:transform hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          window.open(toolUrl, '_blank', 'noopener,noreferrer');
        }}
      >
        <img
          src="/deeplistai-logo.png"
          alt="DeepList AI"
          width={24}
          height={24}
          className="flex-shrink-0 object-contain"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-xs text-slate-500 font-medium">LISTED ON</span>
          <span className="text-sm text-slate-800 font-bold">DeepList AI</span>
        </div>
      </a>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Tool Badge to Your Website</DialogTitle>
          <DialogDescription>
            Show visitors your tool is listed on DeepList AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badge Preview */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Preview
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Click to test the badge
              </p>
            </div>
            <div className="flex justify-center">
              <BadgePreview />
            </div>
          </div>

          {/* Copy Button */}
          <div className="flex justify-center">
            <Button onClick={handleCopyCode} className="w-full max-w-xs">
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Badge Code'}
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              How to use
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                  1
                </span>
                <span>Copy the badge code above</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                  2
                </span>
                <span>Paste it into your website's HTML</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                  3
                </span>
                <span>Visitors can click the badge to visit your tool</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
