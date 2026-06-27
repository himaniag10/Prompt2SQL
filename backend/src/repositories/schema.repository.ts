import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class SchemaRepository {
  async create(projectId: string, data: { name: string; description?: string | null }, createdBy: string) {
    return prisma.databaseSchema.create({
      data: {
        ...data,
        project: { connect: { id: projectId } },
        versions: {
          create: {
            versionNumber: 1,
            createdBy,
          }
        }
      },
      include: {
        versions: true,
      }
    });
  }

  async findAllByProjectId(projectId: string) {
    return prisma.databaseSchema.findMany({
      where: { projectId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1
        }
      }
    });
  }

  async findById(id: string) {
    return prisma.databaseSchema.findFirst({
      where: { id, deletedAt: null },
      include: {
        project: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
          include: {
            tables: {
              include: {
                columns: true
              }
            },
            relationships: true,
            businessGlossary: true
          }
        }
      }
    });
  }

  async update(id: string, data: { name?: string; description?: string }) {
    return prisma.databaseSchema.update({
      where: { id },
      data
    });
  }

  async softDelete(id: string) {
    return prisma.databaseSchema.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}

export const schemaRepository = new SchemaRepository();
