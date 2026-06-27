import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const schema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().optional(),
  databaseType: z.enum(['MYSQL', 'POSTGRESQL', 'SQLITE', 'SQLSERVER', 'ORACLE']),
});

type FormData = z.infer<typeof schema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      databaseType: 'POSTGRESQL'
    }
  });

  if (!isOpen) return null;

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-semibold text-text">Create New Project</h2>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Project Name</label>
            <Input {...register('name')} placeholder="e.g. E-commerce DB" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Description</label>
            <Input {...register('description')} placeholder="Optional description" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Database Type</label>
            <select
              {...register('databaseType')}
              className="w-full h-11 px-4 bg-background/50 border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="POSTGRESQL">PostgreSQL</option>
              <option value="MYSQL">MySQL</option>
              <option value="SQLITE">SQLite</option>
              <option value="SQLSERVER">SQL Server</option>
              <option value="ORACLE">Oracle</option>
            </select>
            {errors.databaseType && <p className="text-xs text-red-500">{errors.databaseType.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Project'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
