import api from './api';

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string | null;
  databaseType: 'MYSQL' | 'POSTGRESQL' | 'SQLITE' | 'SQLSERVER' | 'ORACLE';
  createdAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  databaseType: string;
}

// Schema Types
export interface DatabaseSchema {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  versions: SchemaVersion[];
}

export interface SchemaVersion {
  id: string;
  versionNumber: number;
  tables: DatabaseTable[];
  relationships: Relationship[];
  businessGlossary: GlossaryTerm[];
}

// Table Types
export interface DatabaseTable {
  id: string;
  name: string;
  description: string | null;
  columns: TableColumn[];
}

export interface TableColumn {
  id: string;
  tableId: string;
  name: string;
  datatype: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey: boolean;
  unique: boolean;
  defaultValue: string | null;
  description: string | null;
}

// Relationship Types
export interface Relationship {
  id: string;
  sourceTableId: string;
  sourceColumnId: string;
  targetTableId: string;
  targetColumnId: string;
  relationshipType: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY';
}

// Glossary Types
export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  example: string | null;
}


export const SchemaApiService = {
  // Projects
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },
  createProject: async (data: CreateProjectInput): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data;
  },
  updateProject: async (projectId: string, data: { name?: string; description?: string }): Promise<Project> => {
    const response = await api.put(`/projects/${projectId}`, data);
    return response.data;
  },
  deleteProject: async (projectId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}`);
  },
  
  // Schemas
  getSchemas: async (projectId: string): Promise<DatabaseSchema[]> => {
    const response = await api.get(`/projects/${projectId}/schemas`);
    return response.data;
  },
  getSchema: async (schemaId: string): Promise<DatabaseSchema> => {
    const response = await api.get(`/schemas/${schemaId}`);
    return response.data;
  },
  createSchema: async (projectId: string, data: { name: string; description?: string }): Promise<DatabaseSchema> => {
    const response = await api.post(`/projects/${projectId}/schemas`, data);
    return response.data;
  },
  deleteSchema: async (schemaId: string): Promise<void> => {
    await api.delete(`/schemas/${schemaId}`);
  },

  // Tables
  createTable: async (schemaId: string, data: { name: string; description?: string }): Promise<DatabaseTable> => {
    const response = await api.post(`/schemas/${schemaId}/tables`, data);
    return response.data;
  },
  updateTable: async (tableId: string, data: { name?: string; description?: string }): Promise<DatabaseTable> => {
    const response = await api.put(`/tables/${tableId}`, data);
    return response.data;
  },
  deleteTable: async (tableId: string): Promise<void> => {
    await api.delete(`/tables/${tableId}`);
  },

  // Columns
  createColumn: async (tableId: string, data: any): Promise<TableColumn> => {
    const response = await api.post(`/tables/${tableId}/columns`, data);
    return response.data;
  },
  updateColumn: async (columnId: string, data: any): Promise<TableColumn> => {
    const response = await api.put(`/columns/${columnId}`, data);
    return response.data;
  },
  deleteColumn: async (columnId: string): Promise<void> => {
    await api.delete(`/columns/${columnId}`);
  },

  // Relationships
  createRelationship: async (schemaId: string, data: any): Promise<Relationship> => {
    const response = await api.post(`/schemas/${schemaId}/relationships`, data);
    return response.data;
  },
  deleteRelationship: async (relationshipId: string): Promise<void> => {
    await api.delete(`/relationships/${relationshipId}`);
  },

  // Glossary
  createGlossaryTerm: async (schemaId: string, data: { term: string; definition: string; example?: string }): Promise<GlossaryTerm> => {
    const response = await api.post(`/schemas/${schemaId}/glossary`, data);
    return response.data;
  },
  deleteGlossaryTerm: async (termId: string): Promise<void> => {
    await api.delete(`/glossary/${termId}`);
  }
};
