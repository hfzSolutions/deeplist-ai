import { toast } from '@/components/ui/toast';
import { useAgents } from '@/lib/agent-store/provider';

import { MESSAGE_MAX_LENGTH, SYSTEM_PROMPT_DEFAULT } from '@/lib/config';
import { Attachment } from '@/lib/file-handling';
import { API_ROUTE_CHAT } from '@/lib/routes';
import type { UserProfile } from '@/lib/user/types';
import type { Message } from '@ai-sdk/react';
import { useChat } from '@ai-sdk/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type UseChatCoreProps = {
  initialMessages: Message[];
  cacheAndAddMessage: (message: Message) => void;
  chatId: string | null;
  user: UserProfile | null;
  files: File[];
  createOptimisticAttachments: (
    files: File[]
  ) => Array<{ name: string; contentType: string; url?: string }>;
  setFiles: (files: File[]) => void;
  checkLimitsAndNotify: (uid: string) => Promise<boolean>;
  cleanupOptimisticAttachments: (attachments?: Array<{ url?: string }>) => void;
  ensureChatExists: (uid: string, input: string) => Promise<string | null>;
  handleFileUploads: (
    uid: string,
    chatId: string
  ) => Promise<Attachment[] | null>;
  selectedModel: string | null;
  bumpChat: (chatId: string) => void;
};

export function useChatCore({
  initialMessages,
  cacheAndAddMessage,
  chatId,
  user,
  files,
  createOptimisticAttachments,
  setFiles,
  checkLimitsAndNotify,
  cleanupOptimisticAttachments,
  ensureChatExists,
  handleFileUploads,
  selectedModel,
  bumpChat,
}: UseChatCoreProps) {
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDialogAuth, setHasDialogAuth] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);

  // Refs and derived state
  const hasSentFirstMessageRef = useRef(false);
  const prevChatIdRef = useRef<string | null>(chatId);
  const isAuthenticated = useMemo(() => !!user?.id, [user?.id]);
  const { selectedAgent } = useAgents();
  const router = useRouter();
  const systemPrompt = useMemo(
    () =>
      selectedAgent?.system_prompt ||
      user?.system_prompt ||
      SYSTEM_PROMPT_DEFAULT,
    [selectedAgent?.system_prompt, user?.system_prompt]
  );

  // Search params handling
  const searchParams = useSearchParams();
  const prompt = searchParams.get('prompt');

  // Handle errors directly in onError callback
  const handleError = useCallback((error: Error) => {
    console.error('Chat error:', error);
    console.error('Error message:', error.message);
    let errorMsg = error.message || 'Something went wrong.';

    if (errorMsg === 'An error occurred' || errorMsg === 'fetch failed') {
      errorMsg = 'Something went wrong. Please try again.';
    }

    toast({
      title: errorMsg,
      status: 'error',
    });
  }, []);

  // Custom onFinish handler to attach agent data to agent messages
  const handleFinish = useCallback(
    (message: Message) => {
      // Attach agent data to agent messages
      if (message.role === 'assistant' && selectedAgent) {
        const messageWithAgent = {
          ...message,
          agent_id: selectedAgent.id,
          agent: {
            id: selectedAgent.id,
            name: selectedAgent.name,
            avatar_url: selectedAgent.avatar_url,
          },
        };
        cacheAndAddMessage(messageWithAgent);
      } else {
        cacheAndAddMessage(message);
      }
    },
    [cacheAndAddMessage, selectedAgent]
  );

  // Initialize useChat
  const {
    messages: rawMessages,
    input,
    handleSubmit,
    status,
    error,
    reload,
    stop,
    setMessages,
    setInput,
    append,
  } = useChat({
    api: API_ROUTE_CHAT,
    initialMessages,
    initialInput: '',
    onFinish: handleFinish,
    onError: handleError,
  });

  // UI status: show 'submitted' immediately after we enqueue the optimistic user message
  // so the typing indicator appears while preflight (limits, chat ensure, uploads) run.
  const [uiIsSubmitted, setUiIsSubmitted] = useState(false);

  // Transform messages to include agent data for agent messages
  const messages = useMemo(() => {
    return rawMessages.map((message) => {
      // Only add agent data to agent messages that don't already have it
      if (
        message.role === 'assistant' &&
        selectedAgent &&
        !(message as any).agent_id
      ) {
        return {
          ...message,
          agent_id: selectedAgent.id,
          agent: {
            id: selectedAgent.id,
            name: selectedAgent.name,
            avatar_url: selectedAgent.avatar_url,
          },
        };
      }
      return message;
    });
  }, [rawMessages, selectedAgent]);

  // Handle search params on mount
  useEffect(() => {
    if (prompt && typeof window !== 'undefined') {
      requestAnimationFrame(() => setInput(prompt));
    }
  }, [prompt, setInput]);

  // Reset messages when navigating from a chat to home
  useEffect(() => {
    if (
      prevChatIdRef.current !== null &&
      chatId === null &&
      messages.length > 0
    ) {
      setMessages([]);
    }
    prevChatIdRef.current = chatId;
  }, [chatId, messages.length, setMessages]);

  // Submit action
  const submit = useCallback(async () => {
    setIsSubmitting(true);

    if (!isAuthenticated || !user?.id) {
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      router.push(`/auth?returnUrl=${returnUrl}`);
      setIsSubmitting(false);
      return;
    }

    // Check if a model is selected
    if (!selectedModel) {
      toast({
        title: 'No model selected',
        description: 'Please select a model before sending a message.',
        status: 'error',
      });
      setIsSubmitting(false);
      return;
    }

    const uid = user.id;

    const optimisticId = `optimistic-${Date.now().toString()}`;
    const optimisticAttachments =
      files.length > 0 ? createOptimisticAttachments(files) : [];

    const optimisticMessage = {
      id: optimisticId,
      content: input,
      role: 'user' as const,
      createdAt: new Date(),
      experimental_attachments:
        optimisticAttachments.length > 0 ? optimisticAttachments : undefined,
      agent_id: selectedAgent?.id || null,
      agent: selectedAgent
        ? {
            id: selectedAgent.id,
            name: selectedAgent.name,
            avatar_url: selectedAgent.avatar_url,
          }
        : null,
    } as Message & {
      agent_id: string | null;
      agent: { id: string; name: string; avatar_url: string | null } | null;
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    // Trigger loader early
    setUiIsSubmitted(true);
    setInput('');

    const submittedFiles = [...files];
    setFiles([]);

    try {
      const allowed = await checkLimitsAndNotify(uid);
      if (!allowed) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        cleanupOptimisticAttachments(
          optimisticMessage.experimental_attachments
        );
        return;
      }

      const currentChatId = await ensureChatExists(uid, input);
      if (!currentChatId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
        cleanupOptimisticAttachments(
          optimisticMessage.experimental_attachments
        );
        return;
      }

      if (input.length > MESSAGE_MAX_LENGTH) {
        toast({
          title: `The message you submitted was too long, please submit something shorter. (Max ${MESSAGE_MAX_LENGTH} characters)`,
          status: 'error',
        });
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
        cleanupOptimisticAttachments(
          optimisticMessage.experimental_attachments
        );
        return;
      }

      let attachments: Attachment[] | null = [];
      if (submittedFiles.length > 0) {
        attachments = await handleFileUploads(uid, currentChatId);
        if (attachments === null) {
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
          cleanupOptimisticAttachments(
            optimisticMessage.experimental_attachments
          );
          return;
        }
      }

      const options = {
        body: {
          chatId: currentChatId,
          userId: uid,
          model: selectedModel!,
          isAuthenticated,
          systemPrompt: systemPrompt || SYSTEM_PROMPT_DEFAULT,
          enableSearch,
          agentId: selectedAgent?.id || null,
        },
        experimental_attachments: attachments || undefined,
      };

      handleSubmit(undefined, options);
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments);
      cacheAndAddMessage(optimisticMessage);

      if (messages.length > 0) {
        bumpChat(currentChatId);
      }
    } catch {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments);
      toast({ title: 'Failed to send message', status: 'error' });
    } finally {
      setIsSubmitting(false);
      // When streaming starts, status will change to 'streaming'; when ready, reset UI submitted
      // Safety timeout reset in case of early errors handled above
      setTimeout(() => setUiIsSubmitted(false), 0);
    }
  }, [
    user,
    files,
    createOptimisticAttachments,
    input,
    setMessages,
    setInput,
    setFiles,
    checkLimitsAndNotify,
    cleanupOptimisticAttachments,
    ensureChatExists,
    handleFileUploads,
    selectedModel,
    isAuthenticated,
    systemPrompt,
    enableSearch,
    handleSubmit,
    cacheAndAddMessage,
    messages.length,
    bumpChat,
    setIsSubmitting,
    router,
  ]);

  // Derive status for UI: prefer actual status, but if it's 'ready' while we're preflighting,
  // expose 'submitted' so the loader renders without waiting for network response.
  const derivedStatus =
    uiIsSubmitted && status === 'ready' ? 'submitted' : status;

  // Handle suggestion
  const handleSuggestion = useCallback(
    async (suggestion: string) => {
      setIsSubmitting(true);
      const optimisticId = `optimistic-${Date.now().toString()}`;
      const optimisticMessage = {
        id: optimisticId,
        content: suggestion,
        role: 'user' as const,
        createdAt: new Date(),
        agent_id: selectedAgent?.id || null,
        agent: selectedAgent
          ? {
              id: selectedAgent.id,
              name: selectedAgent.name,
              avatar_url: selectedAgent.avatar_url,
            }
          : null,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        if (!isAuthenticated || !user?.id) {
          const returnUrl = encodeURIComponent(
            window.location.pathname + window.location.search
          );
          router.push(`/auth?returnUrl=${returnUrl}`);
          setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
          return;
        }

        const uid = user.id;

        const allowed = await checkLimitsAndNotify(uid);
        if (!allowed) {
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
          return;
        }

        const currentChatId = await ensureChatExists(uid, suggestion);

        if (!currentChatId) {
          setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
          return;
        }

        const options = {
          body: {
            chatId: currentChatId,
            userId: uid,
            model: selectedModel!,
            isAuthenticated,
            systemPrompt: SYSTEM_PROMPT_DEFAULT,
            agentId: selectedAgent?.id || null,
          },
        };

        append(
          {
            role: 'user',
            content: suggestion,
          },
          options
        );
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
      } catch {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
        toast({ title: 'Failed to send suggestion', status: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      ensureChatExists,
      selectedModel,
      user,
      append,
      checkLimitsAndNotify,
      isAuthenticated,
      setMessages,
      setIsSubmitting,
      selectedAgent,
      router,
    ]
  );

  // Handle reload
  const handleReload = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      router.push(`/auth?returnUrl=${returnUrl}`);
      return;
    }

    const uid = user.id;

    const options = {
      body: {
        chatId,
        userId: uid,
        model: selectedModel!,
        isAuthenticated,
        systemPrompt: systemPrompt || SYSTEM_PROMPT_DEFAULT,
        agentId: selectedAgent?.id || null,
      },
    };

    reload(options);
  }, [
    user,
    chatId,
    selectedModel,
    isAuthenticated,
    systemPrompt,
    selectedAgent,
    reload,
    router,
  ]);

  // Handle input change - now with access to the real setInput function
  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
    },
    [setInput]
  );

  return {
    // Chat state
    messages,
    input,
    handleSubmit,
    status: derivedStatus,
    error,
    reload,
    stop,
    setMessages,
    setInput,
    append,
    isAuthenticated,
    systemPrompt,
    hasSentFirstMessageRef,

    // Component state
    isSubmitting,
    setIsSubmitting,
    hasDialogAuth,
    setHasDialogAuth,
    enableSearch,
    setEnableSearch,

    // Actions
    submit,
    handleSuggestion,
    handleReload,
    handleInputChange,
  };
}
