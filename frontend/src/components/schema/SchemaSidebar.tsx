import React, { useState } from 'react';
import { Database, Plus, Trash2, Search, Calendar, LayoutGrid } from 'lucide-react';
import { DatabaseSchema, SchemaApiService } from '@/services/schema.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredSchemas = schemas.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="w-80 border-r border-border/80 bg-surface/50 h-full flex flex-col">
      <div className="p-5 pb-3">
        <h2 className="text-sm font-bold text-text mb-4 tracking-wide">Schemas</h2>
        <div className="relative">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search schemas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border/60 rounded-lg pl-9 pr-3 py-2 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <AnimatePresence>
          {isCreating && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleCreate} 
              className="p-3 bg-background rounded-xl border border-primary/40 shadow-md flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-primary shrink-0" />
              <input
                autoFocus
                type="text"
                value={newSchemaName}
                onChange={(e) => setNewSchemaName(e.target.value)}
                placeholder="Schema name..."
                className="bg-transparent border-none focus:outline-none text-sm font-medium text-text w-full"
                onBlur={() => !newSchemaName && setIsCreating(false)}
              />
            </motion.form>
          )}

          {filteredSchemas.map((schema) => {
            const isActive = activeSchemaId === schema.id;
            const tableCount = schema.versions?.[0]?.tables?.length || 0;
            const versionNum = schema.versions?.[0]?.versionNumber || 1;

            return (
              <motion.div
                layout
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                key={schema.id}
                onClick={() => onSelectSchema(schema.id)}
                className={clsx(
                  "p-3 rounded-xl cursor-pointer transition-all group border shadow-sm relative overflow-hidden",
                  isActive 
                    ? "bg-primary/5 border-primary/30 shadow-primary/5" 
                    : "bg-background border-border/50 hover:border-border hover:shadow-md"
                )}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Database className={clsx("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted")} />
                    <span className={clsx("text-sm font-semibold truncate", isActive ? "text-text" : "text-text/80")}>{schema.name}</span>
                  </div>
                  <span className={clsx(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full border",
                    isActive ? "bg-primary/10 text-primary border-primary/20" : "bg-surface text-muted border-border"
                  )}>
                    v{versionNum}
                  </span>
                </div>

                <div className="flex flex-col gap-1 ml-6 text-xs text-muted">
                  <div className="flex items-center gap-1.5">
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>{tableCount} {tableCount === 1 ? 'table' : 'tables'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Updated {formatDate(schema.updatedAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="absolute right-2 bottom-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this schema?')) {
                        deleteMutation.mutate(schema.id);
                      }
                    }}
                    className="p-1.5 bg-background border border-border/50 text-red-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 rounded-md transition-all shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!isCreating && filteredSchemas.length === 0 && (
          <div className="text-center p-6 border border-dashed border-border/80 rounded-xl bg-surface/30 flex flex-col items-center">
            <Database className="w-8 h-8 text-muted/50 mb-2" />
            <span className="text-sm font-medium text-text/80">No schemas found</span>
            <span className="text-xs text-muted mt-1">Create one to get started.</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border/50 bg-surface/80 backdrop-blur">
        <button
          onClick={() => setIsCreating(true)}
          className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-xl border border-dashed border-primary/30 hover:border-primary/60 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Schema
        </button>
      </div>
    </div>
  );
};
