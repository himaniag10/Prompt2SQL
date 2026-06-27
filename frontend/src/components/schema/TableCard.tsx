import React from 'react';
import { DatabaseTable, Relationship } from '@/services/schema.service';
import { TableProperties, MoreVertical, Edit2, Trash2, Copy, ChevronDown, ChevronUp, Key } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface TableCardProps {
  table: DatabaseTable;
  projectId: string;
  isSelected: boolean;
  onClick: () => void;
  relationships?: Relationship[];
  onDelete?: () => void;
  onDuplicate?: () => void;
  onEdit?: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({ table, isSelected, onClick, relationships = [], onDelete, onDuplicate, onEdit }) => {
  const numCols = table.columns?.length || 0;
  const numFks = relationships.filter(r => r.sourceTableId === table.id).length;
  const primaryKeyCol = table.columns?.find(c => c.primaryKey);

  return (
    <motion.div
      layout
      className={clsx(
        "bg-white border rounded-2xl p-5 transition-all flex-1 min-w-[260px] max-w-[320px] shadow-sm flex flex-col gap-4 relative overflow-hidden",
        isSelected 
          ? "border-[#591C26]/40 shadow-md ring-1 ring-[#591C26]/20 bg-[#591C26]/5" 
          : "border-border/80 hover:border-border hover:shadow-md"
      )}
    >
      {isSelected && <div className="absolute top-0 left-0 right-0 h-1 bg-[#591C26]" />}
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#591C26]/10 flex items-center justify-center shrink-0">
            <TableProperties className="w-5 h-5 text-[#591C26]" />
          </div>
          <div>
            <h3 className="font-bold text-text text-base truncate max-w-[150px]">{table.name}</h3>
            {primaryKeyCol && (
              <div className="flex items-center gap-1 text-[10px] text-yellow-600 font-mono mt-0.5">
                <Key className="w-3 h-3" /> {primaryKeyCol.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted line-clamp-2 min-h-[32px]">
        {table.description || 'No description provided for this table.'}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="bg-surface/60 rounded-lg p-2 border border-border/50 text-center">
          <div className="text-sm font-bold text-text">{numCols}</div>
          <div className="text-[10px] uppercase font-bold text-muted tracking-wider">Columns</div>
        </div>
        <div className="bg-surface/60 rounded-lg p-2 border border-border/50 text-center">
          <div className="text-sm font-bold text-text">{numFks}</div>
          <div className="text-[10px] uppercase font-bold text-muted tracking-wider">Foreign Keys</div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 mt-auto border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="p-1.5 text-muted hover:text-text hover:bg-surface rounded-md transition-colors" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDuplicate?.(); }} className="p-1.5 text-muted hover:text-text hover:bg-surface rounded-md transition-colors" title="Duplicate">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className={clsx(
            "flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors",
            isSelected ? "bg-[#591C26]/10 text-[#591C26]" : "bg-surface text-muted hover:bg-border/50"
          )}
        >
          {isSelected ? (
            <><ChevronUp className="w-3.5 h-3.5" /> Collapse</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" /> Expand</>
          )}
        </button>
      </div>
    </motion.div>
  );
};
