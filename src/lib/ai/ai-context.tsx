
import { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { LLMProvider, Message } from './types';
import { OpenRouterProvider } from './openrouter';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type AIProviderId = 'openrouter' | 'grok' | 'google' | 'mock';

export interface AIContextType {
  activeProvider: AIProviderId;
  setProvider: (provider: AIProviderId) => void;
  sendMessage: (messages: Message[]) => Promise<string>;
  streamMessage: (messages: Message[], onChunk: (chunk: string) => void) => Promise<string>;
  availableProviders: AIProviderId[];
}

const AIContext = createContext<AIContextType | null>(null);

export function AIProvider({ children }: { children: ReactNode }) {
  const [activeProvider, setActiveProvider] = useState<AIProviderId>('openrouter');
  
  // Initialize Providers
  // We use refs or singletons to avoid re-instantiating on every render
  const openRouterProvider = useRef(new OpenRouterProvider());
  
  const googleKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const googleClient = googleKey ? new GoogleGenerativeAI(googleKey) : null;
  const googleModel = googleClient ? googleClient.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

  const availableProviders: AIProviderId[] = ['mock'];
  if (import.meta.env.VITE_OPENROUTER_API_KEY) availableProviders.unshift('openrouter');
  if (import.meta.env.VITE_GROK_API_KEY) availableProviders.includes('openrouter') ? availableProviders.splice(1, 0, 'grok') : availableProviders.unshift('grok');
  if (googleKey) availableProviders.includes('grok') ? availableProviders.splice(availableProviders.indexOf('grok') + 1, 0, 'google') : availableProviders.includes('openrouter') ? availableProviders.splice(1, 0, 'google') : availableProviders.unshift('google');
  
  // Ensure strict order if keys exist: OpenRouter -> Grok -> Google -> Mock
  // The push/splice logic above is a bit messy, let's just filter a static list
  const PRIORITY_ORDER: AIProviderId[] = ['openrouter', 'grok', 'google', 'mock'];
  const enabledProviders = PRIORITY_ORDER.filter(p => {
      if (p === 'mock') return true;
      if (p === 'openrouter') return !!import.meta.env.VITE_OPENROUTER_API_KEY;
      if (p === 'grok') return !!import.meta.env.VITE_GROK_API_KEY;
      if (p === 'google') return !!import.meta.env.VITE_GOOGLE_API_KEY;
      return false;
  });

  // Helper to execute a provider call
  const executeProvider = async (
      provider: AIProviderId, 
      messages: Message[], 
      onChunk?: (chunk: string) => void
  ): Promise<string> => {
      switch (provider) {
          case 'openrouter':
              // Explicitly target 'openrouter' to bypass its internal fallback
              if (onChunk) return openRouterProvider.current.streamMessage(messages, onChunk, 'openrouter');
              return openRouterProvider.current.sendMessage(messages, 'openrouter');
          
          case 'grok':
              // Explicitly target 'grok'
              if (onChunk) return openRouterProvider.current.streamMessage(messages, onChunk, 'grok');
              return openRouterProvider.current.sendMessage(messages, 'grok');

          case 'google':
              if (!googleModel) throw new Error("Google AI not configured");
              
              const history = messages.slice(0, -1).map(m => ({
                  role: m.role === 'assistant' ? 'model' : 'user',
                  parts: [{ text: m.content }]
              }));
              const msgContent = messages[messages.length - 1].content;

              if (onChunk) {
                  const chat = googleModel.startChat({ history });
                  const result = await chat.sendMessageStream(msgContent);
                  let fullText = '';
                  for await (const chunk of result.stream) {
                      const text = chunk.text();
                      fullText += text;
                      onChunk(text);
                  }
                  return fullText;
              } else {
                  const chat = googleModel.startChat({ history });
                  const result = await chat.sendMessage(msgContent);
                  return result.response.text();
              }

          case 'mock':
          default:
              if (onChunk) return openRouterProvider.current.streamMessage(messages, onChunk, 'mock');
              return openRouterProvider.current.sendMessage(messages, 'mock');
      }
  };

  const handleChain = async (
      messages: Message[], 
      onChunk?: (chunk: string) => void
  ): Promise<string> => {
      // Start with active provider, then fall through the priority list
      let startIndex = enabledProviders.indexOf(activeProvider);
      if (startIndex === -1) startIndex = 0;

      const chain = enabledProviders.slice(startIndex).concat(enabledProviders.slice(0, startIndex));
      // Actually, standard fallback should just go down the priority list from the current one?
      // Or should it strictly follow Priority Order regardless of current selection?
      // User request: "fallback on failure".
      // If I selected "Grok" and it fails, it should probably try Google, then Mock.
      // So slicing from current index is correct.
      
      // Filter out duplicate 'mock' if it appears due to slicing (it's always last in PRIORITY_ORDER)
      const uniqueChain = Array.from(new Set(chain));

      let lastError: any;

      for (const provider of uniqueChain) {
          try {
              console.log(`Attempting AI Provider: ${provider}`);
              const result = await executeProvider(provider, messages, onChunk);
              
              // If successful and different from active, update active
              if (provider !== activeProvider) {
                  console.log(`Provider switched to ${provider} after success.`);
                  setActiveProvider(provider);
              }
              return result;
          } catch (e) {
              console.warn(`Provider ${provider} failed:`, e);
              lastError = e;
              // Continue to next provider
          }
      }

      throw lastError || new Error("All AI providers failed");
  };

  const sendMessage = async (messages: Message[]) => {
      return handleChain(messages);
  };

  const streamMessage = async (messages: Message[], onChunk: (chunk: string) => void) => {
      return handleChain(messages, onChunk);
  };

  return (
    <AIContext.Provider value={{
      activeProvider,
      setProvider: setActiveProvider,
      sendMessage,
      streamMessage,
      availableProviders: enabledProviders
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) throw new Error("useAI must be used within AIProvider");
  return context;
}
