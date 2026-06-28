export interface AiProvider {
  /**
   * Generates a response based on the provided prompt.
   * @param prompt The complete prompt to send to the AI.
   * @returns The generated string from the AI.
   */
  generateResponse(prompt: string): Promise<string>;

  /**
   * Generates a streaming response based on the provided prompt.
   * @param prompt The complete prompt to send to the AI.
   * @param onChunk Callback function executed when a new chunk is received.
   * @returns The fully generated string after stream completes.
   */
  generateStream(prompt: string, onChunk: (chunk: string) => void): Promise<string>;
}
