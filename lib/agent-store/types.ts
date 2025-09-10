export interface Agent {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string | null;
  model: string | null;
  avatar_url: string | null;
  is_public: boolean | null;
  user_id: string;
  category_id: string | null;
  category?: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    sort_order: number;
  } | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string;
  category?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AgentContextType {
  agents: Agent[];
  sidebarAgents: Agent[];
  favoriteAgents: Agent[];
  historyAgents: Agent[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isSidebarLoading: boolean;
  isFavoritesLoading: boolean;
  isHistoryLoading: boolean;
  selectedAgent: Agent | null;
  publicAgentCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  setSelectedAgent: (agent: Agent | null) => void;
  refreshAgents: (params?: PaginationParams) => Promise<void>;
  refreshSidebarAgents: () => Promise<void>;
  refreshFavoriteAgents: () => Promise<void>;
  refreshHistoryAgents: () => Promise<void>;
  loadMoreAgents: (params?: PaginationParams) => Promise<void>;
  fetchPublicAgentCount: () => Promise<void>;
  createAgent: (
    agent: Omit<Agent, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => Promise<Agent | null>;
  updateAgent: (
    agentId: string,
    agent: Omit<Agent, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => Promise<Agent | null>;
  deleteAgent: (agentId: string) => Promise<boolean>;
  addToFavorites: (agentId: string) => Promise<boolean>;
  removeFromFavorites: (agentId: string) => Promise<boolean>;
  isFavorite: (agentId: string) => boolean;
  addToHistory: (agentId: string) => Promise<boolean>;
  removeFromHistory: (agentId: string) => Promise<boolean>;
  clearHistory: () => Promise<boolean>;
  showMyAgentsOnly: boolean;
  setShowMyAgentsOnly: (show: boolean) => void;
  showSavedAgentsOnly: boolean;
  setShowSavedAgentsOnly: (show: boolean) => void;
  toggleSave: (agentId: string) => Promise<boolean>;
}
