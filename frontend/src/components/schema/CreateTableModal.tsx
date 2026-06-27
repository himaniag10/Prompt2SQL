import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SchemaApiService, DatabaseTable } from '@/services/schema.service';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Link as LinkIcon, DatabaseZap } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemaId: string;
  projectId: string;
  existingTables: DatabaseTable[];
}

interface ColumnDraft {
  id: string;
  name: string;
  datatype: string;
  length?: string;
  precision?: string;
  scale?: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey: boolean;
  unique: boolean;
  autoIncrement: boolean;
  defaultValue: string;
  description: string;
  refTableId?: string;
  refColumnId?: string;
}

const DATA_TYPES = [
  'INT', 'BIGINT', 'SMALLINT', 'FLOAT', 'DOUBLE', 'DECIMAL', 
  'BOOLEAN', 'CHAR', 'VARCHAR', 'TEXT', 
  'DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 
  'JSON', 'UUID', 'BLOB'
];

export const CreateTableModal: React.FC<CreateTableModalProps> = ({ isOpen, onClose, schemaId, projectId, existingTables }) => {
  const queryClient = useQueryClient();
  const [tableName, setTableName] = useState('');
  const [tableDesc, setTableDesc] = useState('');
  const [columns, setColumns] = useState<ColumnDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with one empty column row when modal opens
  useEffect(() => {
    if (isOpen) {
      setTableName('');
      setTableDesc('');
      setColumns([{
        id: crypto.randomUUID(),
        name: 'id',
        datatype: 'INT',
        nullable: false,
        primaryKey: true,
        foreignKey: false,
        unique: false,
        autoIncrement: true,
        defaultValue: '',
        description: ''
      }]);
      setError(null);
    }
  }, [isOpen]);

  const addColumnRow = () => {
    setColumns([...columns, {
      id: crypto.randomUUID(),
      name: '',
      datatype: 'VARCHAR',
      length: '100',
      nullable: true,
      primaryKey: false,
      foreignKey: false,
      unique: false,
      autoIncrement: false,
      defaultValue: '',
      description: ''
    }]);
  };

  const removeColumnRow = (id: string) => {
    setColumns(columns.filter(c => c.id !== id));
  };

  const updateColumn = (id: string, field: keyof ColumnDraft, value: any) => {
    setColumns(columns.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSubmit = async () => {
    if (!tableName.trim()) {
      setError('Table name is required');
      return;
    }

    // Validate columns
    const invalidCol = columns.find(c => !c.name.trim());
    if (invalidCol) {
      setError('All columns must have a name');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Create Table
      const newTable = await SchemaApiService.createTable(schemaId, {
        name: tableName.trim(),
        description: tableDesc.trim() || undefined
      });

      // 2. Create Columns sequentially
      for (const col of columns) {
        // Encode length/precision into datatype if needed
        let finalDatatype = col.datatype;
        if (['VARCHAR', 'CHAR'].includes(col.datatype) && col.length) {
          finalDatatype = `${col.datatype}(${col.length})`;
        } else if (col.datatype === 'DECIMAL' && col.precision) {
          finalDatatype = `${col.datatype}(${col.precision},${col.scale || 0})`;
        }

        // Encode autoIncrement into default value for now since backend doesn't support it natively
        let finalDefault = col.defaultValue;
        if (col.autoIncrement) {
          finalDefault = finalDefault ? `AUTO_INCREMENT, ${finalDefault}` : 'AUTO_INCREMENT';
        }

        const createdCol = await SchemaApiService.createColumn(newTable.id, {
          name: col.name.trim(),
          datatype: finalDatatype,
          nullable: col.nullable,
          primaryKey: col.primaryKey,
          foreignKey: col.foreignKey,
          unique: col.unique,
          defaultValue: finalDefault || undefined,
          description: col.description.trim() || undefined
        });

        // 3. Create inline Foreign Key if enabled
        if (col.foreignKey && col.refTableId && col.refColumnId) {
          await SchemaApiService.createRelationship(schemaId, {
            sourceTableId: newTable.id,
            sourceColumnId: createdCol.id,
            targetTableId: col.refTableId,
            targetColumnId: col.refColumnId,
            relationshipType: 'MANY_TO_ONE'
          });
        }
      }

      // Success
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
      queryClient.invalidateQueries({ queryKey: ['schema', schemaId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create table');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Table" className="max-w-6xl w-full h-[85vh] flex flex-col">
      <div className="flex flex-col h-full overflow-hidden bg-background">
        
        {/* Table Details Section */}
        <div className="p-6 border-b border-border/50 bg-surface/30 shrink-0 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm mb-4">
              {error}
            </div>
          )}
          <div className="flex gap-6">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Table Name</label>
              <input 
                value={tableName}
                onChange={e => setTableName(e.target.value)}
                placeholder="e.g. employees, orders"
                className="w-full bg-background border border-border rounded-lg text-sm p-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm font-medium"
                autoFocus
              />
            </div>
            <div className="flex-2 flex-grow space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Description <span className="normal-case font-normal">(optional)</span></label>
              <input 
                value={tableDesc}
                onChange={e => setTableDesc(e.target.value)}
                placeholder="What does this table store?"
                className="w-full bg-background border border-border rounded-lg text-sm p-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Spreadsheet Section */}
        <div className="flex-1 overflow-x-auto overflow-y-auto bg-background p-6">
          <div className="min-w-max border border-border/80 rounded-xl overflow-hidden shadow-sm bg-surface">
            {/* Header */}
            <div className="grid grid-cols-[30px_1fr_150px_120px_200px_120px_1fr_40px] gap-3 p-3 bg-surface border-b border-border text-xs font-bold text-muted uppercase tracking-wider sticky top-0 z-10">
              <div className="text-center">#</div>
              <div>Column Name</div>
              <div>Data Type</div>
              <div>Size / Precision</div>
              <div>Constraints</div>
              <div>Default Value</div>
              <div>Description & Relations</div>
              <div></div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/40">
              <AnimatePresence>
                {columns.map((col, index) => {
                  const showLength = ['VARCHAR', 'CHAR'].includes(col.datatype);
                  const showPrecision = col.datatype === 'DECIMAL';

                  return (
                    <motion.div 
                      key={col.id} 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-[30px_1fr_150px_120px_200px_120px_1fr_40px] gap-3 p-2 items-start hover:bg-background/50 transition-colors group"
                    >
                      <div className="text-center text-xs text-muted/50 mt-2">{index + 1}</div>
                      
                      {/* Name */}
                      <div>
                        <input 
                          value={col.name} onChange={e => updateColumn(col.id, 'name', e.target.value)}
                          placeholder="name" className="w-full bg-background border border-transparent hover:border-border focus:border-primary rounded text-sm px-2 py-1 text-text outline-none transition-colors"
                        />
                      </div>
                      
                      {/* Datatype */}
                      <div>
                        <select 
                          value={col.datatype} onChange={e => updateColumn(col.id, 'datatype', e.target.value)}
                          className="w-full bg-background border border-transparent hover:border-border focus:border-primary rounded text-sm px-2 py-1 text-text outline-none transition-colors"
                        >
                          {DATA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>

                      {/* Size/Precision */}
                      <div className="flex gap-1 items-center">
                        {showLength && (
                          <input 
                            value={col.length || ''} onChange={e => updateColumn(col.id, 'length', e.target.value)}
                            placeholder="Len" className="w-full bg-background border border-border rounded text-sm px-2 py-1 text-text outline-none"
                          />
                        )}
                        {showPrecision && (
                          <>
                            <input value={col.precision || ''} onChange={e => updateColumn(col.id, 'precision', e.target.value)} placeholder="P" className="w-1/2 bg-background border border-border rounded text-sm px-2 py-1 text-text outline-none text-center" />
                            <span className="text-muted/50">,</span>
                            <input value={col.scale || ''} onChange={e => updateColumn(col.id, 'scale', e.target.value)} placeholder="S" className="w-1/2 bg-background border border-border rounded text-sm px-2 py-1 text-text outline-none text-center" />
                          </>
                        )}
                      </div>

                      {/* Constraints Toggles */}
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <ConstraintBadge active={col.primaryKey} label="PK" onClick={() => updateColumn(col.id, 'primaryKey', !col.primaryKey)} color="text-yellow-600 bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500/50" />
                        <ConstraintBadge active={!col.nullable} label="NN" onClick={() => updateColumn(col.id, 'nullable', !col.nullable)} color="text-slate-600 dark:text-slate-300 bg-slate-500/10 border-slate-500/20 hover:border-slate-500/50" />
                        <ConstraintBadge active={col.unique} label="UQ" onClick={() => updateColumn(col.id, 'unique', !col.unique)} color="text-purple-500 bg-purple-500/10 border-purple-500/20 hover:border-purple-500/50" />
                        <ConstraintBadge active={col.foreignKey} label="FK" onClick={() => updateColumn(col.id, 'foreignKey', !col.foreignKey)} color="text-blue-500 bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50" />
                        <ConstraintBadge active={col.autoIncrement} label="AI" onClick={() => updateColumn(col.id, 'autoIncrement', !col.autoIncrement)} color="text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50" title="Auto Increment" />
                      </div>

                      {/* Default Value */}
                      <div>
                        <input 
                          value={col.defaultValue} onChange={e => updateColumn(col.id, 'defaultValue', e.target.value)}
                          placeholder="e.g. 0, NULL" className="w-full bg-background border border-transparent hover:border-border focus:border-primary rounded text-sm px-2 py-1 text-text outline-none transition-colors"
                        />
                      </div>

                      {/* Description & Relations */}
                      <div className="flex flex-col gap-2">
                        <input 
                          value={col.description} onChange={e => updateColumn(col.id, 'description', e.target.value)}
                          placeholder="Description..." className="w-full bg-background border border-transparent hover:border-border focus:border-primary rounded text-sm px-2 py-1 text-text outline-none transition-colors"
                        />
                        {col.foreignKey && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-1 items-center p-1.5 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                            <LinkIcon className="w-3.5 h-3.5 text-blue-500 shrink-0 mx-1" />
                            <select 
                              value={col.refTableId || ''} onChange={e => updateColumn(col.id, 'refTableId', e.target.value)}
                              className="w-1/2 bg-surface border border-border rounded text-xs px-1 py-1 text-text outline-none"
                            >
                              <option value="">Ref Table...</option>
                              {existingTables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <select 
                              value={col.refColumnId || ''} onChange={e => updateColumn(col.id, 'refColumnId', e.target.value)}
                              disabled={!col.refTableId}
                              className="w-1/2 bg-surface border border-border rounded text-xs px-1 py-1 text-text outline-none disabled:opacity-50"
                            >
                              <option value="">Ref Column...</option>
                              {existingTables.find(t => t.id === col.refTableId)?.columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </motion.div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end h-8">
                        <button onClick={() => removeColumnRow(col.id)} className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
          
          <button onClick={addColumnRow} className="mt-4 px-4 py-2 border border-dashed border-border text-muted hover:text-primary hover:border-primary/50 hover:bg-primary/5 rounded-xl text-sm font-medium transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Row
          </button>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-border/50 bg-surface flex justify-between items-center shrink-0">
          <div className="text-xs text-muted flex items-center gap-2">
            <DatabaseZap className="w-4 h-4 text-primary" />
            Define all your columns upfront for a complete table structure.
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="px-6 rounded-full">Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="px-8 rounded-full shadow-lg shadow-primary/20 gap-2">
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
              Save Table
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const ConstraintBadge = ({ active, label, onClick, color, title }: { active: boolean, label: string, onClick: () => void, color: string, title?: string }) => (
  <button 
    type="button"
    onClick={onClick}
    title={title}
    className={clsx(
      "px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer select-none",
      active ? color : "text-muted border-border/50 bg-background hover:border-border hover:bg-surface"
    )}
  >
    {label}
  </button>
);
