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
import { Plus, Edit, Trash2, Save, X, RefreshCw } from 'lucide-react';
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
    </div>
  );
}
