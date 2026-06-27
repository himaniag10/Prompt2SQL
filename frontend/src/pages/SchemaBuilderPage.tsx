import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmptyState } from '@/components/common/EmptyState';
import { DatabaseZap, Plus } from 'lucide-react';
import { SchemaApiService } from '@/services/schema.service';

import { SchemaSidebar } from '@/components/schema/SchemaSidebar';
import { TableCard } from '@/components/schema/TableCard';
import { RelationshipManager } from '@/components/schema/RelationshipManager';
import { GlossaryManager } from '@/components/schema/GlossaryManager';
import { SummaryPanel } from '@/components/schema/SummaryPanel';
import { Button } from '@/components/ui/Button';

export const SchemaBuilderPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  
  const [activeSchemaId, setActiveSchemaId] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<'relationships' | 'glossary' | 'summary' | null>('summary');

  const { data: schemas, isLoading } = useQuery({
    queryKey: ['schemas', projectId],
    queryFn: () => SchemaApiService.getSchemas(projectId!),
    enabled: !!projectId,
  });

  const activeSchema = schemas?.find(s => s.id === activeSchemaId);
  const activeVersion = activeSchema?.versions?.[0]; // Always work with the latest version for now

  const addTableMutation = useMutation({
    mutationFn: () => SchemaApiService.createTable(activeSchemaId!, { name: 'new_table' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
    }
  });

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left Sidebar: Schema List */}
      <SchemaSidebar 
        projectId={projectId!}
        schemas={schemas || []}
        activeSchemaId={activeSchemaId}
        onSelectSchema={setActiveSchemaId}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
        {/* Toolbar */}
        {activeSchema && (
          <div className="h-14 border-b border-border bg-surface/50 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <h1 className="font-semibold text-text">{activeSchema.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                v{activeVersion?.versionNumber || 1}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setRightPanel(rightPanel === 'summary' ? null : 'summary')}
                className={rightPanel === 'summary' ? 'bg-primary/10 border-primary/50' : ''}
              >
                Summary
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setRightPanel(rightPanel === 'relationships' ? null : 'relationships')}
                className={rightPanel === 'relationships' ? 'bg-primary/10 border-primary/50' : ''}
              >
                Relationships
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setRightPanel(rightPanel === 'glossary' ? null : 'glossary')}
                className={rightPanel === 'glossary' ? 'bg-primary/10 border-primary/50' : ''}
              >
                Glossary
              </Button>
              <div className="w-px h-6 bg-border mx-2"></div>
              <Button size="sm" className="gap-1" onClick={() => addTableMutation.mutate()}>
                <Plus className="w-4 h-4" /> Add Table
              </Button>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-6 relative">
          {isLoading ? (
             <div className="h-full flex items-center justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
          ) : !activeSchemaId ? (
            <div className="h-full border border-dashed border-border/60 rounded-2xl bg-surface/30 flex items-center justify-center">
              <EmptyState
                icon={<DatabaseZap className="h-10 w-10 text-primary/60" />}
                title="No active schema"
                description="Select a schema from the sidebar or create a new one."
              />
            </div>
          ) : activeVersion?.tables?.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                 <DatabaseZap className="w-8 h-8 text-primary" />
               </div>
               <h3 className="text-lg font-semibold text-text mb-2">Empty Schema</h3>
               <p className="text-muted max-w-sm mb-6">Start designing your database schema by adding your first table.</p>
               <Button onClick={() => addTableMutation.mutate()} className="gap-2 rounded-full px-6">
                 <Plus className="w-4 h-4" /> Add Table
               </Button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto pb-20">
              {activeVersion?.tables?.map(table => (
                <TableCard 
                  key={table.id} 
                  table={table} 
                  projectId={projectId!} 
                  tables={activeVersion.tables} 
                  schemaId={activeSchemaId!} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Contextual Panel */}
      {rightPanel === 'summary' && activeSchemaId && activeVersion && (
        <SummaryPanel 
          version={activeVersion}
          schemaName={activeSchema.name}
        />
      )}
      {rightPanel === 'relationships' && activeSchemaId && activeVersion && (
        <RelationshipManager 
          version={activeVersion} 
          schemaId={activeSchemaId} 
          projectId={projectId!} 
        />
      )}
      {rightPanel === 'glossary' && activeSchemaId && activeVersion && (
        <GlossaryManager 
          version={activeVersion} 
          schemaId={activeSchemaId} 
          projectId={projectId!} 
        />
      )}
    </div>
  );
};
