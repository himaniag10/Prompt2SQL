export interface AiProvider {
  /**
   * Generates a response based on the provided prompt.
   * @param prompt The complete prompt to send to the AI.
   * @returns The generated string from the AI.
   */
  generateResponse(prompt: string): Promise<string>;
}
