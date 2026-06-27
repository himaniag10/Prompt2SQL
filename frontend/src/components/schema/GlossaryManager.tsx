import React, { useState } from 'react';
import { SchemaVersion, SchemaApiService } from '@/services/schema.service';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Trash2, Book, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface GlossaryManagerProps {
  version: SchemaVersion;
  schemaId: string;
  projectId: string;
}

export const GlossaryManager: React.FC<GlossaryManagerProps> = ({ version, schemaId, projectId }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const createMutation = useMutation({
    mutationFn: (data: { term: string; definition: string; example?: string }) => SchemaApiService.createGlossaryTerm(schemaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: SchemaApiService.deleteGlossaryTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
    }
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border w-80">
      <div className="p-4 border-b border-border bg-background/50 flex items-center gap-2">
        <Book className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-text">Business Glossary</h2>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* New Term Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 bg-background border border-border p-3 rounded-lg shadow-sm">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">New Term</h3>
          
          <input 
            {...register('term', { required: true })} 
            placeholder="Term (e.g., LTV)" 
            className="w-full bg-surface border border-border rounded text-sm p-1.5 text-text focus:border-primary focus:outline-none" 
          />
          <textarea 
            {...register('definition', { required: true })} 
            placeholder="Meaning / Definition..." 
            rows={2}
            className="w-full bg-surface border border-border rounded text-sm p-1.5 text-text focus:border-primary focus:outline-none resize-none" 
          />
          <input 
            {...register('example')} 
            placeholder="Example (Optional)" 
            className="w-full bg-surface border border-border rounded text-sm p-1.5 text-text focus:border-primary focus:outline-none" 
          />
          
          <button type="submit" className="w-full py-1.5 bg-primary hover:bg-primary-dark text-white rounded text-sm font-medium transition-colors flex items-center justify-center gap-1">
            <Plus className="w-4 h-4" /> Add Term
          </button>
        </form>

        <hr className="border-border/50" />

        {/* Existing Terms */}
        <div className="space-y-2">
          {version.businessGlossary?.map(term => (
            <div key={term.id} className="bg-background border border-border/60 p-3 rounded-lg text-sm group relative">
              <button 
                onClick={() => deleteMutation.mutate(term.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-500 rounded transition-opacity bg-background"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="font-semibold text-text mb-1 pr-6 text-primary">{term.term}</div>
              <div className="text-muted text-xs leading-relaxed mb-2">{term.definition}</div>
              {term.example && (
                <div className="text-xs border-l-2 border-primary/30 pl-2 text-muted italic">
                  <span className="font-medium not-italic text-text">Example:</span> {term.example}
                </div>
              )}
            </div>
          ))}
          
          {(!version.businessGlossary || version.businessGlossary.length === 0) && (
            <div className="text-center text-xs text-muted p-4">
              No terms defined yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
