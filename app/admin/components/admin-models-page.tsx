'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
  Search,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface Model {
  id: string;
  name: string;
  display_name: string;
  provider_id: string;
  provider_name: string;
  model_id: string;
  context_length: number | null;
  max_tokens: number | null;
  is_enabled: boolean;
  is_free: boolean;
  requires_api_key: boolean;
  capabilities: string[];
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface SearchResult {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  is_free: boolean;
  capabilities: string[];
  provider: string;
}

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'google', name: 'Google' },
  { id: 'mistral', name: 'Mistral' },
  { id: 'deepseek', name: 'DeepSeek' },
  { id: 'grok', name: 'Grok' },
  { id: 'perplexity', name: 'Perplexity' },
  { id: 'ollama', name: 'Ollama' },
];

const CAPABILITIES = ['chat', 'vision', 'function_calling', 'code_generation'];

export function AdminModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Model>>({});

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [addingModel, setAddingModel] = useState<string | null>(null);

  // Sync confirmation state
  const [syncPreview, setSyncPreview] = useState<any>(null);
  const [isSyncConfirmDialogOpen, setIsSyncConfirmDialogOpen] = useState(false);
  const [isApplyingSync, setIsApplyingSync] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchModels(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const fetchModels = async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/models?page=${page}&pageSize=${size}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const data = await response.json();
      setModels(data.models || data);
      setTotalCount(data.totalCount || data.length);
      setTotalPages(Math.ceil((data.totalCount || data.length) / size));
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('Failed to fetch models');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = editingModel
        ? `/api/admin/models/${editingModel.id}`
        : '/api/admin/models';

      const method = editingModel ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingModel ? 'Model updated' : 'Model created');
        setIsDialogOpen(false);
        setEditingModel(null);
        setFormData({});
        fetchModels();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save model');
      }
    } catch (error) {
      toast.error('Error saving model');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    try {
      const response = await fetch(`/api/admin/models/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Model deleted');
        fetchModels();
      } else {
        toast.error('Failed to delete model');
      }
    } catch (error) {
      toast.error('Error deleting model');
    }
  };

  const handleSyncOpenRouter = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/sync-openrouter-models', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        const { result } = data;

        // Show preview dialog instead of applying immediately
        setSyncPreview(result);
        setIsSyncConfirmDialogOpen(true);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to sync OpenRouter models');
      }
    } catch (error) {
      toast.error('Error syncing OpenRouter models');
    } finally {
      setSyncing(false);
    }
  };

  const handleApplySync = async () => {
    setIsApplyingSync(true);
    try {
      const response = await fetch('/api/admin/sync-openrouter-models', {
        method: 'PUT',
      });

      if (response.ok) {
        const data = await response.json();
        const { result } = data;

        toast.success(
          `Sync completed! ${result.new_models} new models added, ${result.updated_models} updated. ${result.free_models} free models found out of ${result.total_fetched} total.`
        );

        if (result.errors.length > 0) {
          console.warn('Sync errors:', result.errors);
          toast.warning(
            `${result.errors.length} errors occurred during sync. Check console for details.`
          );
        }

        fetchModels();
        setIsSyncConfirmDialogOpen(false);
        setSyncPreview(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to apply sync changes');
      }
    } catch (error) {
      toast.error('Error applying sync changes');
    } finally {
      setIsApplyingSync(false);
    }
  };

  const handleSearchOpenRouter = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/admin/search-openrouter-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchQuery: searchQuery.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
        setIsSearchDialogOpen(true);

        if (data.results.length === 0) {
          toast.info('No models found matching your search');
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to search OpenRouter models');
      }
    } catch (error) {
      toast.error('Error searching OpenRouter models');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddModel = async (model: SearchResult) => {
    setAddingModel(model.id);
    try {
      const response = await fetch('/api/admin/search-openrouter-models', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: model.id,
          modelName: model.name,
          description: model.description,
          contextLength: model.context_length,
          pricing: model.pricing,
          capabilities: model.capabilities,
          provider: model.provider,
        }),
      });

      if (response.ok) {
        toast.success(`Model "${model.name}" added successfully`);
        fetchModels(); // Refresh the models list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add model');
      }
    } catch (error) {
      toast.error('Error adding model');
    } finally {
      setAddingModel(null);
    }
  };

  const openEditDialog = (model?: Model) => {
    if (model) {
      setEditingModel(model);
      setFormData(model);
    } else {
      setEditingModel(null);
      setFormData({
        is_enabled: true,
        is_free: false,
        requires_api_key: true,
        capabilities: ['chat'],
        sort_order: 0,
      });
    }
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading models...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">AI Models</h2>
        <div className="flex gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="Search OpenRouter models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearchOpenRouter();
                }
              }}
              className="w-64"
            />
            <Button
              variant="outline"
              onClick={handleSearchOpenRouter}
              disabled={isSearching}
            >
              <Search
                className={`w-4 h-4 mr-2 ${isSearching ? 'animate-spin' : ''}`}
              />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={handleSyncOpenRouter}
            disabled={syncing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`}
            />
            {syncing ? 'Syncing...' : 'Sync OpenRouter'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openEditDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Model
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingModel ? 'Edit Model' : 'Add New Model'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="gpt-4o"
                    />
                  </div>
                  <div>
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_name: e.target.value,
                        })
                      }
                      placeholder="GPT-4o"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="provider_id">Provider</Label>
                    <Select
                      value={formData.provider_id || ''}
                      onValueChange={(value) => {
                        const provider = PROVIDERS.find((p) => p.id === value);
                        setFormData({
                          ...formData,
                          provider_id: value,
                          provider_name: provider?.name || '',
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDERS.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="model_id">Model ID</Label>
                    <Input
                      id="model_id"
                      value={formData.model_id || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, model_id: e.target.value })
                      }
                      placeholder="gpt-4o"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="context_length">Context Length</Label>
                    <Input
                      id="context_length"
                      type="number"
                      value={formData.context_length || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          context_length: parseInt(e.target.value) || null,
                        })
                      }
                      placeholder="128000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_tokens">Max Tokens</Label>
                    <Input
                      id="max_tokens"
                      type="number"
                      value={formData.max_tokens || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_tokens: parseInt(e.target.value) || null,
                        })
                      }
                      placeholder="4096"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Model description..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_enabled"
                      checked={formData.is_enabled || false}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_enabled: checked })
                      }
                    />
                    <Label htmlFor="is_enabled">Enabled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_free"
                      checked={formData.is_free || false}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_free: checked })
                      }
                    />
                    <Label htmlFor="is_free">Free</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requires_api_key"
                      checked={formData.requires_api_key !== false}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, requires_api_key: checked })
                      }
                    />
                    <Label htmlFor="requires_api_key">Requires API Key</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sort_order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Context</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((model) => (
              <TableRow key={model.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{model.display_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {model.name}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{model.provider_name}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={model.is_enabled ? 'default' : 'secondary'}>
                    {model.is_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={model.is_free ? 'secondary' : 'default'}>
                    {model.is_free ? 'Free' : 'Premium'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {model.context_length
                    ? model.context_length.toLocaleString()
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(model)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(model.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          className="mt-4"
        />
      )}

      {/* Search Results Dialog */}
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg">
              Search Results - OpenRouter Models
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {searchResults.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No models found matching your search.
              </div>
            ) : (
              <div className="space-y-1">
                {searchResults.map((model) => (
                  <div
                    key={model.id}
                    className="border rounded-md p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Left side - Model info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className="font-medium truncate max-w-[300px]">
                            {model.name}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {model.provider}
                            </Badge>
                            <Badge
                              variant={model.is_free ? 'secondary' : 'default'}
                              className="text-xs"
                            >
                              {model.is_free ? 'Free' : 'Premium'}
                            </Badge>
                            {model.context_length && (
                              <Badge variant="outline" className="text-xs">
                                {model.context_length > 1000
                                  ? `${Math.round(model.context_length / 1000)}k`
                                  : model.context_length.toLocaleString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground truncate mb-1">
                          {model.id}
                        </div>
                        {model.description && (
                          <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {model.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex gap-1 flex-wrap">
                            {model.capabilities.map((capability) => (
                              <Badge
                                key={capability}
                                variant="outline"
                                className="text-xs px-1.5 py-0.5"
                              >
                                {capability}
                              </Badge>
                            ))}
                          </div>
                          {model.pricing && (
                            <div className="text-xs text-muted-foreground">
                              ${model.pricing.prompt}/$
                              {model.pricing.completion}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side - Add button */}
                      <div className="flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleAddModel(model)}
                          disabled={addingModel === model.id}
                          className="h-8 px-3"
                        >
                          {addingModel === model.id ? (
                            <>
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sync Confirmation Dialog */}
      <Dialog
        open={isSyncConfirmDialogOpen}
        onOpenChange={setIsSyncConfirmDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Sync Changes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {syncPreview && (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Review the changes that will be made to your models:
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">New Models</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {syncPreview.new_models}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">Updated Models</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {syncPreview.updated_models}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <div>
                    Total free models found:{' '}
                    <span className="font-medium">
                      {syncPreview.free_models}
                    </span>
                  </div>
                  <div>
                    Total models fetched:{' '}
                    <span className="font-medium">
                      {syncPreview.total_fetched}
                    </span>
                  </div>
                </div>

                {syncPreview.errors && syncPreview.errors.length > 0 && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="text-sm font-medium text-destructive mb-2">
                      {syncPreview.errors.length} errors occurred:
                    </div>
                    <div className="text-xs text-destructive space-y-1">
                      {syncPreview.errors
                        .slice(0, 3)
                        .map((error: string, index: number) => (
                          <div key={index}>• {error}</div>
                        ))}
                      {syncPreview.errors.length > 3 && (
                        <div>
                          • ... and {syncPreview.errors.length - 3} more errors
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-sm text-amber-800">
                    <strong>Note:</strong> All new models will be added as{' '}
                    <strong>disabled</strong> by default. You can enable them
                    individually after the sync is complete.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsSyncConfirmDialogOpen(false)}
              disabled={isApplyingSync}
            >
              Cancel
            </Button>
            <Button onClick={handleApplySync} disabled={isApplyingSync}>
              {isApplyingSync ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Applying Changes...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Apply Sync
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
