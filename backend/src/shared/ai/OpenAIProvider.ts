import { LLMProvider } from './LLMProvider';

export class OpenAIProvider implements LLMProvider {
  async generateText(prompt: string): Promise<string> {
    // Placeholder for future OpenAI implementation
    throw new Error('OpenAIProvider generateText not implemented yet.');
  }
}
