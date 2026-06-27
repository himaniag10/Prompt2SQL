import React from 'react';
import { SchemaVersion } from '@/services/schema.service';
import { Lightbulb, Activity, GitMerge, Link as LinkIcon, DatabaseZap } from 'lucide-react';

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
              <div className="text-2xl font-bold text-[#591C26]">{tableCount}</div>
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
          <div className="space-y-3">
            <div className="flex gap-3 items-start relative before:absolute before:left-[11px] before:top-6 before:bottom-[-16px] before:w-[2px] before:bg-border/60">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 z-10">
                <GitMerge className="w-3 h-3 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-text">Schema created</p>
                <span className="text-[10px] text-muted">Version 1 initialized</span>
              </div>
            </div>
            <div className="flex gap-3 items-start relative">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 z-10">
                <LinkIcon className="w-3 h-3 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-text">Ready for design</p>
                <span className="text-[10px] text-muted">Waiting for tables...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-[#591C26]/5 border border-[#591C26]/20 rounded-xl p-4">
          <h3 className="text-[10px] font-bold text-[#591C26] uppercase tracking-wider mb-2 flex items-center gap-2">
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

// Temp import for missing icon above
const LayoutGrid = ({className}: any) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>;
