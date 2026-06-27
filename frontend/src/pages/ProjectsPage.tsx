import React from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { FolderPlus } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Projects</h1>
          <p className="text-muted mt-1">Manage your database projects and connections.</p>
        </div>
        <Button className="rounded-full shadow-sm px-6">New Project</Button>
      </div>
      
      <div className="flex-1 border border-dashed border-border/60 rounded-2xl bg-surface/50 flex items-center justify-center">
        <EmptyState
          icon={<FolderPlus className="h-10 w-10 text-primary/60" />}
          title="No projects found"
          description="You haven't created any projects yet. Start by creating your first project."
          action={
            <Button size="md" className="gap-2 rounded-full px-6">
              <FolderPlus className="w-4 h-4" />
              Create Project
            </Button>
          }
        />
      </div>
    </div>
  );
};
