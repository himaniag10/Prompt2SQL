import { projectRepository } from '../repositories/project.repository';
import { CreateProjectInput, UpdateProjectInput } from '../validators/project.validator';

export class ProjectService {
  async createProject(userId: string, data: CreateProjectInput) {
    return projectRepository.create({
      ...data,
      owner: { connect: { id: userId } }
    });
  }

  async getProjects(userId: string) {
    return projectRepository.findAllByUserId(userId);
  }

  async getProjectById(userId: string, projectId: string) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new Error('Project not found');
    if (project.ownerId !== userId) throw new Error('Unauthorized');
    return project;
  }

  async updateProject(userId: string, projectId: string, data: UpdateProjectInput) {
    const project = await this.getProjectById(userId, projectId); // verifies ownership
    return projectRepository.update(project.id, data);
  }

  async deleteProject(userId: string, projectId: string) {
    const project = await this.getProjectById(userId, projectId); // verifies ownership
    return projectRepository.softDelete(project.id);
  }
}

export const projectService = new ProjectService();
