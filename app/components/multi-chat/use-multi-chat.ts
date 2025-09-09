// todo: fix this
/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from '@/components/ui/toast';
import { useChat } from '@ai-sdk/react';
import { useMemo } from 'react';

type ModelConfig = {
  id: string;
  name: string;
  provider: string;
};

type ModelChat = {
  model: ModelConfig;
  messages: any[];
  isLoading: boolean;
  append: (message: any, options?: any) => void;
  stop: () => void;
};

// Maximum number of models we support
const MAX_MODELS = 10;

export function useMultiChat(models: ModelConfig[]): ModelChat[] {
  // Create a fixed number of useChat hooks to avoid conditional hook calls
  const chatHooks = Array.from({ length: MAX_MODELS }, (_, index) => {
    const model = models[index];
    return useChat({
      api: '/api/chat',
      onError: (error) => {
        if (model) {
          console.error(`Error with ${model.name}:`, error);
          toast({
            title: `Error with ${model.name}`,
            description: error.message,
            status: 'error',
          });
        }
      },
    });
  });

  // Map only the provided models to their corresponding chat hooks
  const activeChatInstances = useMemo(() => {
    const instances = models.slice(0, MAX_MODELS).map((model, index) => {
      const chatHook = chatHooks[index];

      return {
        model,
        messages: chatHook.messages,
        isLoading: chatHook.isLoading,
        append: (message: any, options?: any) => {
          return chatHook.append(message, options);
        },
        stop: chatHook.stop,
      };
    });

    return instances;
  }, [models, chatHooks]);

  return activeChatInstances;
}
