'use client';

import { useState, useEffect } from 'react';
import { ChatContainer } from '@/app/components/chat/chat-container';
import { WelcomeDialog } from './welcome-dialog';
import { useChatSession } from '@/lib/chat-store/session/provider';
import { useMessages } from '@/lib/chat-store/messages/provider';

export function HomepageContainer() {
  const { chatId } = useChatSession();
  const { messages } = useMessages();
  const [showBenefitsDialog, setShowBenefitsDialog] = useState(false);

  // Show benefits dialog only if:
  // 1. No active chat
  // 2. No messages in current session
  // 3. User hasn't seen the benefits before
  const shouldShowDialog = !chatId && messages.length === 0;

  // Check if user has seen the benefits before
  useEffect(() => {
    if (!shouldShowDialog) return;

    const hasSeenBenefits = localStorage.getItem('deeplist-has-seen-benefits');
    if (hasSeenBenefits !== 'true') {
      // Show dialog after a short delay to let the page load
      const timer = setTimeout(() => {
        setShowBenefitsDialog(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [shouldShowDialog]);

  // Hide dialog when user starts chatting
  useEffect(() => {
    if (messages.length > 0) {
      setShowBenefitsDialog(false);
    }
  }, [messages.length]);

  // Mark benefits as seen when user interacts
  const handleStartChatting = () => {
    localStorage.setItem('deeplist-has-seen-benefits', 'true');
    setShowBenefitsDialog(false);
    // Navigate to auth page
    window.location.href = '/auth';
  };

  const handleCloseDialog = () => {
    localStorage.setItem('deeplist-has-seen-benefits', 'true');
    setShowBenefitsDialog(false);
  };

  return (
    <>
      <ChatContainer />
      <WelcomeDialog
        open={showBenefitsDialog}
        onOpenChange={handleCloseDialog}
        onStartChatting={handleStartChatting}
      />
    </>
  );
}
