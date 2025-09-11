import { toast } from '@/components/ui/toast';
import { useAgents } from '@/lib/agent-store/provider';
import { Chats } from '@/lib/chat-store/types';
// Default model is now fetched from API endpoint
import type { UserProfile } from '@/lib/user/types';
import { useCallback, useState, useEffect } from 'react';

interface UseModelProps {
  currentChat: Chats | null;
  user: UserProfile | null;
  updateChatModel?: (chatId: string, model: string) => Promise<void>;
  chatId: string | null;
}

/**
 * Hook to manage the current selected model with proper fallback logic
 * Handles both cases: with existing chat (persists to DB) and without chat (local state only)
 * @param currentChat - The current chat object
 * @param user - The current user object
 * @param updateChatModel - Function to update chat model in the database
 * @param chatId - The current chat ID
 * @returns Object containing selected model and handler function
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

  // Load the default model from database
  useEffect(() => {
    fetch('/api/model-config')
      .then((res) => res.json())
      .then((data) => setDefaultModel(data.defaultModel))
      .catch(() => setDefaultModel('openrouter:deepseek/deepseek-r1:free'));
  }, []);

  // Calculate the effective model based on priority: chat model > first favorite > agent model > default
  const getEffectiveModel = useCallback(() => {
    const firstFavoriteModel = user?.favorite_models?.[0];
    return (
      currentChat?.model ||
      firstFavoriteModel ||
      selectedAgent?.model ||
      defaultModel
    );
  }, [
    currentChat?.model,
    selectedAgent?.model,
    user?.favorite_models,
    defaultModel,
  ]);

  // Use local state only for temporary overrides, derive base value from props
  const [localSelectedModel, setLocalSelectedModel] = useState<string | null>(
    null
  );

  // Reset local selection when chatId changes to prevent stale model selection
  useEffect(() => {
    setLocalSelectedModel(null);
  }, [chatId]);

  // On first agent switch in a session, adopt agent's model if there's no chat model and no manual selection yet
  useEffect(() => {
    if (!selectedAgent?.model) return;

    // If there's no persisted chat yet, or we can't update it, apply locally
    if (!chatId || !user?.id || !updateChatModel) {
      // Avoid overriding an explicit local selection to the same value
      if (localSelectedModel !== selectedAgent.model) {
        setLocalSelectedModel(selectedAgent.model);
      }
      return;
    }

    // Persist the agent's model to the current chat when switching agents
    // Only if it actually differs from the current chat model to avoid redundant writes
    if (currentChat?.model !== selectedAgent.model) {
      // Optimistically reflect the change in UI
      setLocalSelectedModel(selectedAgent.model);
      updateChatModel(chatId, selectedAgent.model).catch(() => {
        // Revert optimistic change on failure
        setLocalSelectedModel(null);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedAgent?.id,
    selectedAgent?.model,
    chatId,
    user?.id,
    currentChat?.model,
  ]);

  // Clear local override only after the chat model reflects the persisted value
  useEffect(() => {
    if (localSelectedModel && currentChat?.model === localSelectedModel) {
      setLocalSelectedModel(null);
    }
  }, [currentChat?.model, localSelectedModel]);

  // The actual selected model: local override or computed effective model
  const selectedModel = localSelectedModel || getEffectiveModel();

  // Function to handle model changes with proper validation and error handling
  const handleModelChange = useCallback(
    async (newModel: string) => {
      // For authenticated users without a chat, we can't persist yet
      // but we still allow the model selection for when they create a chat
      if (!user?.id && !chatId) {
        // For unauthenticated users without chat, just update local state
        setLocalSelectedModel(newModel);
        return;
      }

      // For authenticated users with a chat, persist the change
      if (chatId && updateChatModel && user?.id) {
        // Optimistically update the state and keep it until server reflects change
        setLocalSelectedModel(newModel);

        try {
          await updateChatModel(chatId, newModel);
          // Do not clear here; effect above will clear when currentChat.model matches
        } catch (err) {
          // Revert on error
          setLocalSelectedModel(null);
          console.error('Failed to update chat model:', err);
          toast({
            title: 'Failed to update chat model',
            status: 'error',
          });
          throw err;
        }
      } else if (user?.id) {
        // Authenticated user but no chat yet - just update local state
        // The model will be used when creating a new chat
        setLocalSelectedModel(newModel);
      }
    },
    [chatId, updateChatModel, user?.id]
  );

  return {
    selectedModel,
    handleModelChange,
  };
}
