import { glossaryRepository } from '../repositories/glossary.repository';
import { schemaService } from './schema.service';
import { CreateGlossaryInput, UpdateGlossaryInput } from '../validators/glossary.validator';

export class GlossaryService {
  async createGlossary(userId: string, schemaId: string, data: CreateGlossaryInput) {
    const schema = await schemaService.getSchemaById(userId, schemaId); // verifies ownership
    if (schema.versions.length === 0) {
      throw new Error('Schema has no versions');
    }
    const latestVersionId = schema.versions[0].id;
    
    try {
      return await glossaryRepository.create(latestVersionId, data);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error(`Glossary term '${data.term}' already exists in this schema.`);
      }
      throw error;
    }
  }

  async getGlossaryById(userId: string, glossaryId: string) {
    const glossary = await glossaryRepository.findById(glossaryId);
    if (!glossary) throw new Error('Glossary term not found');
    
    // Verify user owns the project
    if (glossary.schemaVersion.databaseSchema.project.ownerId !== userId) {
      throw new Error('Unauthorized');
    }
    
    return glossary;
  }

  async updateGlossary(userId: string, glossaryId: string, data: UpdateGlossaryInput) {
    const glossary = await this.getGlossaryById(userId, glossaryId); // verifies ownership
    try {
      return await glossaryRepository.update(glossary.id, data);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error(`Glossary term '${data.term}' already exists in this schema.`);
      }
      throw error;
    }
  }

  async deleteGlossary(userId: string, glossaryId: string) {
    const glossary = await this.getGlossaryById(userId, glossaryId); // verifies ownership
    return glossaryRepository.delete(glossary.id);
  }
}

export const glossaryService = new GlossaryService();
