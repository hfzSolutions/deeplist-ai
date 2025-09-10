'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { useAgents } from '@/lib/agent-store/provider';
import { Agent } from '@/lib/agent-store/types';
import { useUser } from '@/lib/user-store/provider';
import { LinkSimple, Robot } from '@phosphor-icons/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { DialogCreateAgent } from '../layout/sidebar/dialog-create-agent';
import { ExternalToolsSection } from './external-tools-section';
import { AgentsSection } from './agents-section';
import { DialogAgentDetails } from '../homepage/dialog-agent-details';
import { LoginPrompt } from '../auth/login-prompt';
import { TerminologyHelper, AnnouncementBanner } from '../transition';

export function StoreContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('agents');
  const [isCreateAgentDialogOpen, setIsCreateAgentDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState('');
  const [agentDetailsDialogOpen, setAgentDetailsDialogOpen] = useState(false);
  const [selectedAgentForDetails, setSelectedAgentForDetails] =
    useState<Agent | null>(null);

  // Check URL parameters and update view accordingly
  useEffect(() => {
    const toolParam = searchParams.get('tool');

    if (toolParam) {
      // If there's a tool parameter, switch to external tools tab
      setActiveTab('external');
    }
  }, [searchParams]);

  const {
    selectedAgent,
    setSelectedAgent,
    deleteAgent,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleSave,
  } = useAgents();
  const { user } = useUser();

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgentForDetails(agent);
    setAgentDetailsDialogOpen(true);
  };

  const handleStartChatWithAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    // Navigate to chat page with selected agent
    router.push('/');
    toast({
      title: 'Agent Selected',
      description: `${agent.name} is now your active agent. Starting chat...`,
    });
  };

  const handleStartChatWithoutAgent = () => {
    setSelectedAgent(null);
    // Navigate to chat page without specific agent
    router.push('/');
    toast({
      title: 'Chat Started',
      description: 'Starting chat without a specific agent.',
    });
  };

  const handleCreateAgent = () => {
    setIsCreateAgentDialogOpen(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setIsCreateAgentDialogOpen(true);
  };

  const handleDeleteAgent = async (agent: Agent) => {
    if (window.confirm(`Are you sure you want to delete "${agent.name}"?`)) {
      try {
        const success = await deleteAgent(agent.id);
        if (success) {
          toast({
            title: 'Success',
            description: `Agent "${agent.name}" deleted successfully`,
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to delete agent',
          });
        }
      } catch (error) {
        console.error('Error deleting agent:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete agent',
        });
      }
    }
  };

  const handleCloseDialog = () => {
    setIsCreateAgentDialogOpen(false);
    setEditingAgent(null);
  };

  const handleLoginPrompt = (action: string) => {
    setLoginPromptAction(action);
    setShowLoginPrompt(true);
  };

  const handleSaveToggle = async (agent: Agent) => {
    if (!user) {
      handleLoginPrompt('save agents');
      return;
    }

    try {
      const success = await toggleSave(agent.id);
      if (success) {
        if (isFavorite(agent.id)) {
          toast({
            title: 'Removed',
            description: 'Agent removed from saved!',
          });
        } else {
          toast({
            title: 'Saved',
            description: 'Agent saved successfully!',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update save status',
        });
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update save status',
      });
    }
  };

  const handleEditAgentWithAuth = (agent: Agent) => {
    if (!user) {
      handleLoginPrompt('edit agents');
      return;
    }
    handleEditAgent(agent);
  };

  const handleDeleteAgentWithAuth = (agent: Agent) => {
    if (!user) {
      handleLoginPrompt('delete agents');
      return;
    }
    handleDeleteAgent(agent);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header with Navigation Tabs */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b px-4 py-6 backdrop-blur sm:px-6 sm:mt-0 mt-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-fit"
              >
                <TabsList className="h-10 bg-muted/50 p-1">
                  <TabsTrigger
                    value="agents"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all hover:bg-accent/80 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <Robot size={16} className="transition-colors" />
                    Agents
                  </TabsTrigger>
                  <TabsTrigger
                    value="external"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all hover:bg-accent/80 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <LinkSimple size={16} className="transition-colors" />
                    External Tools
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col"
      >
        <TabsContent value="agents" className="mt-0 flex flex-1 flex-col">
          <AnnouncementBanner />
          <AgentsSection
            onCreateAgent={handleCreateAgent}
            onEditAgent={handleEditAgent}
            onDeleteAgent={handleDeleteAgent}
            onStartChatWithAgent={handleStartChatWithAgent}
            onStartChatWithoutAgent={handleStartChatWithoutAgent}
            onSaveToggle={handleSaveToggle}
            onEditAgentWithAuth={handleEditAgentWithAuth}
            onDeleteAgentWithAuth={handleDeleteAgentWithAuth}
            onLoginPrompt={handleLoginPrompt}
            isCreateAgentDialogOpen={isCreateAgentDialogOpen}
            editingAgent={editingAgent}
            onCloseDialog={handleCloseDialog}
            showLoginPrompt={showLoginPrompt}
            loginPromptAction={loginPromptAction}
            agentDetailsDialogOpen={agentDetailsDialogOpen}
            selectedAgentForDetails={selectedAgentForDetails}
            onAgentDetailsDialogChange={setAgentDetailsDialogOpen}
            onStartChatWithAgentFromDetails={handleStartChatWithAgent}
            onSelectAgent={handleSelectAgent}
          />
        </TabsContent>

        <TabsContent value="external" className="mt-0 flex flex-1 flex-col">
          <ExternalToolsSection toolId={searchParams.get('tool')} />
        </TabsContent>
      </Tabs>

      <DialogCreateAgent
        isOpen={isCreateAgentDialogOpen}
        setIsOpen={handleCloseDialog}
        agent={editingAgent}
      />

      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <LoginPrompt
            action={loginPromptAction}
            variant="inline"
            className="border-0 p-0"
          />
        </DialogContent>
      </Dialog>

      <DialogAgentDetails
        open={agentDetailsDialogOpen}
        onOpenChange={setAgentDetailsDialogOpen}
        agent={selectedAgentForDetails}
        onStartChat={handleStartChatWithAgent}
      />
    </div>
  );
}
