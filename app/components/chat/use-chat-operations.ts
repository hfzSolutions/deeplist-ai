import { toast } from '@/components/ui/toast';
import { checkRateLimits } from '@/lib/api';
import type { Chats } from '@/lib/chat-store/types';
import { REMAINING_QUERY_ALERT_THRESHOLD } from '@/lib/config';
import { Message } from '@ai-sdk/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

type UseChatOperationsProps = {
  isAuthenticated: boolean;
  chatId: string | null;
  messages: Message[];
  selectedModel: string | null;
  systemPrompt: string;
  createNewChat: (
    userId: string,
    title?: string,
    model?: string,
    isAuthenticated?: boolean,
    systemPrompt?: string
  ) => Promise<Chats | undefined>;
  setHasDialogAuth: (value: boolean) => void;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  setInput: (input: string) => void;
};

export function useChatOperations({
  isAuthenticated,
  chatId,
  messages,
  selectedModel,
  systemPrompt,
  createNewChat,
  setHasDialogAuth,
  setMessages,
}: UseChatOperationsProps) {
  const router = useRouter();
  // Chat utilities
  const checkLimitsAndNotify = async (uid: string): Promise<boolean> => {
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      router.push(`/auth?returnUrl=${returnUrl}`);
      return false;
    }

    try {
      const rateData = await checkRateLimits(uid, isAuthenticated);

      if (rateData.remaining === 0) {
        toast({
          title: 'Daily message limit reached',
          status: 'error',
        });
        return false;
      }

      if (rateData.remaining === REMAINING_QUERY_ALERT_THRESHOLD) {
        toast({
          title: `Only ${rateData.remaining} quer${
            rateData.remaining === 1 ? 'y' : 'ies'
          } remaining today.`,
          status: 'info',
        });
      }

      if (rateData.remainingPro === REMAINING_QUERY_ALERT_THRESHOLD) {
        toast({
          title: `Only ${rateData.remainingPro} pro quer${
            rateData.remainingPro === 1 ? 'y' : 'ies'
          } remaining today.`,
          status: 'info',
        });
      }

      return true;
    } catch (err) {
      console.error('Rate limit check failed:', err);
      return false;
    }
  };

  const ensureChatExists = async (userId: string, input: string) => {
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      router.push(`/auth?returnUrl=${returnUrl}`);
      return null;
    }

    if (messages.length === 0) {
      try {
        const newChat = await createNewChat(
          userId,
          input,
          selectedModel || undefined,
          isAuthenticated,
          systemPrompt
        );

        if (!newChat) return null;
        window.history.pushState(null, '', `/c/${newChat.id}`);

        return newChat.id;
      } catch (err: unknown) {
        let errorMessage = 'Something went wrong.';
        try {
          const errorObj = err as { message?: string };
          if (errorObj.message) {
            const parsed = JSON.parse(errorObj.message);
            errorMessage = parsed.error || errorMessage;
          }
        } catch {
          const errorObj = err as { message?: string };
          errorMessage = errorObj.message || errorMessage;
        }
        toast({
          title: errorMessage,
          status: 'error',
        });
        return null;
      }
    }

    return chatId;
  };

  // Message handlers
  const handleDelete = useCallback(
    (id: string) => {
      setMessages(messages.filter((message) => message.id !== id));
    },
    [messages, setMessages]
  );

  const handleEdit = useCallback(
    (id: string, newText: string) => {
      setMessages(
        messages.map((message) =>
          message.id === id ? { ...message, content: newText } : message
        )
      );
    },
    [messages, setMessages]
  );

  return {
    // Utils
    checkLimitsAndNotify,
    ensureChatExists,

    // Handlers
    handleDelete,
    handleEdit,
  };
}
