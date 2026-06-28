import { DatabaseTable, TableColumn, Relationship, BusinessGlossary, DatabaseType } from '@prisma/client';

export class ContextBuilderService {
  /**
   * Packages the retrieved entities into an optimized structured textual context.
   */
  buildContext(
    databaseType: DatabaseType,
    tables: (DatabaseTable & { columns: TableColumn[] })[],
    relationships: (Relationship & { 
      sourceTable: DatabaseTable, 
      sourceColumn: TableColumn, 
      targetTable: DatabaseTable, 
      targetColumn: TableColumn 
    })[],
    glossary: BusinessGlossary[]
  ): string {
    let contextString = `SQL Dialect: ${databaseType}\n\n`;

    // 1. Business Glossary
    if (glossary.length > 0) {
      contextString += `=== Business Glossary ===\n`;
      glossary.forEach(g => {
        contextString += `- ${g.term}: ${g.definition}`;
        if (g.example) {
          contextString += ` (Example: ${g.example})`;
        }
        contextString += `\n`;
      });
      contextString += `\n`;
    }

    // 2. Tables and Columns
    contextString += `=== Schema ===\n`;
    tables.forEach(table => {
      contextString += `Table: ${table.name}\n`;
      if (table.description) {
        contextString += `Description: ${table.description}\n`;
      }
      
      contextString += `Columns:\n`;
      table.columns.forEach(col => {
        let colDef = `  - ${col.name} (${col.datatype})`;
        const flags = [];
        if (col.primaryKey) flags.push('PK');
        if (col.foreignKey) flags.push('FK');
        if (!col.nullable) flags.push('NOT NULL');
        if (col.unique) flags.push('UNIQUE');
        if (flags.length > 0) {
          colDef += ` [${flags.join(', ')}]`;
        }
        if (col.description) {
          colDef += ` : ${col.description}`;
        }
        contextString += `${colDef}\n`;
      });
      contextString += `\n`;
    });

    // 3. Relationships
    if (relationships.length > 0) {
      contextString += `=== Relationships ===\n`;
      relationships.forEach(rel => {
        contextString += `- ${rel.sourceTable.name}.${rel.sourceColumn.name} -> ${rel.targetTable.name}.${rel.targetColumn.name} (${rel.relationshipType})\n`;
      });
      contextString += `\n`;
    }

    return contextString.trim();
  }
}

export const contextBuilderService = new ContextBuilderService();
