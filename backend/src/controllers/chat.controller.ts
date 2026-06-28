import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { chatService } from '../services/chat.service';
import { aiOrchestratorService } from '../services/ai/ai-orchestrator.service';
import { contextResolverService } from '../services/ai/context-resolver.service';
import { retrievalEngineService } from '../services/ai/retrieval-engine.service';
import { contextBuilderService } from '../services/ai/context-builder.service';
import { projectRepository } from '../repositories/project.repository';
import { MessageRole } from '@prisma/client';

export class ChatController {
  
  async getProjectChats(req: AuthRequest, res: Response) {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });
    
    try {
      const chats = await chatService.getChatsByProject(projectId as string);
      return res.status(200).json(chats);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getChat(req: AuthRequest, res: Response) {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const chat = await chatService.getChatByIdAndUser(req.params.id, userId);
      return res.status(200).json(chat);
    } catch (error: any) {
      if (error.message.includes('403')) return res.status(403).json({ error: error.message });
      return res.status(500).json({ error: error.message });
    }
  }

  async sendMessage(req: AuthRequest, res: Response) {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { content, projectId, schemaId, chatId: reqChatId } = req.body;
    if (!content) return res.status(400).json({ error: 'Message content is required.' });

    try {
      let chatId = reqChatId;
      let chat: any = null;

      // 1. Context Resolution & Chat Initialization
      if (chatId) {
        chat = await chatService.getChatByIdAndUser(chatId, userId);
      } else {
        // Resolve project and schema if starting a new chat
        const resolution = await contextResolverService.resolveContext(userId, { question: content, projectId, schemaId });
        
        if (resolution.type === 'ambiguous') {
          return res.status(200).json({ type: 'ambiguous', data: resolution.data });
        }
        
        if (resolution.type !== 'resolved') return res.status(500).json({ error: 'Unexpected error.' });

        const newTitle = content.length > 30 ? content.substring(0, 30) + '...' : content;
        chat = await chatService.createChat(resolution.projectId, resolution.schemaVersionId, newTitle);
        chatId = chat.id;
        // Make chat structure similar to fetched chat
        chat.messages = [];
        chat.projectId = resolution.projectId;
        chat.schemaVersionId = resolution.schemaVersionId;
      }

      // 2. Add User Message to DB
      await chatService.addMessage(chatId, MessageRole.USER, content);

      // 3. Build Context
      const project = await projectRepository.findById(chat.projectId);
      if (!project) throw new Error('Project not found');

      const { tables, relationships, businessGlossary } = await retrievalEngineService.retrieveContext(
        chat.schemaVersionId,
        content
      );

      const contextString = contextBuilderService.buildContext(
        project.databaseType,
        tables as any,
        relationships as any,
        businessGlossary
      );

      // 4. Call AI Pipeline (Generate SQL -> Optimize & Explain)
      const formattedHistory = chat.messages.map((m: any) => ({ role: m.role, content: m.content }));
      const aiResponse = await aiOrchestratorService.generateSqlAndExplanation(contextString, content, formattedHistory);

      // 5. Combine and format the AI's response
      let finalAiMessageContent = '';
      if (aiResponse.originalSql && aiResponse.optimizedSql && aiResponse.originalSql !== aiResponse.optimizedSql) {
        finalAiMessageContent += `**Original SQL**\n\`\`\`sql\n${aiResponse.originalSql}\n\`\`\`\n\n`;
        finalAiMessageContent += `**Optimized SQL**\n\`\`\`sql\n${aiResponse.optimizedSql}\n\`\`\`\n\n`;
      } else if (aiResponse.optimizedSql) {
        finalAiMessageContent += `\`\`\`sql\n${aiResponse.optimizedSql}\n\`\`\`\n\n`;
      } else if (aiResponse.sql && aiResponse.sql.length > 0) {
        finalAiMessageContent += `\`\`\`sql\n${aiResponse.sql}\n\`\`\`\n\n`;
      }
      finalAiMessageContent += aiResponse.explanation;

      // 6. Save AI Message
      const aiMessage = await chatService.addMessage(chatId, MessageRole.ASSISTANT, finalAiMessageContent);

      return res.status(200).json({
        type: 'success',
        chatId: chat.id,
        message: aiMessage,
        context: {
          tables: tables?.map((t: any) => t.name) || [],
          relationships: relationships?.map((r: any) => `${r.fromTable}->${r.toTable}`) || []
        }
      });

    } catch (error: any) {
      console.error('Chat Error:', error);
      if (error.message.includes('403')) return res.status(403).json({ error: error.message });
      if (error.message.includes('No projects found') || error.message.includes('No schemas found') || error.message.includes('No schema versions found')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to process chat message.' });
    }
  }

  async renameChat(req: AuthRequest, res: Response) {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    try {
      const chat = await chatService.renameChat(req.params.id, userId, title);
      return res.status(200).json(chat);
    } catch (error: any) {
      if (error.message.includes('403')) return res.status(403).json({ error: error.message });
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteChat(req: AuthRequest, res: Response) {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
      await chatService.deleteChat(req.params.id, userId);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      if (error.message.includes('403')) return res.status(403).json({ error: error.message });
      return res.status(500).json({ error: error.message });
    }
  }
}

export const chatController = new ChatController();
