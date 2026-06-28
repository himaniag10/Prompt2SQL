export interface ContextResolutionRequest {
  question: string;
  projectId?: string;
  schemaId?: string;
}

export interface ContextResolutionResponse {
  type: 'success' | 'ambiguous';
  data: PromptData | AmbiguousData;
}

export interface PromptData {
  projectId: string;
  schemaVersionId: string;
  contextString: string;
  prompt: string;
}

export interface AmbiguousData {
  message: string;
  projects: Array<{ id: string; name: string; description: string | null }>;
}

export interface OptimizedSchemaContext {
  dialect: string;
  tables: Array<{
    name: string;
    description: string | null;
    columns: Array<{
      name: string;
      datatype: string;
      description: string | null;
      isPrimaryKey: boolean;
      isForeignKey: boolean;
    }>;
  }>;
  relationships: Array<{
    sourceTable: string;
    sourceColumn: string;
    targetTable: string;
    targetColumn: string;
    type: string;
  }>;
  glossary: Array<{
    term: string;
    definition: string;
  }>;
}
