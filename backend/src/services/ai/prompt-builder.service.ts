export class PromptBuilderService {
  /**
   * Combines system instructions, the optimized context string, and the user's question
   * into a final prompt ready for an LLM.
   */
  buildPrompt(systemInstructions: string, context: string, question: string): string {
    return `
${systemInstructions}

${context}

=== User Request ===
${question}
`.trim();
  }
}

export const promptBuilderService = new PromptBuilderService();
