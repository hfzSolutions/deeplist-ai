export interface ExternalAITool {
  id: string;
  name: string;
  description: string;
  website: string;
  logo?: string;
  video_url?: string;
  category_id: string;
  category?: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    sort_order: number;
    is_active: boolean;
  };
  featured?: boolean;
  pricing?: 'free' | 'paid' | 'freemium' | null;
  user_id: string;
  created_at: string;
  updated_at: string;
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

export interface ExternalAIToolsContextType {
  tools: ExternalAITool[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  fetchTools: (params?: PaginationParams) => Promise<void>;
  refreshTools: (params?: PaginationParams) => Promise<void>;
  loadMoreTools: (params?: PaginationParams) => Promise<void>;
  createTool: (
    tool: Omit<ExternalAITool, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    logoFile?: File | null
  ) => Promise<ExternalAITool | null>;
  updateTool: (
    id: string,
    tool: Partial<
      Omit<ExternalAITool, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    >,
    logoFile?: File | null
  ) => Promise<ExternalAITool | null>;
  deleteTool: (id: string) => Promise<boolean>;
  loadMore: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showMyToolsOnly: boolean;
  setShowMyToolsOnly: (show: boolean) => void;
}
