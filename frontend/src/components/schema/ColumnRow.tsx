import React from 'react';
import { TableColumn, SchemaApiService, DatabaseTable } from '@/services/schema.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, GripVertical, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface ColumnRowProps {
  index: number;
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

export const ColumnRow: React.FC<ColumnRowProps> = ({ index, column, projectId, tables, schemaId }) => {
  const queryClient = useQueryClient();

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

  const handleChange = (field: keyof TableColumn, value: any) => {
    updateMutation.mutate({ [field]: value });
  };

  return (
    <div className="grid grid-cols-[30px_1.5fr_1fr_1.5fr_1fr_1fr_60px] gap-2 p-2 items-center hover:bg-background/50 transition-colors group">
      
      {/* Drag Handle & Index */}
      <div className="flex items-center justify-center text-muted/30 group-hover:text-muted cursor-grab">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Name */}
      <div>
        <input
          type="text"
          defaultValue={column.name}
          onBlur={(e) => {
            if (e.target.value !== column.name) handleChange('name', e.target.value);
          }}
          className="w-full bg-transparent border border-transparent hover:border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 py-1.5 text-sm font-medium text-text transition-colors"
        />
      </div>

      {/* Datatype */}
      <div>
        <select
          value={column.datatype.split('(')[0]} // Simplified for now if it has lengths
          onChange={(e) => handleChange('datatype', e.target.value)}
          className="w-full bg-surface border border-transparent hover:border-border focus:border-primary focus:outline-none rounded px-2 py-1.5 text-xs text-text transition-colors"
        >
          {DATA_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      {/* Constraints */}
      <div className="flex flex-wrap gap-1.5">
        <ConstraintBadge active={column.primaryKey} label="PK" onClick={() => handleChange('primaryKey', !column.primaryKey)} color="text-yellow-600 bg-yellow-500/10 border-yellow-500/20" />
        <ConstraintBadge active={!column.nullable} label="NN" onClick={() => handleChange('nullable', !column.nullable)} color="text-slate-600 dark:text-slate-300 bg-slate-500/10 border-slate-500/20" />
        <ConstraintBadge active={column.unique} label="UQ" onClick={() => handleChange('unique', !column.unique)} color="text-purple-500 bg-purple-500/10 border-purple-500/20" />
        <ConstraintBadge active={column.foreignKey} label="FK" onClick={() => handleChange('foreignKey', !column.foreignKey)} color="text-blue-500 bg-blue-500/10 border-blue-500/20" />
      </div>

      {/* Default */}
      <div>
        <input
          type="text"
          defaultValue={column.defaultValue || ''}
          placeholder="--"
          onBlur={(e) => {
             const val = e.target.value.trim();
             if (val !== (column.defaultValue || '')) {
               handleChange('defaultValue', val || null);
             }
          }}
          className="w-full bg-transparent border border-transparent hover:border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 py-1.5 text-xs text-muted font-mono transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <input
          type="text"
          defaultValue={column.description || ''}
          placeholder="Description..."
          onBlur={(e) => {
             const val = e.target.value.trim();
             if (val !== (column.description || '')) {
               handleChange('description', val || null);
             }
          }}
          className="w-full bg-transparent border border-transparent hover:border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 py-1.5 text-xs text-muted transition-colors"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => { if (confirm('Delete column?')) deleteMutation.mutate(); }} className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

const ConstraintBadge = ({ active, label, onClick, color }: { active: boolean, label: string, onClick: () => void, color: string }) => (
  <button 
    type="button"
    onClick={onClick}
    className={clsx(
      "px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all select-none cursor-pointer",
      active ? color : "text-muted border-border/50 bg-background hover:border-border hover:bg-surface"
    )}
  >
    {label}
  </button>
);
