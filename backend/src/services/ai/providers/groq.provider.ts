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
          model: 'llama-3.3-70b-versatile',
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

  async generateStream(prompt: string, onChunk: (chunk: string) => void): Promise<string> {
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
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          stream: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is not readable');
      
      const decoder = new TextDecoder('utf-8');
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (dataStr === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(dataStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                onChunk(content);
              }
            } catch (e) {
              console.error('Failed to parse SSE line:', line);
            }
          }
        }
      }

      return fullContent;
    } catch (error: any) {
      console.error('Groq Provider Stream Error:', error);
      throw new Error(`Groq failed to stream response: ${error.message}`);
    }
  }
}
