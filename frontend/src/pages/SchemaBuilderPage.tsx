import React from 'react';
import { EmptyState } from '@/components/common/EmptyState';
import { DatabaseZap } from 'lucide-react';

export const SchemaBuilderPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">Schema Builder</h1>
        <p className="text-muted mt-1">Visually design and map your database schema.</p>
      </div>
      <div className="flex-1 border border-border bg-surface/30 rounded-2xl flex items-center justify-center shadow-sm">
        <EmptyState
          icon={<DatabaseZap className="h-10 w-10 text-primary/60" />}
          title="No active schema"
          description="Select a project or define a new schema to begin building."
        />
      </div>
    </div>
  );
};
