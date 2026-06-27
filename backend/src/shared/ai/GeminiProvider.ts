import { LLMProvider } from './LLMProvider';

export class GeminiProvider implements LLMProvider {
  async generateText(prompt: string): Promise<string> {
    // Placeholder for future Gemini implementation
    throw new Error('GeminiProvider generateText not implemented yet.');
  }
}
