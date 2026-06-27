import React from 'react';

export const SchemaBuilderPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Schema Builder</h1>
        <p className="text-muted">Visually design and map your database schema.</p>
      </div>
      <div className="border border-border bg-background rounded-xl h-[500px] flex items-center justify-center text-muted">
        Schema Canvas Placeholder
      </div>
    </div>
  );
};
