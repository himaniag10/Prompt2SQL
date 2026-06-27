import React from 'react';
import { SchemaVersion, SchemaApiService } from '@/services/schema.service';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Trash2, Link as LinkIcon, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface RelationshipManagerProps {
  version: SchemaVersion;
  schemaId: string;
  projectId: string;
}

export const RelationshipManager: React.FC<RelationshipManagerProps> = ({ version, schemaId, projectId }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const createMutation = useMutation({
    mutationFn: (data: any) => SchemaApiService.createRelationship(schemaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: SchemaApiService.deleteRelationship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
    }
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  const getTableName = (id: string) => version.tables.find(t => t.id === id)?.name;
  const getColumnName = (tableId: string, colId: string) => 
    version.tables.find(t => t.id === tableId)?.columns.find(c => c.id === colId)?.name;

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border w-80">
      <div className="p-4 border-b border-border bg-background/50 flex items-center gap-2">
        <LinkIcon className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-text">Relationships</h2>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* New Relationship Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 bg-background border border-border p-3 rounded-lg shadow-sm">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">New Relation</h3>
          
          <select {...register('sourceTableId')} className="w-full bg-surface border border-border rounded text-sm p-1.5 text-text focus:border-primary focus:outline-none">
            <option value="">Source Table...</option>
            {version.tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          {/* Just simple text inputs for columns for now to save space, ideally these would be dynamic dependent dropdowns */}
          <input {...register('sourceColumnId')} placeholder="Source Column ID (Dev mode)" className="w-full bg-surface border border-border rounded text-sm p-1.5 text-text" />
          
          <select {...register('relationshipType')} className="w-full bg-surface border border-border rounded text-sm p-1.5 text-text focus:border-primary focus:outline-none">
            <option value="ONE_TO_MANY">One to Many (1:N)</option>
            <option value="ONE_TO_ONE">One to One (1:1)</option>
            <option value="MANY_TO_ONE">Many to One (N:1)</option>
            <option value="MANY_TO_MANY">Many to Many (N:M)</option>
          </select>

          <select {...register('targetTableId')} className="w-full bg-surface border border-border rounded text-sm p-1.5 text-text focus:border-primary focus:outline-none">
            <option value="">Target Table...</option>
            {version.tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <input {...register('targetColumnId')} placeholder="Target Column ID (Dev mode)" className="w-full bg-surface border border-border rounded text-sm p-1.5 text-text" />
          
          <button type="submit" className="w-full py-1.5 bg-primary hover:bg-primary-dark text-white rounded text-sm font-medium transition-colors flex items-center justify-center gap-1">
            <Plus className="w-4 h-4" /> Add Relation
          </button>
        </form>

        <hr className="border-border/50" />

        {/* Existing Relationships */}
        <div className="space-y-2">
          {version.relationships?.map(rel => (
            <div key={rel.id} className="bg-background border border-border/60 p-2.5 rounded-lg text-sm group">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">{rel.relationshipType}</span>
                <button 
                  onClick={() => deleteMutation.mutate(rel.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-red-400 hover:text-red-500 rounded transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-text break-words">
                <span className="font-semibold">{getTableName(rel.sourceTableId)}</span>.{getColumnName(rel.sourceTableId, rel.sourceColumnId)} 
                <span className="text-muted mx-1">→</span> 
                <span className="font-semibold">{getTableName(rel.targetTableId)}</span>.{getColumnName(rel.targetTableId, rel.targetColumnId)}
              </div>
            </div>
          ))}
          
          {(!version.relationships || version.relationships.length === 0) && (
            <div className="text-center text-xs text-muted p-4">
              No relationships defined yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
