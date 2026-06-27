import React from 'react';
import { DatabaseTable } from '@/services/schema.service';
import { TableProperties, MoreVertical } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface TableCardProps {
  table: DatabaseTable;
  projectId: string;
  isSelected: boolean;
  onClick: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({ table, isSelected, onClick }) => {
  const numCols = table.columns?.length || 0;

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={clsx(
        "bg-white border rounded-xl p-4 cursor-pointer transition-all w-64 shadow-sm flex flex-col gap-3 group relative overflow-hidden",
        isSelected 
          ? "border-[#591C26]/40 shadow-md ring-1 ring-[#591C26]/20 bg-[#591C26]/5" 
          : "border-border/80 hover:border-border hover:shadow-md"
      )}
    >
      {isSelected && <div className="absolute top-0 left-0 right-0 h-1 bg-[#591C26]" />}
      
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-[#591C26]/10 flex items-center justify-center shrink-0">
          <TableProperties className="w-5 h-5 text-[#591C26]" />
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Open context menu (Edit/Delete)
          }}
          className="p-1.5 text-muted hover:bg-border/50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div>
        <h3 className="font-semibold text-text text-sm truncate pr-2">{table.name}</h3>
        <p className="text-xs text-muted mt-0.5">{numCols} {numCols === 1 ? 'column' : 'columns'}</p>
      </div>
    </motion.div>
  );
};
