'use client';

import { fetchClient } from '@/lib/fetch';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Agent, AgentContextType, PaginationParams } from './types';

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function useAgents() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [sidebarAgents, setSidebarAgents] = useState<Agent[]>([]);
  const [favoriteAgents, setFavoriteAgents] = useState<Agent[]>([]);
  const [historyAgents, setHistoryAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarLoading, setIsSidebarLoading] = useState(true);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [publicAgentCount, setPublicAgentCount] = useState<number>(0);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);

  const refreshAgents = useCallback(async (params?: PaginationParams) => {
    try {
      setIsLoading(true);
      const searchParams = new URLSearchParams();

      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);
      if (params?.tags) searchParams.set('tags', params.tags);
      if (params?.category) searchParams.set('category', params.category);

      const url = `/api/agents${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await fetchClient(url);

      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
        setPagination(data.pagination || null);
      } else {
        console.error('Failed to fetch agents');
        setAgents([]);
        setPagination(null);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshFavoriteAgents = useCallback(async () => {
    try {
      setIsFavoritesLoading(true);
      const response = await fetchClient('/api/agents/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavoriteAgents(data.agents || []);
      } else {
        console.error('Failed to fetch favorite agents');
        setFavoriteAgents([]);
      }
    } catch (error) {
      console.error('Error fetching favorite agents:', error);
      setFavoriteAgents([]);
    } finally {
      setIsFavoritesLoading(false);
    }
  }, []);

  const refreshHistoryAgents = useCallback(async () => {
    try {
      setIsHistoryLoading(true);
      const response = await fetchClient('/api/agents/history');
      if (response.ok) {
        const data = await response.json();
        setHistoryAgents(data.agents || []);
      } else {
        console.error('Failed to fetch agent history');
        setHistoryAgents([]);
      }
    } catch (error) {
      console.error('Error fetching agent history:', error);
      setHistoryAgents([]);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  const createAgent = useCallback(
    async (
      agentData: Omit<Agent, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ): Promise<Agent | null> => {
      try {
        const response = await fetchClient('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(agentData),
        });

        if (response.ok) {
          const data = await response.json();
          const newAgent = data.agent;
          setAgents((prev) => [newAgent, ...prev]);
          setSidebarAgents((prev) => [newAgent, ...prev]);
          return newAgent;
        } else {
          console.error('Failed to create agent');
          return null;
        }
      } catch (error) {
        console.error('Error creating agent:', error);
        return null;
      }
    },
    []
  );

  const updateAgent = useCallback(
    async (
      agentId: string,
      agentData: Omit<Agent, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ): Promise<Agent | null> => {
      try {
        const response = await fetchClient(`/api/agents/${agentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(agentData),
        });

        if (response.ok) {
          const updatedAgent = await response.json();
          setAgents((prev) =>
            prev.map((agent) => (agent.id === agentId ? updatedAgent : agent))
          );
          setSidebarAgents((prev) =>
            prev.map((agent) => (agent.id === agentId ? updatedAgent : agent))
          );
          // Update selected agent if it's the one being updated
          setSelectedAgent((prev) =>
            prev?.id === agentId ? updatedAgent : prev
          );
          // Refresh favorite agents in case the updated agent is in favorites
          await refreshFavoriteAgents();
          return updatedAgent;
        } else {
          console.error('Failed to update agent');
          return null;
        }
      } catch (error) {
        console.error('Error updating agent:', error);
        return null;
      }
    },
    [refreshFavoriteAgents]
  );

  const deleteAgent = useCallback(async (agentId: string): Promise<boolean> => {
    try {
      const response = await fetchClient(`/api/agents/${agentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove agent from all state arrays
        setAgents((prev) => prev.filter((agent) => agent.id !== agentId));
        setSidebarAgents((prev) =>
          prev.filter((agent) => agent.id !== agentId)
        );
        setFavoriteAgents((prev) =>
          prev.filter((agent) => agent.id !== agentId)
        );
        setHistoryAgents((prev) =>
          prev.filter((agent) => agent.id !== agentId)
        );

        // Clear selected agent if it's the one being deleted
        setSelectedAgent((prev) => (prev?.id === agentId ? null : prev));

        return true;
      } else {
        console.error('Failed to delete agent');
        return false;
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      return false;
    }
  }, []);

  const addToFavorites = useCallback(
    async (agentId: string): Promise<boolean> => {
      try {
        const response = await fetchClient('/api/agents/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ agent_id: agentId }),
        });

        if (response.ok) {
          await refreshFavoriteAgents();
          return true;
        } else {
          console.error('Failed to add to favorites');
          return false;
        }
      } catch (error) {
        console.error('Error adding to favorites:', error);
        return false;
      }
    },
    [refreshFavoriteAgents]
  );

  const removeFromFavorites = useCallback(
    async (agentId: string): Promise<boolean> => {
      try {
        const response = await fetchClient('/api/agents/favorites', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ agent_id: agentId }),
        });

        if (response.ok) {
          await refreshFavoriteAgents();
          return true;
        } else {
          console.error('Failed to remove from favorites');
          return false;
        }
      } catch (error) {
        console.error('Error removing from favorites:', error);
        return false;
      }
    },
    [refreshFavoriteAgents]
  );

  const loadMoreAgents = useCallback(
    async (params?: PaginationParams) => {
      if (!pagination?.hasNext || isLoading) return;

      try {
        const nextPage = pagination.page + 1;
        const searchParams = new URLSearchParams();

        searchParams.set('page', nextPage.toString());
        searchParams.set('limit', pagination.limit.toString());
        if (params?.search) searchParams.set('search', params.search);
        if (params?.tags) searchParams.set('tags', params.tags);
        if (params?.category) searchParams.set('category', params.category);

        const response = await fetchClient(
          `/api/agents?${searchParams.toString()}`
        );

        if (response.ok) {
          const data = await response.json();
          const newAgents = data.agents || [];

          // Filter out any agents that already exist to prevent duplicates
          setAgents((prev) => {
            const existingIds = new Set(prev.map((agent) => agent.id));
            const uniqueNewAgents = newAgents.filter(
              (agent: any) => !existingIds.has(agent.id)
            );
            return [...prev, ...uniqueNewAgents];
          });

          setPagination(data.pagination || null);
        }
      } catch (error) {
        console.error('Error loading more agents:', error);
      }
    },
    [pagination, isLoading]
  );

  const refreshSidebarAgents = useCallback(async () => {
    try {
      setIsSidebarLoading(true);
      const response = await fetchClient('/api/agents');

      if (response.ok) {
        const data = await response.json();
        setSidebarAgents(data.agents || []);
      } else {
        console.error('Failed to fetch sidebar agents');
        setSidebarAgents([]);
      }
    } catch (error) {
      console.error('Error fetching sidebar agents:', error);
      setSidebarAgents([]);
    } finally {
      setIsSidebarLoading(false);
    }
  }, []);

  const fetchPublicAgentCount = useCallback(async () => {
    try {
      const response = await fetchClient('/api/agents/count');
      if (response.ok) {
        const data = await response.json();
        setPublicAgentCount(data.count || 0);
      } else {
        console.error('Failed to fetch public agent count');
      }
    } catch (error) {
      console.error('Error fetching public agent count:', error);
    }
  }, []);

  const isFavorite = useCallback(
    (agentId: string): boolean => {
      return favoriteAgents.some((agent) => agent.id === agentId);
    },
    [favoriteAgents]
  );

  const addToHistory = useCallback(
    async (agentId: string): Promise<boolean> => {
      try {
        const response = await fetchClient('/api/agents/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ agent_id: agentId }),
        });

        if (response.ok) {
          await refreshHistoryAgents();
          return true;
        } else {
          console.error('Failed to add agent to history');
          return false;
        }
      } catch (error) {
        console.error('Error adding agent to history:', error);
        return false;
      }
    },
    [refreshHistoryAgents]
  );

  const removeFromHistory = useCallback(
    async (agentId: string): Promise<boolean> => {
      try {
        const response = await fetchClient(
          `/api/agents/history?agent_id=${agentId}`,
          {
            method: 'DELETE',
          }
        );

        if (response.ok) {
          await refreshHistoryAgents();
          return true;
        } else {
          console.error('Failed to remove agent from history');
          return false;
        }
      } catch (error) {
        console.error('Error removing agent from history:', error);
        return false;
      }
    },
    [refreshHistoryAgents]
  );

  const clearHistory = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetchClient('/api/agents/history', {
        method: 'DELETE',
      });

      if (response.ok) {
        await refreshHistoryAgents();
        return true;
      } else {
        console.error('Failed to clear agent history');
        return false;
      }
    } catch (error) {
      console.error('Error clearing agent history:', error);
      return false;
    }
  }, [refreshHistoryAgents]);

  useEffect(() => {
    refreshAgents();
    refreshSidebarAgents();
    refreshFavoriteAgents();
    refreshHistoryAgents();
    fetchPublicAgentCount();
  }, [
    refreshAgents,
    refreshSidebarAgents,
    refreshFavoriteAgents,
    refreshHistoryAgents,
    fetchPublicAgentCount,
  ]);

  const value: AgentContextType = {
    agents,
    sidebarAgents,
    favoriteAgents,
    historyAgents,
    isLoading,
    isSidebarLoading,
    isFavoritesLoading,
    isHistoryLoading,
    selectedAgent,
    publicAgentCount,
    pagination,
    setSelectedAgent,
    refreshAgents,
    refreshSidebarAgents,
    refreshFavoriteAgents,
    refreshHistoryAgents,
    loadMoreAgents,
    fetchPublicAgentCount,
    createAgent,
    updateAgent,
    deleteAgent,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
}
