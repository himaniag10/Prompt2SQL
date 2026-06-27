import React, { useState } from 'react';
import { DatabaseTable, SchemaApiService } from '@/services/schema.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Edit2, Plus, LayoutGrid, ShieldAlert, Hash } from 'lucide-react';
import { ColumnRow } from './ColumnRow';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';

interface TableDetailViewProps {
  table: DatabaseTable;
  schemaId: string;
  projectId: string;
  allTables: DatabaseTable[];
}

export const TableDetailView: React.FC<TableDetailViewProps> = ({ table, schemaId, projectId, allTables }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'columns' | 'constraints' | 'indexes' | 'notes'>('columns');

  const updateMutation = useMutation({
    mutationFn: (name: string) => SchemaApiService.updateTable(table.id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schema', schemaId] });
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => SchemaApiService.deleteTable(table.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schema', schemaId] });
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
    }
  });

  const addColumnMutation = useMutation({
    mutationFn: () => SchemaApiService.createColumn(table.id, {
      name: 'new_column',
      datatype: 'VARCHAR(100)',
      nullable: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schema', schemaId] });
    }
  });

  return (
    <div className="bg-white border border-border/80 rounded-2xl shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border/50 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-text flex items-center gap-2">
              {table.name}
              <button className="p-1.5 text-muted hover:bg-border/50 rounded-md transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </h2>
          </div>
          <p className="text-sm text-muted">{table.description || 'No description provided.'}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => { if (confirm(`Delete table ${table.name}?`)) deleteMutation.mutate(); }}
          className="text-red-500 border-red-500/30 hover:bg-red-500/10 gap-2"
        >
          <Trash2 className="w-4 h-4" /> Delete Table
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 px-6 border-b border-border/50 bg-[#FAFAFA]">
        <DetailTabButton active={activeTab === 'columns'} onClick={() => setActiveTab('columns')} label="Columns" />
        <DetailTabButton active={activeTab === 'constraints'} onClick={() => setActiveTab('constraints')} label="Constraints" />
        <DetailTabButton active={activeTab === 'indexes'} onClick={() => setActiveTab('indexes')} label="Indexes" />
        <DetailTabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} label="Notes" />
      </div>

      {/* Content */}
      <div className="bg-white">
        {activeTab === 'columns' && (
          <div className="flex flex-col">
            <div className="p-4 flex justify-end bg-white">
              <Button onClick={() => addColumnMutation.mutate()} className="gap-2 bg-[#591C26] hover:bg-[#4A161E] text-white">
                <Plus className="w-4 h-4" /> Add Column
              </Button>
            </div>
            
            <div className="w-full overflow-x-auto">
              <div className="min-w-max border-t border-border/50">
                {/* Table Header */}
                <div className="grid grid-cols-[30px_1.5fr_1fr_1.5fr_1fr_1fr_60px] gap-2 p-3 bg-[#FAFAFA] border-b border-border text-[10px] font-bold text-muted uppercase tracking-wider">
                  <div className="text-center">#</div>
                  <div>Column Name</div>
                  <div>Data Type</div>
                  <div>Constraints</div>
                  <div>Default</div>
                  <div>Description</div>
                  <div className="text-center">Actions</div>
                </div>
                
                {/* Table Rows */}
                <div className="divide-y divide-border/40">
                  {table.columns?.map((column, index) => (
                    <ColumnRow 
                      key={column.id} 
                      index={index + 1} 
                      column={column} 
                      projectId={projectId} 
                      tables={allTables} 
                      schemaId={schemaId} 
                    />
                  ))}
                  {(!table.columns || table.columns.length === 0) && (
                    <div className="p-12 text-center text-sm text-muted bg-[#FAFAFA]">
                      No columns defined yet. Click "Add Column" above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'constraints' && <PlaceholderTab icon={<ShieldAlert />} text="Constraint management is mapped from the column definitions." />}
        {activeTab === 'indexes' && <PlaceholderTab icon={<Hash />} text="Index management coming soon." />}
        
        {activeTab === 'notes' && (
          <div className="p-6">
            <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Table Notes & Description</label>
            <textarea
              defaultValue={table.description || ''}
              onBlur={(e) => {
                if (e.target.value !== table.description) {
                   SchemaApiService.updateTable(table.id, { description: e.target.value });
                }
              }}
              placeholder="Enter comprehensive table notes..."
              rows={6}
              className="w-full bg-white border border-border rounded-xl text-sm p-4 text-text focus:border-[#591C26] focus:ring-1 focus:ring-[#591C26] outline-none transition-all resize-none shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const DetailTabButton = ({ active, onClick, label }: any) => (
  <button
    onClick={onClick}
    className={clsx(
      "py-3 text-sm font-semibold border-b-2 transition-colors",
      active ? "border-[#591C26] text-[#591C26]" : "border-transparent text-muted hover:text-text hover:border-border"
    )}
  >
    {label}
  </button>
);

const PlaceholderTab = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary/60 mb-3">
      {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
    </div>
    <p className="text-sm text-text/80 font-medium">{text}</p>
  </div>
);
