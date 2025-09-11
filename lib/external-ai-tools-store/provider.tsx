'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  ExternalAITool,
  ExternalAIToolsContextType,
  PaginationParams,
} from './types';

const ExternalAIToolsContext = createContext<
  ExternalAIToolsContextType | undefined
>(undefined);

export function ExternalAIToolsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tools, setTools] = useState<ExternalAITool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyToolsOnly, setShowMyToolsOnly] = useState(false);

  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);

  const refreshTools = useCallback(async (params?: PaginationParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();

      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);
      if (params?.tags) searchParams.set('tags', params.tags);
      if (params?.category) searchParams.set('category', params.category);

      const response = await fetch(`/api/external-ai-tools?${searchParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch external AI tools');
      }

      const data = await response.json();

      // Always replace tools for refresh (page 1 or no page specified)
      setTools(data.tools || []);
      setPagination(
        data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTools = useCallback(
    async (params?: PaginationParams) => {
      // For backward compatibility, use refreshTools
      return refreshTools(params);
    },
    [refreshTools]
  );

  const createTool = useCallback(
    async (
      toolData: Omit<
        ExternalAITool,
        'id' | 'user_id' | 'created_at' | 'updated_at'
      >,
      logoFile?: File | null
    ): Promise<ExternalAITool | null> => {
      try {
        let response: Response;

        if (logoFile) {
          // Use FormData for file upload
          const formData = new FormData();
          formData.append('name', toolData.name);
          formData.append('description', toolData.description || '');
          formData.append('website', toolData.website);
          formData.append('video_url', toolData.video_url || '');
          formData.append('category_id', toolData.category_id);
          formData.append('featured', toolData.featured ? 'true' : 'false');
          formData.append('logo', logoFile);

          response = await fetch('/api/external-ai-tools', {
            method: 'POST',
            body: formData,
          });
        } else {
          // Use JSON for regular data
          response = await fetch('/api/external-ai-tools', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(toolData),
          });
        }

        if (!response.ok) {
          throw new Error('Failed to create external AI tool');
        }

        const data = await response.json();
        const newTool = data.tool;

        setTools((prev) => [newTool, ...prev]);
        setPagination((prev) =>
          prev ? { ...prev, total: prev.total + 1 } : null
        );

        return newTool;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      }
    },
    []
  );

  const updateTool = useCallback(
    async (
      id: string,
      toolData: Partial<
        Omit<ExternalAITool, 'id' | 'user_id' | 'created_at' | 'updated_at'>
      >,
      logoFile?: File | null
    ): Promise<ExternalAITool | null> => {
      try {
        let response: Response;

        if (logoFile) {
          // Use FormData for file upload
          const formData = new FormData();
          if (toolData.name) formData.append('name', toolData.name);
          if (toolData.description !== undefined)
            formData.append('description', toolData.description || '');
          if (toolData.website) formData.append('website', toolData.website);
          if (toolData.video_url !== undefined)
            formData.append('video_url', toolData.video_url || '');
          if (toolData.category_id)
            formData.append('category_id', toolData.category_id);
          if (toolData.featured !== undefined)
            formData.append('featured', toolData.featured ? 'true' : 'false');
          formData.append('logo', logoFile);

          response = await fetch(`/api/external-ai-tools/${id}`, {
            method: 'PUT',
            body: formData,
          });
        } else {
          // Use JSON for regular data
          response = await fetch(`/api/external-ai-tools/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(toolData),
          });
        }

        if (!response.ok) {
          throw new Error('Failed to update external AI tool');
        }

        const data = await response.json();
        const updatedTool = data.tool;

        setTools((prev) =>
          prev.map((tool) => (tool.id === id ? updatedTool : tool))
        );

        return updatedTool;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      }
    },
    []
  );

  const deleteTool = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/external-ai-tools/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete external AI tool');
      }

      setTools((prev) => prev.filter((tool) => tool.id !== id));
      setPagination((prev) =>
        prev ? { ...prev, total: prev.total - 1 } : null
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, []);

  const loadMoreTools = useCallback(
    async (params?: PaginationParams) => {
      if (!pagination?.hasNext || isLoading || isLoadingMore) return;

      setIsLoadingMore(true);
      try {
        const nextPage = pagination.page + 1;
        const searchParams = new URLSearchParams();

        searchParams.set('page', nextPage.toString());
        searchParams.set('limit', pagination.limit.toString());
        if (params?.search) searchParams.set('search', params.search);
        if (params?.tags) searchParams.set('tags', params.tags);
        if (params?.category) searchParams.set('category', params.category);

        const response = await fetch(`/api/external-ai-tools?${searchParams}`);

        if (!response.ok) {
          throw new Error('Failed to fetch more external AI tools');
        }

        const data = await response.json();
        const newTools = data.tools || [];

        // Filter out any tools that already exist to prevent duplicates
        setTools((prev) => {
          const existingIds = new Set(prev.map((tool) => tool.id));
          const uniqueNewTools = newTools.filter(
            (tool: any) => !existingIds.has(tool.id)
          );
          return [...prev, ...uniqueNewTools];
        });

        setPagination(data.pagination || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoadingMore(false);
      }
    },
    [pagination, isLoading, isLoadingMore]
  );

  const loadMore = useCallback(async () => {
    // For backward compatibility, use loadMoreTools
    return loadMoreTools();
  }, [loadMoreTools]);

  const value: ExternalAIToolsContextType = {
    tools,
    isLoading,
    isLoadingMore,
    error,
    pagination,
    fetchTools,
    refreshTools,
    loadMoreTools,
    createTool,
    updateTool,
    deleteTool,
    loadMore,
    searchQuery,
    setSearchQuery,
    showMyToolsOnly,
    setShowMyToolsOnly,
  };

  return (
    <ExternalAIToolsContext.Provider value={value}>
      {children}
    </ExternalAIToolsContext.Provider>
  );
}

export function useExternalAITools() {
  const context = useContext(ExternalAIToolsContext);
  if (context === undefined) {
    throw new Error(
      'useExternalAITools must be used within an ExternalAIToolsProvider'
    );
  }
  return context;
}
