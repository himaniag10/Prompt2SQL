import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RetrievalEngineService {
  /**
   * Deterministically retrieves relevant tables, columns, relationships, and glossary terms
   * based on the user's question.
   */
  async retrieveContext(schemaVersionId: string, question: string) {
    // 1. Fetch all schema metadata for the version
    const schemaVersion = await prisma.schemaVersion.findUnique({
      where: { id: schemaVersionId },
      include: {
        tables: {
          include: {
            columns: true
          }
        },
        relationships: {
          include: {
            sourceTable: true,
            sourceColumn: true,
            targetTable: true,
            targetColumn: true
          }
        },
        businessGlossary: true
      }
    });

    if (!schemaVersion) {
      throw new Error('Schema version not found.');
    }

    const questionLower = question.toLowerCase();

    // 2. Perform Keyword Extraction/Matching
    // (A more advanced tokenizer could be used, but simple substring matching works for now)
    const tokens = questionLower.split(/[\s,.'"?]+/).filter(t => t.length > 2);

    const isMatch = (text: string | null | undefined) => {
      if (!text) return false;
      const lower = text.toLowerCase();
      // Match if the word exactly exists, or if a token is a substantive substring
      return tokens.some(token => lower.includes(token));
    };

    const relevantTables = new Set<string>();
    const relevantGlossary = new Set<string>();

    // Check Glossary
    for (const term of schemaVersion.businessGlossary) {
      if (isMatch(term.term) || isMatch(term.definition)) {
        relevantGlossary.add(term.id);
      }
    }

    // Check Tables & Columns
    for (const table of schemaVersion.tables) {
      let tableMatched = isMatch(table.name) || isMatch(table.description);
      
      for (const column of table.columns) {
        if (isMatch(column.name) || isMatch(column.description)) {
          tableMatched = true;
          break;
        }
      }

      if (tableMatched) {
        relevantTables.add(table.id);
      }
    }

    // 3. Traverse Relationship Graph
    // If Table A is relevant, and it has a foreign key to Table B, we might need Table B to resolve queries.
    // For now, we'll do a simple 1-degree traversal: include any table that is connected to a relevant table.
    let addedNewTables = true;
    while (addedNewTables) {
      addedNewTables = false;
      for (const rel of schemaVersion.relationships) {
        const sourceRelevant = relevantTables.has(rel.sourceTableId);
        const targetRelevant = relevantTables.has(rel.targetTableId);

        if (sourceRelevant && !targetRelevant) {
          relevantTables.add(rel.targetTableId);
          addedNewTables = true;
        } else if (targetRelevant && !sourceRelevant) {
          relevantTables.add(rel.sourceTableId);
          addedNewTables = true;
        }
      }
    }

    // If no tables matched, fallback to including ALL tables (or return an error in strict mode)
    // To be safe for general queries like "show me everything", if the Set is empty, include all.
    if (relevantTables.size === 0) {
      schemaVersion.tables.forEach(t => relevantTables.add(t.id));
    }

    // 4. Build Filtered Context
    const filteredTables = schemaVersion.tables.filter(t => relevantTables.has(t.id));
    const filteredRelationships = schemaVersion.relationships.filter(
      r => relevantTables.has(r.sourceTableId) && relevantTables.has(r.targetTableId)
    );
    const filteredGlossary = schemaVersion.businessGlossary.filter(g => relevantGlossary.has(g.id));

    return {
      tables: filteredTables,
      relationships: filteredRelationships,
      businessGlossary: filteredGlossary
    };
  }
}

export const retrievalEngineService = new RetrievalEngineService();
