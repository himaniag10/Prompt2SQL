import React from 'react';
import { SchemaVersion } from '@/services/schema.service';
import { Database, Link as LinkIcon, TableProperties, Hash } from 'lucide-react';

interface SummaryPanelProps {
  version: SchemaVersion;
  schemaName: string;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ version, schemaName }) => {
  const tableCount = version.tables?.length || 0;
  const relationshipCount = version.relationships?.length || 0;
  const columnCount = version.tables?.reduce((acc, table) => acc + (table.columns?.length || 0), 0) || 0;
  const glossaryCount = version.businessGlossary?.length || 0;

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border w-80">
      <div className="p-4 border-b border-border bg-background/50 flex items-center gap-2">
        <Database className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-text">Schema Summary</h2>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-text">{schemaName}</h3>
          <p className="text-xs text-muted">Version {version.versionNumber}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background border border-border p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 shadow-sm">
            <TableProperties className="w-5 h-5 text-blue-500" />
            <span className="text-2xl font-bold text-text">{tableCount}</span>
            <span className="text-xs text-muted uppercase tracking-wider font-medium">Tables</span>
          </div>
          
          <div className="bg-background border border-border p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 shadow-sm">
            <LinkIcon className="w-5 h-5 text-purple-500" />
            <span className="text-2xl font-bold text-text">{relationshipCount}</span>
            <span className="text-xs text-muted uppercase tracking-wider font-medium">Relations</span>
          </div>

          <div className="bg-background border border-border p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 shadow-sm">
            <Hash className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold text-text">{columnCount}</span>
            <span className="text-xs text-muted uppercase tracking-wider font-medium">Columns</span>
          </div>

          <div className="bg-background border border-border p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 shadow-sm">
            <Database className="w-5 h-5 text-orange-500" />
            <span className="text-2xl font-bold text-text">{glossaryCount}</span>
            <span className="text-xs text-muted uppercase tracking-wider font-medium">Terms</span>
          </div>
        </div>

        <hr className="border-border/50" />

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-text">Recent Activity</h4>
          <p className="text-xs text-muted italic">No recent activity to show.</p>
        </div>
      </div>
    </div>
  );
};
