import { AiProvider } from './ai-provider.interface';
// @ts-ignore
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProvider implements AiProvider {
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-flash-latest as a fallback
    this.model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  }

  async generateResponse(prompt: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing in environment variables.');
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Gemini Provider Error:', error);
      throw new Error(`Gemini failed to generate response: ${error.message}`);
    }
  }

  async generateStream(prompt: string, onChunk: (chunk: string) => void): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing in environment variables.');
    }

    try {
      const result = await this.model.generateContentStream(prompt);
      let fullContent = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullContent += chunkText;
        onChunk(chunkText);
      }
      return fullContent;
    } catch (error: any) {
      console.error('Gemini Provider Stream Error:', error);
      throw new Error(`Gemini failed to stream response: ${error.message}`);
    }
  }
}
