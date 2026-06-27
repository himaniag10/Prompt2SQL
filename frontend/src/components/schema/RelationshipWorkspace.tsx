import React, { useState } from 'react';
import { SchemaVersion, SchemaApiService } from '@/services/schema.service';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Trash2, Link as LinkIcon, Plus, ArrowRight, GitMerge, Database } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '@/components/common/EmptyState';
interface RelationshipWorkspaceProps {
  version: SchemaVersion;
  schemaId: string;
  projectId: string;
}

export const RelationshipWorkspace: React.FC<RelationshipWorkspaceProps> = ({ version, schemaId, projectId }) => {
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
      queryClient.invalidateQueries({ queryKey: ['schema', schemaId] });
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      reset();
      setIsFormOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: SchemaApiService.deleteRelationship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schema', schemaId] });
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  const getTableName = (id: string) => tables.find(t => t.id === id)?.name || 'Unknown Table';
  const getColumnName = (tableId: string, colId: string) => 
    tables.find(t => t.id === tableId)?.columns?.find(c => c.id === colId)?.name || 'Unknown Column';

  return (
    <div className="flex flex-col gap-6 lg:flex-row pb-12 items-start">
      
      {/* Left Column: Builder */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="bg-white border border-border/80 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl">
              <GitMerge className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-text">Relationship Builder</h2>
              <p className="text-xs text-muted">Create a new foreign key constraint</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Source Table Selection */}
            <div className="space-y-3 p-4 bg-surface/50 rounded-xl border border-border/50">
              <span className="text-[10px] uppercase font-bold text-muted tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> Source Table
              </span>
              <div className="space-y-2">
                <select required {...register('sourceTableId')} className="w-full bg-background border border-border rounded-lg text-sm p-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm">
                  <option value="">Select Table...</option>
                  {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select required {...register('sourceColumnId')} disabled={!sourceTable} className="w-full bg-background border border-border rounded-lg text-sm p-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm disabled:opacity-50">
                  <option value="">Select Foreign Key Column...</option>
                  {sourceTable?.columns?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Relationship Type */}
            <div className="space-y-2 px-1">
              <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Constraint Type</span>
              <select required {...register('relationshipType')} className="w-full bg-background border border-primary/30 rounded-lg text-sm p-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm">
                <option value="MANY_TO_ONE">Many to One (N:1) - Default</option>
                <option value="ONE_TO_MANY">One to Many (1:N)</option>
                <option value="ONE_TO_ONE">One to One (1:1)</option>
                <option value="MANY_TO_MANY">Many to Many (N:M)</option>
              </select>
            </div>

            {/* Target Table Selection */}
            <div className="space-y-3 p-4 bg-surface/50 rounded-xl border border-border/50">
              <span className="text-[10px] uppercase font-bold text-muted tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> Target Table
              </span>
              <div className="space-y-2">
                <select required {...register('targetTableId')} className="w-full bg-background border border-border rounded-lg text-sm p-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm">
                  <option value="">Select Referenced Table...</option>
                  {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select required {...register('targetColumnId')} disabled={!targetTable} className="w-full bg-background border border-border rounded-lg text-sm p-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm disabled:opacity-50">
                  <option value="">Select Primary Key Column...</option>
                  {targetTable?.columns?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={createMutation.isPending}
              className="w-full py-3 bg-[#591C26] hover:bg-[#4A161E] text-white rounded-xl text-sm font-medium transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
            >
              {createMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LinkIcon className="w-4 h-4" /> Create Relationship
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Cards */}
      <div className="w-full lg:w-2/3 space-y-4">
        
        {relationships.length === 0 ? (
          <EmptyState 
            className="border border-dashed border-border/80 rounded-3xl bg-white h-full min-h-[400px]"
            icon={<LinkIcon className="w-10 h-10 text-primary/60" />}
            title="No Relationships Created"
            description="Use the builder on the left to define foreign key constraints between your tables."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {relationships.map((rel, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  key={rel.id} 
                  className="bg-white border border-border/80 p-5 rounded-2xl group hover:border-[#591C26]/40 transition-colors shadow-sm hover:shadow-md flex flex-col h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#591C26]/5 to-[#591C26]/20" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-xs font-bold text-[#591C26] bg-[#591C26]/10 border border-[#591C26]/20 px-3 py-1.5 rounded-full tracking-wide">
                      {rel.relationshipType.replace(/_/g, ' ')}
                    </span>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this relationship?')) {
                          deleteMutation.mutate(rel.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-500 hover:bg-red-400/10 rounded-md transition-all border border-transparent hover:border-red-400/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-3 flex-1 justify-end">
                    
                    <div className="bg-surface/60 p-3 rounded-xl border border-border flex items-center justify-between">
                      <div className="flex flex-col truncate pr-2">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Source</span>
                        <span className="font-semibold text-text truncate">{getTableName(rel.sourceTableId)}</span>
                      </div>
                      <div className="shrink-0 bg-white border border-border rounded shadow-sm px-2 py-1 text-xs text-muted font-mono">
                        {getColumnName(rel.sourceTableId, rel.sourceColumnId)}
                      </div>
                    </div>

                    <div className="flex justify-center -my-1 relative z-10">
                      <div className="w-8 h-8 rounded-full bg-white border border-border shadow-sm flex items-center justify-center text-muted">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                    
                    <div className="bg-[#591C26]/5 p-3 rounded-xl border border-[#591C26]/20 flex items-center justify-between">
                      <div className="flex flex-col truncate pr-2">
                        <span className="text-[10px] font-bold text-[#591C26]/70 uppercase tracking-wider mb-0.5">Target</span>
                        <span className="font-semibold text-[#591C26] truncate">{getTableName(rel.targetTableId)}</span>
                      </div>
                      <div className="shrink-0 bg-white border border-[#591C26]/20 rounded shadow-sm px-2 py-1 text-xs text-[#591C26] font-mono">
                        {getColumnName(rel.targetTableId, rel.targetColumnId)}
                      </div>
                    </div>

                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
};
