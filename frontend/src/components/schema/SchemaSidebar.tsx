import React, { useState } from 'react';
import { Database, Plus, Trash2, Edit2, X } from 'lucide-react';
import { DatabaseSchema, SchemaApiService } from '@/services/schema.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';

interface SchemaSidebarProps {
  projectId: string;
  schemas: DatabaseSchema[];
  activeSchemaId: string | null;
  onSelectSchema: (id: string) => void;
}

export const SchemaSidebar: React.FC<SchemaSidebarProps> = ({ projectId, schemas, activeSchemaId, onSelectSchema }) => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newSchemaName, setNewSchemaName] = useState('');

  const createMutation = useMutation({
    mutationFn: (name: string) => SchemaApiService.createSchema(projectId, { name }),
    onSuccess: (newSchema) => {
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
      setIsCreating(false);
      setNewSchemaName('');
      onSelectSchema(newSchema.id);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: SchemaApiService.deleteSchema,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSchemaName.trim()) {
      createMutation.mutate(newSchemaName.trim());
    }
  };

  return (
    <div className="w-64 border-r border-border bg-surface/50 h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text uppercase tracking-wider">Schemas</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="p-1 text-muted hover:text-primary transition-colors rounded-md hover:bg-primary/10"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isCreating && (
          <form onSubmit={handleCreate} className="mb-2 p-2 bg-background rounded-lg border border-primary/30 flex items-center gap-2">
            <Database className="w-4 h-4 text-primary shrink-0" />
            <input
              autoFocus
              type="text"
              value={newSchemaName}
              onChange={(e) => setNewSchemaName(e.target.value)}
              placeholder="Schema name"
              className="bg-transparent border-none focus:outline-none text-sm text-text w-full"
              onBlur={() => !newSchemaName && setIsCreating(false)}
            />
          </form>
        )}

        {schemas.map((schema) => (
          <div
            key={schema.id}
            onClick={() => onSelectSchema(schema.id)}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors group ${
              activeSchemaId === schema.id 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'text-muted hover:bg-background border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Database className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium truncate">{schema.name}</span>
            </div>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this schema?')) {
                    deleteMutation.mutate(schema.id);
                  }
                }}
                className="p-1 text-red-400 hover:text-red-500 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {!isCreating && schemas.length === 0 && (
          <div className="text-center p-4 text-xs text-muted">
            No schemas. Click + to create one.
          </div>
        )}
      </div>
    </div>
  );
};
