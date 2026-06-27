import React from 'react';
import { SchemaVersion } from '@/services/schema.service';
import { Database, TableProperties, Link as LinkIcon, BookOpen, Activity, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface SchemaRightSidebarProps {
  version: SchemaVersion;
  schemaName: string;
}

export const SchemaRightSidebar: React.FC<SchemaRightSidebarProps> = ({ version, schemaName }) => {
  const tableCount = version.tables?.length || 0;
  const columnCount = version.tables?.reduce((acc, t) => acc + (t.columns?.length || 0), 0) || 0;
  const relationCount = version.relationships?.length || 0;
  const glossaryCount = version.businessGlossary?.length || 0;

  return (
    <div className="w-80 h-full bg-surface border-l border-border/80 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-border/50 sticky top-0 bg-surface/90 backdrop-blur z-10">
        <h2 className="text-sm font-semibold text-text flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          {schemaName} Summary
        </h2>
      </div>

      <div className="p-5 space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<TableProperties className="w-4 h-4 text-blue-500" />} label="Tables" value={tableCount} />
          <StatCard icon={<Database className="w-4 h-4 text-emerald-500" />} label="Columns" value={columnCount} />
          <StatCard icon={<LinkIcon className="w-4 h-4 text-purple-500" />} label="Relations" value={relationCount} />
          <StatCard icon={<BookOpen className="w-4 h-4 text-amber-500" />} label="Terms" value={glossaryCount} />
        </div>

        {/* Recent Activity Placeholder */}
        <div>
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Recent Activity
          </h3>
          <div className="space-y-4">
            <ActivityItem text="Created table employees" time="Just now" />
            <ActivityItem text="Updated schema properties" time="2 hours ago" />
            <ActivityItem text="Added relationship to departments" time="Yesterday" />
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" /> Quick Tip
          </h3>
          <p className="text-sm text-text/80 leading-relaxed">
            Use the <strong className="text-primary font-medium">Relationships</strong> dropdown when creating a column to instantly link foreign keys.
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="bg-background border border-border/60 p-3 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col gap-1"
  >
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-[10px] uppercase font-bold text-muted tracking-wider">{label}</span>
    </div>
    <span className="text-2xl font-bold text-text ml-1">{value}</span>
  </motion.div>
);

const ActivityItem = ({ text, time }: { text: string, time: string }) => (
  <div className="flex gap-3 items-start relative before:absolute before:left-[5px] before:top-4 before:bottom-[-16px] before:w-[2px] before:bg-border/50 last:before:hidden">
    <div className="w-3 h-3 rounded-full bg-primary/20 border-2 border-primary mt-1 shrink-0 z-10" />
    <div className="flex flex-col gap-0.5">
      <span className="text-sm text-text font-medium">{text}</span>
      <span className="text-xs text-muted">{time}</span>
    </div>
  </div>
);
