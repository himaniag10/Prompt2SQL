import { GroqProvider } from './providers/groq.provider';
import { GeminiProvider } from './providers/gemini.provider';

export class AiOrchestratorService {
  private groqProvider: GroqProvider;
  private geminiProvider: GeminiProvider;

  constructor() {
    this.groqProvider = new GroqProvider();
    this.geminiProvider = new GeminiProvider();
  }

  /**
   * Generates a response using Groq, falling back to Gemini if it fails.
   */
  private async generateWithFallback(prompt: string): Promise<string> {
    try {
      console.log('Attempting to generate with Groq...');
      return await this.groqProvider.generateResponse(prompt);
    } catch (error) {
      console.warn('Groq failed, falling back to Gemini:', error);
      return await this.geminiProvider.generateResponse(prompt);
    }
  }

  /**
   * Two-step pipeline:
   * 1. Generate SQL
   * 2. Optimize and Explain
   */
  async generateSqlAndExplanation(
    contextString: string,
    question: string,
    history: { role: string; content: string }[]
  ): Promise<{ sql: string; originalSql?: string; optimizedSql?: string; explanation: string }> {
    
    // Step 1: Generate Raw SQL
    const sqlGenerationPrompt = this.buildSqlGenerationPrompt(contextString, question, history);
    const generatedRawSqlText = await this.generateWithFallback(sqlGenerationPrompt);
    
    // Extract SQL if it's wrapped in markdown code blocks
    const rawSql = this.extractSql(generatedRawSqlText);

    // Step 2: Optimize and Explain
    const optimizationPrompt = this.buildOptimizationPrompt(contextString, question, rawSql);
    const optimizedResultText = await this.generateWithFallback(optimizationPrompt);

    // Parse the optimized result
    const optimizedSql = this.extractSql(optimizedResultText) || rawSql;
    const explanation = this.extractExplanation(optimizedResultText) || 'No explanation provided.';

    return {
      sql: optimizedSql,
      originalSql: rawSql,
      optimizedSql: optimizedSql,
      explanation: explanation
    };
  }

  private buildSqlGenerationPrompt(context: string, question: string, history: { role: string; content: string }[]): string {
    let historyString = '';
    if (history.length > 0) {
      historyString = '=== Conversation History ===\n';
      history.forEach(msg => {
        historyString += `${msg.role.toUpperCase()}: ${msg.content}\n`;
      });
      historyString += '\n';
    }

    return `
You are an expert Database Administrator and SQL Developer.
Generate a strictly correct, working SQL query based on the following schema and user request.
Respond ONLY with the SQL query wrapped in \`\`\`sql ... \`\`\` code blocks. Do not explain anything.

${context}

${historyString}
=== Current Request ===
USER: ${question}
`.trim();
  }

  private buildOptimizationPrompt(context: string, question: string, rawSql: string): string {
    return `
You are an expert SQL Optimizer. 
You are given a schema context, the user's goal, and a raw SQL query generated to solve that goal.

Your task is to:
1. OPTIMIZE the SQL query for performance and readability (e.g., proper JOINs, avoid SELECT *, use indexes conceptually, fix redundant logic).
2. EXPLAIN the final optimized query in plain English (1-3 sentences) so the user understands what it does.

Respond exactly in this format:
<optimized_sql>
\`\`\`sql
[Your optimized SQL here]
\`\`\`
</optimized_sql>

<explanation>
[Your plain English explanation here]
</explanation>

${context}

=== User's Goal ===
${question}

=== Raw SQL ===
\`\`\`sql
${rawSql}
\`\`\`
`.trim();
  }

  private extractSql(text: string): string {
    // Try to find SQL inside markdown blocks
    const sqlMatch = text.match(/```sql([\s\S]*?)```/i);
    if (sqlMatch && sqlMatch[1]) {
      return sqlMatch[1].trim();
    }
    // Try generic markdown block
    const genericMatch = text.match(/```([\s\S]*?)```/);
    if (genericMatch && genericMatch[1]) {
      return genericMatch[1].trim();
    }
    return text.trim();
  }

  private extractExplanation(text: string): string {
    const match = text.match(/<explanation>([\s\S]*?)<\/explanation>/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    // Fallback: If no tags are found, try to strip the <optimized_sql> part and return the rest
    const sqlPartMatch = text.match(/<optimized_sql>[\s\S]*?<\/optimized_sql>/i);
    if (sqlPartMatch) {
      return text.replace(sqlPartMatch[0], '').trim();
    }
    return '';
  }
}

export const aiOrchestratorService = new AiOrchestratorService();
