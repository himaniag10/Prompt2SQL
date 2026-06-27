import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { FolderPlus, Database, Calendar } from 'lucide-react';
import { SchemaApiService } from '@/services/schema.service';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: SchemaApiService.getProjects
  });

  const createMutation = useMutation({
    mutationFn: SchemaApiService.createProject,
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      navigate(`/projects/${newProject.id}`);
    }
  });

  return (
    <div className="h-full flex flex-col p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Projects</h1>
          <p className="text-muted mt-1">Manage your database projects and connections.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="rounded-full shadow-sm px-6 gap-2">
          <FolderPlus className="w-4 h-4" />
          New Project
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : projects?.length === 0 ? (
        <div className="flex-1 border border-dashed border-border/60 rounded-2xl bg-surface/50 flex items-center justify-center">
          <EmptyState
            icon={<FolderPlus className="h-10 w-10 text-primary/60" />}
            title="No projects found"
            description="You haven't created any projects yet. Start by creating your first project."
            action={
              <Button onClick={() => setIsModalOpen(true)} size="md" className="gap-2 rounded-full px-6">
                <FolderPlus className="w-4 h-4" />
                Create Project
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <div 
              key={project.id} 
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-surface border border-border/60 rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-background border border-border text-muted">
                  {project.databaseType}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-text mb-1 group-hover:text-primary transition-colors">{project.name}</h3>
              <p className="text-sm text-muted line-clamp-2 flex-1 mb-6">
                {project.description || 'No description provided.'}
              </p>
              <div className="flex items-center text-xs text-muted/80 pt-4 border-t border-border/40">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
};
