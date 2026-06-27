import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class RelationshipRepository {
  async create(schemaVersionId: string, data: any) {
    return prisma.relationship.create({
      data: {
        ...data,
        schemaVersion: { connect: { id: schemaVersionId } }
      }
    });
  }

  async findById(id: string) {
    return prisma.relationship.findUnique({
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
    return prisma.relationship.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.relationship.delete({
      where: { id }
    });
  }
}

export const relationshipRepository = new RelationshipRepository();
