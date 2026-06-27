import React, { useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DatabaseZap, Plus, LayoutGrid, ChevronRight, Edit2 } from 'lucide-react';
import { SchemaApiService } from '@/services/schema.service';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

import { SchemaSidebar } from '@/components/schema/SchemaSidebar';
import { TableCard } from '@/components/schema/TableCard';
import { RelationshipWorkspace } from '@/components/schema/RelationshipWorkspace';
import { SchemaRightSidebar } from '@/components/schema/SchemaRightSidebar';
import { GlossaryManager } from '@/components/schema/GlossaryManager';
import { CreateTableModal } from '@/components/schema/CreateTableModal';
import { TableDetailView } from '@/components/schema/TableDetailView';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/common/EmptyState';

export const SchemaBuilderPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { activeSchemaId, setActiveSchemaId } = useOutletContext<{ activeSchemaId: string | null, setActiveSchemaId: (id: string | null) => void }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'tables' | 'relationships' | 'glossary' | 'overview'>('tables');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);

  // 1. Fetch lightweight schema list for the sidebar
  const { data: schemas, isLoading: isSchemasLoading } = useQuery({
    queryKey: ['schemas', projectId],
    queryFn: () => SchemaApiService.getSchemas(projectId!),
    enabled: !!projectId && projectId !== 'undefined',
  });

  // 2. Fetch fully detailed active schema for the main canvas
  const { data: activeSchemaData, isLoading: isActiveSchemaLoading } = useQuery({
    queryKey: ['schema', activeSchemaId],
    queryFn: () => SchemaApiService.getSchema(activeSchemaId!),
    enabled: !!activeSchemaId,
  });

  const activeSchema = schemas?.find(s => s.id === activeSchemaId);
  const detailedVersion = activeSchemaData?.versions?.[0];

  const isLoading = isSchemasLoading || (!!activeSchemaId && isActiveSchemaLoading);

  return (
    <div className="h-full flex overflow-hidden bg-background">
      {/* Left Sidebar: Schema List */}
      <div className="flex-shrink-0 h-full">
        <SchemaSidebar 
          projectId={projectId!}
          schemas={schemas || []}
          activeSchemaId={activeSchemaId}
          onSelectSchema={(id) => {
             setActiveSchemaId(id);
             setSelectedTableId(null);
          }}
        />
      </div>

      {/* Center Workspace */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#FAFAFA] min-w-0">
        
        {/* Schema Workspace Header */}
        {activeSchema && (
          <div className="h-14 border-b border-border/80 bg-surface flex items-center justify-between px-6 z-20 shrink-0 shadow-sm sticky top-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="text-text font-bold flex items-center gap-2">
                  {activeSchema.name}
                  <button className="text-muted hover:text-[#591C26] transition-colors p-1 rounded hover:bg-surface">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-bold tracking-wide">
                v{detailedVersion?.versionNumber || 1}.0
              </span>
              <span className="text-xs text-muted/60 hidden md:block border-l border-border pl-3 ml-1">
                Last updated just now
              </span>
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 relative scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {isLoading ? (
             <div className="h-full flex items-center justify-center">
               <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
             </div>
          ) : !activeSchemaId ? (
            <div className="h-full border border-dashed border-border/80 rounded-3xl bg-surface flex items-center justify-center">
              <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <DatabaseZap className="w-8 h-8 text-primary/60" />
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">No active schema</h3>
                <p className="text-sm text-muted">Select a schema from the sidebar or create a new one to begin modeling your database.</p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-7xl mx-auto h-full flex flex-col">
              
              {/* Workspace Header & Tabs */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-text tracking-tight flex items-center gap-2">
                      {activeSchema?.name}
                      <button className="p-1.5 text-muted hover:bg-border/50 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                    </h1>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      v{detailedVersion?.versionNumber || 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2 text-muted hover:bg-border/50 rounded-lg transition-colors">
                      <div className="w-5 h-5 flex items-center justify-center">•••</div>
                    </button>
                    <Button onClick={() => setIsAddTableModalOpen(true)} className="gap-2 px-5 shadow-sm rounded-lg bg-primary text-white hover:bg-primary/90">
                      <Plus className="w-4 h-4" /> New Table
                    </Button>
                  </div>
                </div>

                {/* Main Tabs */}
                <div className="flex items-center gap-6 border-b border-border/80 text-sm font-semibold text-muted">
                  <TabButton active={activeTab === 'tables'} onClick={() => setActiveTab('tables')} label="Tables" count={detailedVersion?.tables?.length || 0} />
                  <TabButton active={activeTab === 'relationships'} onClick={() => setActiveTab('relationships')} label="Relationships" count={detailedVersion?.relationships?.length || 0} />
                  <TabButton active={activeTab === 'glossary'} onClick={() => setActiveTab('glossary')} label="Glossary" count={detailedVersion?.businessGlossary?.length || 0} />
                  <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
                </div>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 flex flex-col">
                {activeTab === 'tables' && (
                  <>
                    {detailedVersion?.tables?.length === 0 ? (
                      <div className="py-12">
                        <EmptyState 
                          className="bg-surface border border-dashed border-border/60 rounded-2xl h-96"
                          icon={<LayoutGrid className="w-10 h-10 text-primary/60" />}
                          title="No tables yet"
                          description="Get started by creating your first database table. You can add columns, set constraints, and define relationships."
                          action={
                            <Button 
                              onClick={() => setIsAddTableModalOpen(true)}
                              className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-md"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Create Table
                            </Button>
                          }
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-8 pb-12">
                        {/* Horizontal Grid of Table Cards */}
                        <div className="flex flex-wrap gap-4">
                          {detailedVersion?.tables?.map(table => (
                            <TableCard 
                              key={table.id}
                              table={table} 
                              projectId={projectId!} 
                              isSelected={selectedTableId === table.id}
                              relationships={detailedVersion.relationships}
                              onClick={() => setSelectedTableId(table.id === selectedTableId ? null : table.id)}
                              onDelete={() => {
                                if (window.confirm(`Are you sure you want to delete the table ${table.name}?`)) {
                                  SchemaApiService.deleteTable(table.id).then(() => {
                                    queryClient.invalidateQueries({ queryKey: ['schema', activeSchemaId] });
                                    queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
                                  });
                                }
                              }}
                              onEdit={() => {
                                // For now, just expand the card which opens the detailed view
                                setSelectedTableId(table.id);
                              }}
                              onDuplicate={() => {
                                alert('Duplicate table feature coming soon!');
                              }}
                            />
                          ))}
                        </div>

                        {/* Selected Table Detail View below the grid */}
                        <AnimatePresence mode="wait">
                          {selectedTableId && detailedVersion && (
                             <motion.div
                               key={selectedTableId}
                               initial={{ opacity: 0, y: 10 }}
                               animate={{ opacity: 1, y: 0 }}
                               exit={{ opacity: 0, y: -10 }}
                               transition={{ duration: 0.2 }}
                             >
                                <TableDetailView 
                                  table={detailedVersion.tables.find(t => t.id === selectedTableId)!}
                                  schemaId={activeSchemaId!}
                                  projectId={projectId!}
                                  allTables={detailedVersion.tables}
                                />
                             </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'relationships' && detailedVersion && (
                  <div className="h-full">
                    <RelationshipWorkspace 
                      version={detailedVersion} 
                      schemaId={activeSchemaId!} 
                      projectId={projectId!} 
                    />
                  </div>
                )}

                {activeTab === 'glossary' && detailedVersion && (
                  <GlossaryManager 
                    version={detailedVersion} 
                    schemaId={activeSchemaId!} 
                    projectId={projectId!} 
                  />
                )}
                
                {activeTab === 'overview' && (
                  <div className="p-12 text-center text-muted bg-surface border border-border/50 rounded-2xl">
                    Overview and Schema Statistics coming soon.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="flex-shrink-0 h-full hidden lg:block bg-surface z-10 shadow-[-5px_0_20px_-15px_rgba(0,0,0,0.1)]">
        {activeSchemaId && detailedVersion ? (
          <SchemaRightSidebar 
            version={detailedVersion} 
          />
        ) : (
          <div className="w-64 lg:w-72 xl:w-80 shrink-0 h-full bg-surface border-l border-border/80 flex items-center justify-center p-6 text-center text-muted text-sm italic">
            Select a schema to view details
          </div>
        )}
      </div>

      {/* Add Table Modal */}
      <CreateTableModal 
        isOpen={isAddTableModalOpen}
        onClose={() => setIsAddTableModalOpen(false)}
        schemaId={activeSchemaId!}
        projectId={projectId!}
        existingTables={detailedVersion?.tables || []}
      />
    </div>
  );
};

const TabButton = ({ active, onClick, label, count }: any) => (
  <button
    onClick={onClick}
    className={clsx(
      "pb-3 border-b-2 flex items-center gap-2 transition-colors",
      active ? "border-primary text-primary" : "border-transparent hover:text-text"
    )}
  >
    {label}
    {count !== undefined && (
      <span className={clsx(
        "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
        active ? "bg-primary/10 text-primary" : "bg-border text-muted"
      )}>
        {count}
      </span>
    )}
  </button>
);
