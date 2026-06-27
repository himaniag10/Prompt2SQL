import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { FolderPlus, Database, Calendar, MoreVertical, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { SchemaApiService, Project } from '@/services/schema.service';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: SchemaApiService.getProjects
  });

  const createMutation = useMutation({
    mutationFn: SchemaApiService.createProject,
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateModalOpen(false);
      navigate(`/projects/${newProject.id}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, payload: any }) => SchemaApiService.updateProject(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditingProject(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: SchemaApiService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const handleDelete = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setActiveDropdown(null);
    if (window.confirm(`Are you sure you want to delete the project "${project.name}"?\n\nThis will soft-delete the project and instantly remove it from your workspace.`)) {
      deleteMutation.mutate(project.id);
    }
  };

  const handleEdit = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setActiveDropdown(null);
    setEditingProject(project);
  };

  const handleOpen = (id: string) => {
    navigate(`/projects/${id}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="h-full flex flex-col p-8 bg-background">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Projects</h1>
          <p className="text-muted mt-1">Manage your database projects and connections.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-full shadow-sm px-6 gap-2 bg-primary text-white hover:bg-primary/90">
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
              <Button onClick={() => setIsCreateModalOpen(true)} size="md" className="gap-2 rounded-full px-6 border border-primary text-primary bg-transparent hover:bg-primary/5">
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
              onClick={() => handleOpen(project.id)}
              className="bg-surface border border-border/80 rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group flex flex-col relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-border text-muted uppercase tracking-wider">
                    {project.databaseType}
                  </span>

                  {/* 3-Dot Menu */}
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Native event needs to stop propagation to document click listener
                        e.nativeEvent.stopImmediatePropagation();
                        setActiveDropdown(activeDropdown === project.id ? null : project.id);
                      }}
                      className="p-1.5 text-muted hover:bg-border/50 rounded-md transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Options */}
                    {activeDropdown === project.id && (
                      <div className="absolute right-0 top-full mt-1 w-36 bg-surface border border-border rounded-lg shadow-xl py-1 z-20">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpen(project.id); }}
                          className="w-full text-left px-4 py-2 text-sm text-text hover:bg-primary/5 hover:text-primary flex items-center gap-2 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" /> Open
                        </button>
                        <button 
                          onClick={(e) => handleEdit(e, project)}
                          className="w-full text-left px-4 py-2 text-sm text-text hover:bg-primary/5 hover:text-primary flex items-center gap-2 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <div className="h-px bg-border my-1"></div>
                        <button 
                          onClick={(e) => handleDelete(e, project)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      {/* Edit Project Modal (Reusing CreateProjectModal structure visually if possible, or build simple inline) */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl shadow-xl border border-border w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-text mb-4">Edit Project</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateMutation.mutate({
                id: editingProject.id,
                payload: {
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                }
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Project Name</label>
                  <input 
                    name="name" 
                    defaultValue={editingProject.name} 
                    required 
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Description (Optional)</label>
                  <textarea 
                    name="description" 
                    defaultValue={editingProject.description || ''} 
                    rows={3}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setEditingProject(null)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending} className="bg-primary text-white hover:bg-primary/90">
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
