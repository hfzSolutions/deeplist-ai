import { toast } from '@/components/ui/toast';
import { useAgents } from '@/lib/agent-store/provider';
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
 * Uses selectedAgent directly: if null use defaultModel, if has value use selectedAgent.model
 */
export function useModel({
  currentChat,
  user,
  updateChatModel,
  chatId,
}: UseModelProps) {
  const { selectedAgent } = useAgents();
  const [defaultModel, setDefaultModel] = useState<string>(
    'openrouter:deepseek/deepseek-r1:free'
  );
  const [manualModelOverride, setManualModelOverride] = useState<string | null>(
    null
  );

  // Load default model once on mount
  useEffect(() => {
    fetch('/api/model-config')
      .then((res) => res.json())
      .then((data) => setDefaultModel(data.defaultModel))
      .catch(() => setDefaultModel('openrouter:deepseek/deepseek-r1:free'));
  }, []);

  // Model selection: manual override > selectedAgent?.model > defaultModel
  const selectedModel =
    manualModelOverride || selectedAgent?.model || defaultModel;

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
