
import { Message } from '../types';
import { ModelMetadata, ModelTier, EngineConfig, OrchestratorState } from './types';
import { ModelRegistry } from './ModelRegistry';

export class Orchestrator {
  private config: EngineConfig;
  private state: OrchestratorState;

  constructor(config: EngineConfig) {
    this.config = config;
    this.state = {
      activeModelId: config.preferredModelId || 'deepseek/deepseek-chat',
      currentTier: ModelTier.S_REASONING,
      failureCount: 0,
      provider: 'openrouter',
      isAutoScaling: true
    };
  }

  async sendMessage(messages: Message[], onChunk?: (chunk: string) => void): Promise<string> {
    if (this.config.isMockMode) {
        return this.mockResponse(messages, onChunk);
    }

    try {
      const response = await this.executeRequest(messages, onChunk);
      // Reset failure count on success
      this.state.failureCount = 0;
      return response;
    } catch (e) {
      console.warn("Orchestrator: Primary attempt failed", e);
      this.state.failureCount++;
      
      return await this.handleFallback(messages, onChunk);
    }
  }

  private async executeRequest(messages: Message[], onChunk?: (chunk: string) => void): Promise<string> {
    // Current implementation uses OpenRouter primarily
    const url = 'https://openrouter.ai/api/v1/chat/completions';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Personal Therapist SDK',
      },
      body: JSON.stringify({
        model: this.state.activeModelId,
        messages: messages,
        stream: !!onChunk,
      })
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    if (onChunk) {
        return await this.readStream(response, onChunk);
    } else {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }
  }

  private async handleFallback(messages: Message[], onChunk?: (chunk: string) => void): Promise<string> {
    // 1. More than one failure -> Switch to Cheapest (Tier B)
    if (this.state.failureCount > 1) {
       const cheapModel = ModelRegistry.getBestModel(ModelTier.B_ECONOMY);
       if (cheapModel) {
           console.log(`Fallback: Switching to Economy Model: ${cheapModel.id}`);
           this.state.activeModelId = cheapModel.id;
           this.state.currentTier = ModelTier.B_ECONOMY;
       }
    } 
    // 2. If Tier B fails or we need specific requested fallbacks
    else if (this.state.failureCount > 2) {
        // Force Grok-4-fast or equivalent if available in registry
        // For now, let's try to find it
        const all = ModelRegistry.getAllModels();
        const grokFast = all.find(m => m.id.includes('grok') && m.id.includes('fast'));
        if (grokFast) {
            this.state.activeModelId = grokFast.id;
        } else if (this.config.grokKey) {
            // Switch to Native Grok Provider
            this.state.provider = 'grok';
            return await this.executeGrokNative(messages, onChunk);
        }
    }

    // Last resort: Google
    if (this.state.failureCount > 3 && this.config.googleKey) {
        this.state.provider = 'google';
        return await this.executeGoogleNative(messages, onChunk);
    }

    // Try one more time with current settings if we haven't exhausted options
    if (this.state.failureCount < 5) {
        return await this.executeRequest(messages, onChunk);
    }

    return this.mockResponse(messages, onChunk);
  }

  // Native Provider stubs (to be fully implemented if needed)
  private async executeGrokNative(messages: Message[], onChunk?: (chunk: string) => void): Promise<string> {
      console.log("Fallback: Using Native Grok API");
      // Implementation logic similar to existing openrouter.ts fetchGrok
      return "Native Grok Response (Stub)";
  }

  private async executeGoogleNative(messages: Message[], onChunk?: (chunk: string) => void): Promise<string> {
      console.log("Fallback: Using Native Google API");
      return "Native Google Response (Stub)";
  }

  private async readStream(response: Response, onChunk: (chunk: string) => void): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader");
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const content = data.choices?.[0]?.delta?.content || '';
              if (content) {
                fullText += content;
                onChunk(content);
              }
            } catch (e) {
              // Ignore malformed partial chunks
            }
          }
        }
      }

      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const content = data.choices?.[0]?.delta?.content || '';
            if (content) {
              fullText += content;
              onChunk(content);
            }
          } catch (e) {
            // Ignore malformed trailing buffer
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (!fullText.trim()) {
      throw new Error("Empty stream response");
    }
    return fullText;
  }

  private async mockResponse(messages: Message[], onChunk?: (chunk: string) => void): Promise<string> {
      const text = "This is a mock response from the Orchestrator.";
      if (onChunk) {
          for (const word of text.split(' ')) {
              onChunk(word + ' ');
              await new Promise(r => setTimeout(r, 50));
          }
      }
      return text;
  }

  getState(): OrchestratorState {
      return this.state;
  }
}
