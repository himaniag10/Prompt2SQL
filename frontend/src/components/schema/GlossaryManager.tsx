import React, { useState } from 'react';
import { SchemaVersion, SchemaApiService } from '@/services/schema.service';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Trash2, Book, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { EmptyState } from '@/components/common/EmptyState';

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
      queryClient.invalidateQueries({ queryKey: ['schema', schemaId] });
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: SchemaApiService.deleteGlossaryTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schema', schemaId] });
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
    }
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row pb-12 items-start h-full">
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="bg-surface border border-border/80 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Book className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-text">Business Glossary</h2>
              <p className="text-xs text-muted">Define terminology for this schema</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
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
          
          <button type="submit" className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-2">
            <Plus className="w-4 h-4" /> Add Term
          </button>
        </form>
        </div>
      </div>

      {/* Right Column: Terms Grid */}
      <div className="w-full lg:w-2/3 space-y-4">

        <hr className="border-border/50" />

        {(!version.businessGlossary || version.businessGlossary.length === 0) ? (
          <EmptyState 
            className="border border-dashed border-border/80 rounded-3xl bg-surface h-full min-h-[400px]"
            icon={<Book className="w-10 h-10 text-primary/60" />}
            title="No Glossary Terms"
            description="Define business terminology here to give AI better context about your schema."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {version.businessGlossary.map(term => (
              <div key={term.id} className="bg-surface border border-border/80 p-5 rounded-2xl group relative hover:border-primary/40 transition-colors shadow-sm hover:shadow-md flex flex-col h-full overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/5 to-primary/20" />
                <button 
                  onClick={() => deleteMutation.mutate(term.id)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-500 hover:bg-red-400/10 rounded-md transition-all border border-transparent hover:border-red-400/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="font-semibold text-text mb-2 pr-8 text-primary text-lg">{term.term}</div>
                <div className="text-muted text-sm leading-relaxed mb-4 flex-1">{term.definition}</div>
                {term.example && (
                  <div className="text-xs bg-surface border border-border rounded-lg p-3 text-muted italic">
                    <span className="font-semibold not-italic text-text block mb-1">Example:</span> {term.example}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
