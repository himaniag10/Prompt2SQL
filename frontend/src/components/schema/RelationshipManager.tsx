import React, { useState } from 'react';
import { SchemaVersion, SchemaApiService } from '@/services/schema.service';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Trash2, Link as LinkIcon, Plus, ArrowRight, GitMerge } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

interface RelationshipManagerProps {
  version: SchemaVersion;
  schemaId: string;
  projectId: string;
}

export const RelationshipManager: React.FC<RelationshipManagerProps> = ({ version, schemaId, projectId }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, watch } = useForm();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const sourceTableId = watch('sourceTableId');
  const targetTableId = watch('targetTableId');

  const tables = version?.tables || [];
  const relationships = version?.relationships || [];

  const sourceTable = tables.find(t => t.id === sourceTableId);
  const targetTable = tables.find(t => t.id === targetTableId);

  const createMutation = useMutation({
    mutationFn: (data: any) => SchemaApiService.createRelationship(schemaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
      reset();
      setIsFormOpen(false);
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

  const getTableName = (id: string) => tables.find(t => t.id === id)?.name || 'Unknown Table';
  const getColumnName = (tableId: string, colId: string) => 
    tables.find(t => t.id === tableId)?.columns?.find(c => c.id === colId)?.name || 'Unknown Column';

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border w-80 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
      <div className="p-4 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <LinkIcon className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-semibold text-text text-sm">Relationships</h2>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="p-1.5 hover:bg-surface rounded-md text-muted hover:text-primary transition-colors"
        >
          <Plus className={`w-4 h-4 transition-transform duration-300 ${isFormOpen ? 'rotate-45' : ''}`} />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <AnimatePresence>
          {isFormOpen && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onSubmit={handleSubmit(onSubmit)} 
              className="space-y-4 bg-background border border-primary/20 p-4 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-2">
                <GitMerge className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-semibold text-text">Create Relation</h3>
              </div>
              
              <div className="space-y-3">
                {/* Source */}
                <div className="space-y-2 p-3 bg-surface/50 rounded-lg border border-border/50">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Source</span>
                  <select required {...register('sourceTableId')} className="w-full bg-background border border-border rounded-md text-sm p-2 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                    <option value="">Select Table...</option>
                    {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  
                  <select required {...register('sourceColumnId')} disabled={!sourceTable} className="w-full bg-background border border-border rounded-md text-sm p-2 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50">
                    <option value="">Select Column...</option>
                    {sourceTable?.columns?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Type */}
                <select required {...register('relationshipType')} className="w-full bg-background border border-primary/30 rounded-md text-sm p-2 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                  <option value="ONE_TO_MANY">One to Many (1:N)</option>
                  <option value="ONE_TO_ONE">One to One (1:1)</option>
                  <option value="MANY_TO_ONE">Many to One (N:1)</option>
                  <option value="MANY_TO_MANY">Many to Many (N:M)</option>
                </select>

                {/* Target */}
                <div className="space-y-2 p-3 bg-surface/50 rounded-lg border border-border/50">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Target</span>
                  <select required {...register('targetTableId')} className="w-full bg-background border border-border rounded-md text-sm p-2 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                    <option value="">Select Table...</option>
                    {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  
                  <select required {...register('targetColumnId')} disabled={!targetTable} className="w-full bg-background border border-border rounded-md text-sm p-2 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50">
                    <option value="">Select Column...</option>
                    {targetTable?.columns?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={createMutation.isPending}
                className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm font-medium transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
              >
                {createMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add Relation
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Existing Relationships */}
        <div className="space-y-3">
          <AnimatePresence>
            {relationships.map((rel, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                key={rel.id} 
                className="bg-background border border-border/80 p-3 rounded-xl text-sm group hover:border-primary/50 transition-colors shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full tracking-wide">
                    {rel.relationshipType.replace(/_/g, ' ')}
                  </span>
                  <button 
                    onClick={() => deleteMutation.mutate(rel.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-500 hover:bg-red-400/10 rounded-md transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 bg-surface p-2 rounded-lg border border-border/50 truncate">
                    <span className="font-semibold text-text block truncate">{getTableName(rel.sourceTableId)}</span>
                    <span className="text-muted block truncate">{getColumnName(rel.sourceTableId, rel.sourceColumnId)}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted shrink-0" />
                  <div className="flex-1 bg-surface p-2 rounded-lg border border-border/50 truncate">
                    <span className="font-semibold text-text block truncate">{getTableName(rel.targetTableId)}</span>
                    <span className="text-muted block truncate">{getColumnName(rel.targetTableId, rel.targetColumnId)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {relationships.length === 0 && !isFormOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/80 rounded-xl bg-surface/30"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <LinkIcon className="w-5 h-5 text-primary/60" />
              </div>
              <p className="text-sm font-medium text-text mb-1">No Relationships</p>
              <p className="text-xs text-muted mb-4">Link your tables to define schema relations.</p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Create First Relation
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
