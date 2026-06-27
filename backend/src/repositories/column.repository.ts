import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class ColumnRepository {
  async create(tableId: string, data: any) {
    return prisma.tableColumn.create({
      data: {
        ...data,
        table: { connect: { id: tableId } }
      }
    });
  }

  async findById(id: string) {
    return prisma.tableColumn.findUnique({
      where: { id },
      include: {
        table: {
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
        }
      }
    });
  }

  async update(id: string, data: any) {
    return prisma.tableColumn.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.tableColumn.delete({
      where: { id }
    });
  }
}

export const columnRepository = new ColumnRepository();
