
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  prompt: string; // The system prompt for this persona
}

export interface BaseContext {
  childhood: string;
  trauma: string;
  identity: string;
  history: string;
  goals: string;
  // This might grow as sessions progress
}

export interface SessionSummary {
  date: string;
  summary: string;
  keyInsights: string[];
}

export interface TherapistProfile {
  encryptedContext: string; // JSON string of BaseContext + Persona ID
  personaId: string;
  lastSessionDate?: string;
}

export interface LLMProvider {
  sendMessage(messages: Message[]): Promise<string>;
  streamMessage(messages: Message[], onChunk: (chunk: string) => void): Promise<string>;
}
