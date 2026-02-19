
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type TherapyMode = 'intake' | 'analysis' | 'selection' | 'session';

export type Gender = 'female' | 'male' | 'non-binary';

export interface TherapistArchetype {
  id: string;
  name: string; // Internal name e.g. "The Analyst"
  basePrompt: string; // The core personality instructions
  traits: string[];
}

export interface GeneratedTherapist {
  id: string;
  name: string;
  gender: Gender;
  archetypeId: string;
  role: string; // displayed role e.g. "Clinical Psychologist"
  description: string; // "I specialize in..."
  systemPrompt: string; // The final compiled prompt with user context
  greeting: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  prompt: string; // The system prompt for this persona
}

export interface BaseContext {
  // Structured data extracted from intake
  childhood?: string;
  trauma?: string;
  identity?: string;
  history?: string;
  goals?: string;
  communicationStyle?: string;
  // Raw chat history of intake
  intakeTranscript?: Message[];
}

export interface SessionSummary {
  date: string;
  summary: string;
  keyInsights: string[];
}

export interface TherapistProfile {
  encryptedContext: string; // JSON string of BaseContext + GeneratedTherapist
  therapistId?: string; // Legacy or for quick lookup
  lastSessionDate?: string;
}

export interface LLMProvider {
  sendMessage(messages: Message[]): Promise<string>;
  streamMessage(messages: Message[], onChunk: (chunk: string) => void): Promise<string>;
}
