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
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchTools = useCallback(async (params?: PaginationParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();

      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);

      if (params?.tags) searchParams.set('tags', params.tags);

      const response = await fetch(`/api/external-ai-tools?${searchParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch external AI tools');
      }

      const data = await response.json();

      if (params?.page === 1 || !params?.page) {
        setTools(data.tools || []);
      } else {
        setTools((prev) => [...prev, ...(data.tools || [])]);
      }

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
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));

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
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (pagination.hasNext && !isLoading) {
      await fetchTools({
        page: pagination.page + 1,
        limit: pagination.limit,
        search: searchQuery,
      });
    }
  }, [pagination, isLoading, fetchTools, searchQuery]);

  const value: ExternalAIToolsContextType = {
    tools,
    isLoading,
    error,
    pagination,
    fetchTools,
    createTool,
    updateTool,
    deleteTool,
    loadMore,
    searchQuery,
    setSearchQuery,
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
