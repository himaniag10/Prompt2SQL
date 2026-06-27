import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class GlossaryRepository {
  async create(schemaVersionId: string, data: any) {
    return prisma.businessGlossary.create({
      data: {
        ...data,
        schemaVersion: { connect: { id: schemaVersionId } }
      }
    });
  }

  async findById(id: string) {
    return prisma.businessGlossary.findUnique({
      where: { id },
      include: {
        schemaVersion: {
          include: {
            databaseSchema: {
              include: {
                project: true
              }
            }
          }
        }
      }
    });
  }

  async update(id: string, data: any) {
    return prisma.businessGlossary.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.businessGlossary.delete({
      where: { id }
    });
  }
}

export const glossaryRepository = new GlossaryRepository();
