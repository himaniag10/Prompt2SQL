import React, { useState } from 'react';
import { TableColumn, SchemaApiService, DatabaseTable } from '@/services/schema.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Key, Link as LinkIcon, ChevronDown, ChevronRight } from 'lucide-react';

interface ColumnRowProps {
  column: TableColumn;
  projectId: string;
  tables: DatabaseTable[];
  schemaId: string;
}

const DATA_TYPES = [
  'INT', 'BIGINT', 'SMALLINT', 'FLOAT', 'DOUBLE', 'DECIMAL', 
  'BOOLEAN', 'CHAR', 'VARCHAR', 'TEXT', 
  'DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 
  'JSON', 'UUID', 'BLOB'
];

export const ColumnRow: React.FC<ColumnRowProps> = ({ column, projectId, tables, schemaId }) => {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [targetTableId, setTargetTableId] = useState('');
  const [targetColumnId, setTargetColumnId] = useState('');

  const updateMutation = useMutation({
    mutationFn: (data: Partial<TableColumn>) => SchemaApiService.updateColumn(column.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => SchemaApiService.deleteColumn(column.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
    }
  });

  const createRelMutation = useMutation({
    mutationFn: (data: any) => SchemaApiService.createRelationship(schemaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
      setTargetTableId('');
      setTargetColumnId('');
    }
  });

  const handleChange = (field: keyof TableColumn, value: any) => {
    updateMutation.mutate({ [field]: value });
  };

  const handleCreateRelationship = () => {
    if (targetTableId && targetColumnId) {
      createRelMutation.mutate({
        sourceTableId: column.tableId,
        sourceColumnId: column.id,
        targetTableId,
        targetColumnId,
        relationshipType: 'MANY_TO_ONE' // Default assumption for inline FK
      });
    }
  };

  const selectedTargetTable = tables.find(t => t.id === targetTableId);

  return (
    <div className="border-b border-border/50 group">
      {/* Main Row */}
      <div className="grid grid-cols-12 gap-2 p-2 hover:bg-background/50 transition-colors items-center text-sm cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        {/* Name */}
        <div className="col-span-4 flex items-center gap-2">
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted shrink-0" />}
          {column.primaryKey && <span title="Primary Key"><Key className="w-3.5 h-3.5 text-yellow-500 shrink-0" /></span>}
          {column.foreignKey && <span title="Foreign Key"><LinkIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" /></span>}
          {!column.primaryKey && !column.foreignKey && <div className="w-3.5 h-3.5 shrink-0" />}
          <input
            type="text"
            defaultValue={column.name}
            onClick={(e) => e.stopPropagation()}
            onBlur={(e) => {
              if (e.target.value !== column.name) handleChange('name', e.target.value);
            }}
            className="bg-transparent border border-transparent hover:border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5 w-full text-text"
          />
        </div>

        {/* Datatype */}
        <div className="col-span-3" onClick={(e) => e.stopPropagation()}>
          <select
            value={column.datatype}
            onChange={(e) => handleChange('datatype', e.target.value)}
            className="bg-surface border border-transparent hover:border-border focus:border-primary focus:outline-none rounded px-1 py-0.5 w-full text-text text-xs"
          >
            {DATA_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        {/* Constraints */}
        <div className="col-span-4 flex items-center gap-3 text-xs" onClick={(e) => e.stopPropagation()}>
          <label className="flex items-center gap-1 cursor-pointer hover:text-primary">
            <input type="checkbox" checked={!column.nullable} onChange={(e) => handleChange('nullable', !e.target.checked)} className="rounded border-border text-primary focus:ring-primary/50" /> NN
          </label>
          <label className="flex items-center gap-1 cursor-pointer hover:text-yellow-500">
            <input type="checkbox" checked={column.primaryKey} onChange={(e) => handleChange('primaryKey', e.target.checked)} className="rounded border-border text-yellow-500 focus:ring-yellow-500/50" /> PK
          </label>
          <label className="flex items-center gap-1 cursor-pointer hover:text-purple-500">
            <input type="checkbox" checked={column.unique} onChange={(e) => handleChange('unique', e.target.checked)} className="rounded border-border text-purple-500 focus:ring-purple-500/50" /> UQ
          </label>
          <label className="flex items-center gap-1 cursor-pointer hover:text-blue-500">
            <input type="checkbox" checked={column.foreignKey} onChange={(e) => {
              handleChange('foreignKey', e.target.checked);
              if (e.target.checked) setIsExpanded(true);
            }} className="rounded border-border text-blue-500 focus:ring-blue-500/50" /> FK
          </label>
        </div>

        {/* Actions */}
        <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => { if (confirm('Delete column?')) deleteMutation.mutate(); }} className="p-1 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-3 bg-surface/30 border-t border-border/30 ml-6 pl-2 space-y-3">
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted block">Default Value</label>
              <input
                type="text"
                defaultValue={column.defaultValue || ''}
                placeholder="e.g. CURRENT_TIMESTAMP, 0, 'active'"
                onBlur={(e) => handleChange('defaultValue', e.target.value || null)}
                className="w-full bg-surface border border-border rounded text-sm px-2 py-1 text-text focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted block">Description</label>
              <input
                type="text"
                defaultValue={column.description || ''}
                placeholder="Column description..."
                onBlur={(e) => handleChange('description', e.target.value || null)}
                className="w-full bg-surface border border-border rounded text-sm px-2 py-1 text-text focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          
          {column.foreignKey && (
            <div className="p-2 border border-blue-500/30 bg-blue-500/5 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-400 mb-1">
                <LinkIcon className="w-3.5 h-3.5" /> Inline Foreign Key Setup
              </div>
              <div className="flex gap-2 items-center">
                <select 
                  value={targetTableId} 
                  onChange={(e) => setTargetTableId(e.target.value)}
                  className="bg-surface border border-border rounded text-sm px-2 py-1 text-text focus:border-primary focus:outline-none flex-1"
                >
                  <option value="">Select Reference Table...</option>
                  {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select 
                  value={targetColumnId} 
                  onChange={(e) => setTargetColumnId(e.target.value)}
                  disabled={!targetTableId}
                  className="bg-surface border border-border rounded text-sm px-2 py-1 text-text focus:border-primary focus:outline-none flex-1"
                >
                  <option value="">Select Reference Column...</option>
                  {selectedTargetTable?.columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button 
                  onClick={handleCreateRelationship}
                  disabled={!targetTableId || !targetColumnId}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded text-xs transition-colors"
                >
                  Create Relation
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
