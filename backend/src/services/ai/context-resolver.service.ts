import { projectRepository } from '../../repositories/project.repository';
import { schemaRepository } from '../../repositories/schema.repository';
import { ContextResolutionRequest, ContextResolutionResponse, AmbiguousData } from '../../types/ai.types';

export class ContextResolverService {
  /**
   * Resolves the project and schema version ID based on the context request.
   * Ensures strict tenant isolation by only searching projects owned by userId.
   */
  async resolveContext(
    userId: string,
    request: ContextResolutionRequest
  ): Promise<ContextResolutionResponse | { type: 'resolved'; projectId: string; schemaVersionId: string }> {
    const projects = await projectRepository.findAllByUserId(userId);
    
    if (projects.length === 0) {
      throw new Error('No projects found. Please create a project first.');
    }

    let resolvedProjectId = request.projectId;

    // 1. Resolve Project
    if (resolvedProjectId) {
      // Validate ownership
      const project = projects.find(p => p.id === resolvedProjectId);
      if (!project) {
        throw new Error('403 Forbidden: Project not found or access denied.');
      }
    } else {
      // Try to determine project from question or defaults
      const questionLower = request.question.toLowerCase();
      const matchedProjects = projects.filter(p => questionLower.includes(p.name.toLowerCase()));

      if (matchedProjects.length === 1) {
        resolvedProjectId = matchedProjects[0].id;
      } else if (projects.length === 1) {
        resolvedProjectId = projects[0].id;
      } else {
        // Ambiguous context
        const ambiguousData: AmbiguousData = {
          message: 'I found multiple projects. Which project would you like to use?',
          projects: projects.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description
          }))
        };
        return { type: 'ambiguous', data: ambiguousData };
      }
    }

    // 2. Resolve Schema
    let resolvedSchemaVersionId: string | null = null;
    const schemas = await schemaRepository.findAllByProjectId(resolvedProjectId);
    
    if (schemas.length === 0) {
      throw new Error('No schemas found for the selected project. Please create a schema first.');
    }

    if (request.schemaId) {
      const schema = schemas.find(s => s.id === request.schemaId);
      if (!schema) {
        throw new Error('403 Forbidden: Schema not found or access denied.');
      }
      if (schema.versions.length > 0) {
        resolvedSchemaVersionId = schema.versions[0].id; // Get latest version
      } else {
        throw new Error('No schema versions found.');
      }
    } else {
      // Try to match schema by name or use default
      const questionLower = request.question.toLowerCase();
      const matchedSchemas = schemas.filter(s => questionLower.includes(s.name.toLowerCase()));

      let selectedSchema = null;
      if (matchedSchemas.length === 1) {
        selectedSchema = matchedSchemas[0];
      } else {
        // Just use the first one if not explicitly defined and multiple don't match
        // Or if there's only one schema, use it. Usually there is a "Public" schema.
        selectedSchema = schemas[0];
      }
      
      if (selectedSchema.versions.length > 0) {
        resolvedSchemaVersionId = selectedSchema.versions[0].id;
      } else {
        throw new Error('No schema versions found.');
      }
    }

    return {
      type: 'resolved',
      projectId: resolvedProjectId,
      schemaVersionId: resolvedSchemaVersionId
    };
  }
}

export const contextResolverService = new ContextResolverService();
