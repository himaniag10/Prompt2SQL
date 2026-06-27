import React, { useState } from 'react';
import { DatabaseTable, SchemaApiService } from '@/services/schema.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { ColumnRow } from './ColumnRow';

interface TableCardProps {
  table: DatabaseTable;
  projectId: string;
  tables: DatabaseTable[];
  schemaId: string;
}

export const TableCard: React.FC<TableCardProps> = ({ table, projectId, tables, schemaId }) => {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(true);

  const updateMutation = useMutation({
    mutationFn: (name: string) => SchemaApiService.updateTable(table.id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => SchemaApiService.deleteTable(table.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
    }
  });

  const addColumnMutation = useMutation({
    mutationFn: () => SchemaApiService.createColumn(table.id, {
      name: 'new_column',
      datatype: 'VARCHAR',
      nullable: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
      setIsExpanded(true);
    }
  });

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col mb-4">
      {/* Table Header */}
      <div 
        className="bg-background/80 border-b border-border p-3 flex items-center justify-between cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown className="w-4 h-4 text-muted" /> : <ChevronRight className="w-4 h-4 text-muted" />}
          <div className="font-semibold text-text flex items-center gap-2">
            <input
              type="text"
              defaultValue={table.name}
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => {
                if (e.target.value !== table.name) {
                  updateMutation.mutate(e.target.value);
                }
              }}
              className="bg-transparent border border-transparent hover:border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 py-1 transition-all"
            />
          </div>
          <span className="text-xs text-muted/60 ml-2 bg-border/30 px-2 py-0.5 rounded-full">{table.columns?.length || 0} cols</span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button 
            onClick={() => addColumnMutation.mutate()}
            className="p-1.5 text-primary hover:bg-primary/10 rounded"
            title="Add Column"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              if (confirm(`Delete table ${table.name}?`)) deleteMutation.mutate();
            }}
            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Columns List */}
      {isExpanded && (
        <div className="flex flex-col bg-background/30">
          <div className="grid grid-cols-12 gap-2 p-2 border-b border-border/40 bg-surface/50 text-xs font-medium text-muted uppercase tracking-wider">
            <div className="col-span-4 pl-6">Name</div>
            <div className="col-span-3">Type</div>
            <div className="col-span-4">Constraints</div>
            <div className="col-span-1"></div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {table.columns?.map(column => (
              <ColumnRow key={column.id} column={column} projectId={projectId} tables={tables} schemaId={schemaId} />
            ))}
            
            {(!table.columns || table.columns.length === 0) && (
              <div className="p-4 text-center text-sm text-muted italic">
                No columns defined yet. Click the + button to add one.
              </div>
            )}
          </div>
          
          <div className="p-2 bg-surface/50 border-t border-border/40">
             <button
                onClick={() => addColumnMutation.mutate()}
                className="w-full py-1.5 flex items-center justify-center gap-2 text-sm text-muted hover:text-primary hover:bg-primary/5 rounded border border-dashed border-border hover:border-primary/50 transition-all"
             >
                <Plus className="w-4 h-4" /> Add Column
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
