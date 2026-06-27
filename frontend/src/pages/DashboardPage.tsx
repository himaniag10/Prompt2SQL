import React from 'react';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { Plus, Database } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">Overview</h1>
        <p className="text-muted mt-1">Manage your database projects and connections.</p>
      </div>
      
      <div className="flex-1 flex items-center justify-center border border-dashed border-border/60 rounded-2xl bg-surface/50">
        <EmptyState
          icon={<Database className="h-10 w-10 text-primary/60" />}
          title="No projects yet"
          description="Create your first project to start designing schemas and generating queries."
          action={
            <Button size="md" className="gap-2 rounded-full px-6">
              <Plus className="w-4 h-4" />
              Create Project
            </Button>
          }
        />
      </div>
    </div>
  );
};
