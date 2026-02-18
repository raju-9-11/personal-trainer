
import { LLMProvider, Message } from './types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Default to a model known for good reasoning and chat capabilities
const DEFAULT_MODEL = 'deepseek/deepseek-chat';

export class OpenRouterProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_OPENROUTER_API_KEY || '';
    this.model = model || DEFAULT_MODEL;

    if (!this.apiKey) {
      console.warn('OpenRouter API Key is missing. The therapist feature will not work correctly.');
    }
  }

  async sendMessage(messages: Message[]): Promise<string> {
    if (!this.apiKey) throw new Error("OpenRouter API Key not configured");

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Personal Therapist App',
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error("SendMessage failed:", error);
      throw error;
    }
  }

  async streamMessage(messages: Message[], onChunk: (chunk: string) => void): Promise<string> {
    if (!this.apiKey) throw new Error("OpenRouter API Key not configured");

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Personal Therapist App',
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        stream: true,
      })
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last line in the buffer if it's incomplete
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            try {
              const jsonStr = trimmed.substring(6);
              const json = JSON.parse(jsonStr);
              const content = json.choices?.[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                onChunk(content);
              }
            } catch (e) {
              console.warn('Error parsing stream chunk', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream reading failed', error);
      throw error;
    } finally {
      reader.releaseLock();
    }

    return fullResponse;
  }
}
