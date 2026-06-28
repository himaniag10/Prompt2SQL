import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { contextResolutionSchema } from '../validators/ai.validator';
import { contextResolverService } from '../services/ai/context-resolver.service';
import { retrievalEngineService } from '../services/ai/retrieval-engine.service';
import { contextBuilderService } from '../services/ai/context-builder.service';
import { promptBuilderService } from '../services/ai/prompt-builder.service';
import { projectRepository } from '../repositories/project.repository';

export class AiController {
  /**
   * Resolves context for an AI prompt securely.
   * Ensures tenant isolation and returns an optimized prompt string.
   */
  async resolveContext(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // 1. Validate Input
      const parsed = contextResolutionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error.format() });
      }

      const requestPayload = parsed.data;

      // 2. Resolve Project and Schema safely
      let resolutionResult;
      try {
        resolutionResult = await contextResolverService.resolveContext(userId, requestPayload);
      } catch (error: any) {
        if (error.message.includes('403')) {
          return res.status(403).json({ error: 'Forbidden: Access denied or resource not found.' });
        }
        return res.status(400).json({ error: error.message });
      }

      if (resolutionResult.type === 'ambiguous') {
        // Stop here and ask the user to select a project
        return res.status(200).json({
          type: 'ambiguous',
          data: resolutionResult.data
        });
      }

      if (resolutionResult.type !== 'resolved') {
         return res.status(500).json({ error: 'Unexpected resolution result type.' });
      }

      const { projectId, schemaVersionId } = resolutionResult;

      // Fetch the project to get the databaseType
      const project = await projectRepository.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      // 3. Deterministic Retrieval
      const { tables, relationships, businessGlossary } = await retrievalEngineService.retrieveContext(
        schemaVersionId,
        requestPayload.question
      );

      // 4. Build Context
      const optimizedContext = contextBuilderService.buildContext(
        project.databaseType,
        tables as any, // Casts because of relation types included
        relationships as any,
        businessGlossary
      );

      // 5. Build Final Prompt
      const systemInstructions = "You are an expert SQL Assistant. Your task is to generate highly optimized and correct SQL queries based on the provided schema and user question. Ensure the syntax is compatible with the provided SQL Dialect.";
      const finalPrompt = promptBuilderService.buildPrompt(
        systemInstructions,
        optimizedContext,
        requestPayload.question
      );

      return res.status(200).json({
        type: 'success',
        data: {
          projectId,
          schemaVersionId,
          contextString: optimizedContext,
          prompt: finalPrompt
        }
      });
    } catch (error: any) {
      console.error('Error resolving context:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const aiController = new AiController();
