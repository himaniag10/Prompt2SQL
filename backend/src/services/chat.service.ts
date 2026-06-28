import { PrismaClient, MessageRole } from '@prisma/client';

const prisma = new PrismaClient();

export class ChatService {
  /**
   * Retrieves all chats for a specific project.
   */
  async getChatsByProject(projectId: string) {
    return prisma.chat.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' }
    });
  }

  /**
   * Retrieves a chat by ID, ensuring it belongs to a project the user owns.
   */
  async getChatByIdAndUser(chatId: string, userId: string) {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        project: { ownerId: userId }
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        chatState: true
      }
    });

    if (!chat) {
      throw new Error('403 Forbidden: Chat not found or access denied.');
    }
    return chat;
  }

  /**
   * Creates a new chat.
   */
  async createChat(projectId: string, schemaVersionId: string, title: string) {
    return prisma.chat.create({
      data: {
        projectId,
        schemaVersionId,
        title,
        chatState: {
          create: {}
        }
      }
    });
  }

  /**
   * Appends a message to a chat.
   */
  async addMessage(chatId: string, role: MessageRole, content: string, metadata?: any) {
    return prisma.message.create({
      data: {
        chatId,
        role,
        content,
        metadata: metadata ? metadata : undefined
      }
    });
  }
  /**
   * Renames a chat.
   */
  async renameChat(chatId: string, userId: string, title: string) {
    // Verify ownership implicitly via getChatByIdAndUser
    await this.getChatByIdAndUser(chatId, userId);
    return prisma.chat.update({
      where: { id: chatId },
      data: { title }
    });
  }

  /**
   * Deletes a chat.
   */
  async deleteChat(chatId: string, userId: string) {
    await this.getChatByIdAndUser(chatId, userId);
    return prisma.chat.delete({
      where: { id: chatId }
    });
  }
}

export const chatService = new ChatService();
