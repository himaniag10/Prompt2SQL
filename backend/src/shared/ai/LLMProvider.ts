export interface LLMProvider {
  generateText(prompt: string): Promise<string>;
}
