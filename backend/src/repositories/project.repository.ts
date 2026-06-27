import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class ProjectRepository {
  async create(data: any) {
    return prisma.project.create({ data });
  }

  async findAllByUserId(userId: string) {
    return prisma.project.findMany({
      where: { ownerId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.project.findFirst({
      where: { id, deletedAt: null }
    });
  }

  async update(id: string, data: any) {
    return prisma.project.update({
      where: { id },
      data
    });
  }

  async softDelete(id: string) {
    return prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}

export const projectRepository = new ProjectRepository();
