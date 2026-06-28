import { AiProvider } from './ai-provider.interface';
// @ts-ignore
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProvider implements AiProvider {
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-1.5-flash for speed or gemini-1.5-pro for complex queries
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
}
