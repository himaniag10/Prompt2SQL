import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SchemaApiService } from '@/services/schema.service';
import { Database, LayoutDashboard, TerminalSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export const GlobalChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedSchemaId, setSelectedSchemaId] = useState<string | null>(null);

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: SchemaApiService.getProjects
  });

  const { data: schemas, isLoading: schemasLoading } = useQuery({
    queryKey: ['schemas', selectedProjectId],
    queryFn: () => SchemaApiService.getSchemas(selectedProjectId!),
    enabled: !!selectedProjectId
  });

  const handleStartChat = () => {
    if (selectedProjectId && selectedSchemaId) {
      navigate(`/projects/${selectedProjectId}/schemas/${selectedSchemaId}/chat`);
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-6 bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-surface border border-border rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8 border-b border-border text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <TerminalSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text">AI Chat Assistant</h1>
          <p className="text-muted mt-2">Select a project and schema to start generating SQL queries.</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Step 1: Project Selection */}
          <div>
            <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">1</span>
              Select Project
            </h3>
            
            {projectsLoading ? (
              <div className="h-24 flex items-center justify-center text-muted">Loading projects...</div>
            ) : projects?.length === 0 ? (
              <div className="p-4 border border-dashed border-border rounded-lg text-center text-muted">
                No projects found. Create one first.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projects?.map(project => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setSelectedSchemaId(null);
                    }}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      selectedProjectId === project.id 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                        : 'border-border hover:border-primary/50 hover:bg-surface-hover'
                    }`}
                  >
                    <Database className={`w-5 h-5 ${selectedProjectId === project.id ? 'text-primary' : 'text-muted'}`} />
                    <div>
                      <div className={`font-semibold ${selectedProjectId === project.id ? 'text-primary' : 'text-text'}`}>
                        {project.name}
                      </div>
                      <div className="text-xs text-muted mt-0.5">{project.databaseType}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Schema Selection */}
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: selectedProjectId ? 1 : 0.5, height: 'auto' }}
            className={!selectedProjectId ? 'pointer-events-none' : ''}
          >
            <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">2</span>
              Select Schema
            </h3>
            
            {!selectedProjectId ? (
              <div className="p-4 border border-dashed border-border rounded-lg text-center text-muted">
                Select a project first
              </div>
            ) : schemasLoading ? (
              <div className="h-24 flex items-center justify-center text-muted">Loading schemas...</div>
            ) : schemas?.length === 0 ? (
              <div className="p-4 border border-dashed border-border rounded-lg text-center text-muted">
                No schemas found in this project.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {schemas?.map(schema => (
                  <button
                    key={schema.id}
                    onClick={() => setSelectedSchemaId(schema.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      selectedSchemaId === schema.id 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                        : 'border-border hover:border-primary/50 hover:bg-surface-hover'
                    }`}
                  >
                    <LayoutDashboard className={`w-5 h-5 ${selectedSchemaId === schema.id ? 'text-primary' : 'text-muted'}`} />
                    <div className={`font-semibold ${selectedSchemaId === schema.id ? 'text-primary' : 'text-text'}`}>
                      {schema.name}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <div className="p-6 border-t border-border bg-surface-hover flex justify-end">
          <Button 
            disabled={!selectedProjectId || !selectedSchemaId}
            onClick={handleStartChat}
            className="px-8 font-semibold rounded-full gap-2 bg-primary hover:bg-primary/90 text-white"
          >
            Start Chat <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
