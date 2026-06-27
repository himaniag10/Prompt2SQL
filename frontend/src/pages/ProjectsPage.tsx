import React from 'react';
import { Button } from '@/components/ui/Button';

export const ProjectsPage: React.FC = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted">Manage your database projects and connections.</p>
        </div>
        <Button>New Project</Button>
      </div>
      
      <div className="border border-dashed border-border rounded-xl h-64 flex items-center justify-center text-muted">
        No projects found. Create one to get started.
      </div>
    </div>
  );
};
