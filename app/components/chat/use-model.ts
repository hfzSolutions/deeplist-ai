import { toast } from '@/components/ui/toast';
import { Chats } from '@/lib/chat-store/types';
import type { UserProfile } from '@/lib/user/types';
import { useCallback, useState, useEffect } from 'react';

interface UseModelProps {
  currentChat: Chats | null;
  user: UserProfile | null;
  updateChatModel?: (chatId: string, model: string) => Promise<void>;
  chatId: string | null;
}

/**
 * Simplified hook to manage the current selected model
 * Model selection: manual override > currentChat?.model > defaultModel
 */
export function useModel({
  currentChat,
  user,
  updateChatModel,
  chatId,
}: UseModelProps) {
  const [defaultModel, setDefaultModel] = useState<string | null>(null);
  const [manualModelOverride, setManualModelOverride] = useState<string | null>(
    null
  );

  // Load default model once on mount
  useEffect(() => {
    fetch('/api/model-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.defaultModel) {
          setDefaultModel(data.defaultModel);
        } else {
          console.error('No default model configured');
          setDefaultModel(null);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch default model:', error);
        setDefaultModel(null);
      });
  }, []);

  // Model selection: manual override > currentChat?.model > defaultModel
  const selectedModel =
    manualModelOverride ||
    currentChat?.model ||
    defaultModel ||
    null;

  // Function to handle model changes
  const handleModelChange = useCallback(
    async (newModel: string) => {
      // Set manual override to replace current selectedModel
      setManualModelOverride(newModel);

      // For authenticated users with a chat, persist the change
      if (chatId && updateChatModel && user?.id) {
        try {
          await updateChatModel(chatId, newModel);
        } catch (err) {
          console.error('Failed to update chat model:', err);
          toast({
            title: 'Failed to update chat model',
            status: 'error',
          });
          throw err;
        }
      }
    },
    [chatId, updateChatModel, user?.id]
  );

  return {
    selectedModel,
    handleModelChange,
  };
}
