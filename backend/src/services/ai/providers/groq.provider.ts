import { AiProvider } from './ai-provider.interface';

export class GroqProvider implements AiProvider {
  private readonly baseUrl = 'https://api.groq.com/openai/v1';

  async generateResponse(prompt: string): Promise<string> {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is missing in environment variables.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }

      throw new Error('Unexpected API response format');
    } catch (error: any) {
      console.error('Groq Provider Error:', error);
      throw new Error(`Groq failed to generate response: ${error.message}`);
    }
  }
}
