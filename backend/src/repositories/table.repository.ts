import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class TableRepository {
  async create(schemaVersionId: string, data: any) {
    return prisma.databaseTable.create({
      data: {
        ...data,
        schemaVersion: { connect: { id: schemaVersionId } }
      }
    });
  }

  async findById(id: string) {
    return prisma.databaseTable.findUnique({
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
    return prisma.databaseTable.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.databaseTable.delete({
      where: { id }
    });
  }
}

export const tableRepository = new TableRepository();
