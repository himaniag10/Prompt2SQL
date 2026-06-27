import React from 'react';
import { SchemaVersion } from '@/services/schema.service';
import { Lightbulb, Activity, GitMerge, Link as LinkIcon, DatabaseZap, LayoutGrid } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

interface SchemaRightSidebarProps {
  version: SchemaVersion;
}

export const SchemaRightSidebar: React.FC<SchemaRightSidebarProps> = ({ version }) => {
  const tableCount = version?.tables?.length || 0;
  const columnCount = version?.tables?.reduce((acc, table) => acc + (table.columns?.length || 0), 0) || 0;
  const relationshipCount = version?.relationships?.length || 0;

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border w-64 lg:w-72 xl:w-80 shrink-0 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
      <div className="p-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="font-semibold text-text text-sm">Schema Context</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent p-4 space-y-6">
        
        {/* Statistics */}
        <div>
          <h3 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <DatabaseZap className="w-3.5 h-3.5" /> Summary
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background border border-border/80 rounded-xl p-3 shadow-sm">
              <div className="text-2xl font-bold text-primary">{tableCount}</div>
              <div className="text-xs text-muted font-medium mt-1">Tables</div>
            </div>
            <div className="bg-background border border-border/80 rounded-xl p-3 shadow-sm">
              <div className="text-2xl font-bold text-primary">{relationshipCount}</div>
              <div className="text-xs text-muted font-medium mt-1">Relations</div>
            </div>
            <div className="bg-background border border-border/80 rounded-xl p-3 shadow-sm col-span-2 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-text">{columnCount}</div>
                <div className="text-xs text-muted font-medium mt-1">Total Columns</div>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Recent Activity
          </h3>
          <EmptyState 
            className="p-4 py-8 border border-dashed border-border/60 rounded-xl bg-background/50"
            icon={<Activity className="w-6 h-6 text-muted" />}
            title="No Activity"
            description="No recent changes recorded for this schema."
          />
        </div>

        {/* Tips */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h3 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5" /> Pro Tip
          </h3>
          <p className="text-xs text-text leading-relaxed">
            Did you know? You can define foreign keys directly while creating a table to automatically generate relationships between them.
          </p>
        </div>

      </div>
    </div>
  );
};

