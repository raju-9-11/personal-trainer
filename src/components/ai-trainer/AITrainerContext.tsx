import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { encryptData, decryptData } from '../../lib/encryption';
import { useAuth } from '../../lib/auth-context';
import { FirebaseDataService } from '../../lib/services/firebase-service';
import { AITrainerProfile, HealthDataLog, WorkoutPlan } from '../../lib/types';
import { Message } from '../../lib/ai/types';
import { useAI } from '../../lib/ai/ai-context';
import { generateAITrainerPrompt } from '../../lib/ai/ai-trainer-personas';

interface EncryptedTrainerData {
  encryptedProfile: string;
  ivProfile: string;
  saltProfile: string;

  encryptedHealthLogs: string;
  ivLogs: string;
  saltLogs: string;

  encryptedChatHistory: string;
  ivChat: string;
  saltChat: string;
}

interface AITrainerState {
  isLocked: boolean;
  hasProfile: boolean;
  isLoading: boolean;
  error: string | null;
  profile: AITrainerProfile | null;
  healthLogs: HealthDataLog[];
  chatHistory: Message[];
  predictedPerformance: number | null;
  dailyQuote: string | null;
}

interface AITrainerContextType extends AITrainerState {
  unlock: (password: string) => Promise<boolean>;
  setupProfile: (password: string, profile: AITrainerProfile) => Promise<boolean>;
  logHealthData: (log: HealthDataLog) => Promise<void>;
  sendMessageToTrainer: (content: string) => Promise<void>;
  lock: () => void;
}

const AITrainerContext = createContext<AITrainerContextType | null>(null);

export const AITrainerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { streamMessage, isInitialized } = useAI();
  const [state, setState] = useState<AITrainerState>({
    isLocked: true,
    hasProfile: false,
    isLoading: true,
    error: null,
    profile: null,
    healthLogs: [],
    chatHistory: [],
    predictedPerformance: null,
    dailyQuote: null,
  });

  const passwordRef = useRef<string | null>(null);
  const SESSION_KEY = 'ai_trainer_session_pwd';

  // Check if user has an existing encrypted profile
  useEffect(() => {
    const checkStatus = async () => {
      if (!user) {
        setState(s => ({ ...s, isLoading: false, isLocked: true }));
        return;
      }

      setState(s => ({ ...s, isLoading: true, error: null }));
      try {
        const db = new FirebaseDataService(user);
        const data = await db.getAITrainerData(user.uid);
        
        // Session Recovery: Try to auto-unlock if password exists in session
        const sessionPwd = sessionStorage.getItem(`${SESSION_KEY}_${user.uid}`);
        
        if (data && data.encryptedProfile) {
          if (sessionPwd) {
            // Attempt silent unlock
            const unlocked = await unlock(sessionPwd, true);
            if (!unlocked) {
                // If silent unlock fails (maybe session key is invalid/expired), stay locked
                setState(s => ({ ...s, hasProfile: true, isLocked: true, isLoading: false }));
            }
          } else {
            setState(s => ({ ...s, hasProfile: true, isLocked: true, isLoading: false }));
          }
        } else {
          setState(s => ({ ...s, hasProfile: false, isLocked: false, isLoading: false })); 
        }
      } catch (e: any) {
        setState(s => ({ ...s, error: e.message || "Failed to check status", isLoading: false }));
      }
    };

    checkStatus();
  }, [user]);

  // First Contact Protocol
  useEffect(() => {
     if (isInitialized && !state.isLocked && state.profile && state.chatHistory.length === 0 && !state.isLoading) {
         sendMessageToTrainer(`[SYSTEM: Initial Greeting. Introduce yourself strictly acting as the AI Trainer with the traits: ${state.profile.traits.join(', ')}. Keep it brief, acknowledge the user's goal (${state.profile.goals[0] || 'getting fit'}), and ask a follow-up question to start.]`);
     }
  }, [isInitialized, state.isLocked, state.profile, state.chatHistory.length, state.isLoading]);

  const saveData = async (profile: AITrainerProfile, logs: HealthDataLog[], chat: Message[], pwd?: string) => {
    if (!user) throw new Error("Not logged in");
    const activePassword = pwd || passwordRef.current;
    if (!activePassword) throw new Error("No password available for encryption");

    const db = new FirebaseDataService(user);

    const encProfile = await encryptData(JSON.stringify(profile), activePassword);
    const encLogs = await encryptData(JSON.stringify(logs), activePassword);
    const encChat = await encryptData(JSON.stringify(chat), activePassword);

    const payload: EncryptedTrainerData = {
      encryptedProfile: encProfile.ciphertext,
      ivProfile: encProfile.iv,
      saltProfile: encProfile.salt,

      encryptedHealthLogs: encLogs.ciphertext,
      ivLogs: encLogs.iv,
      saltLogs: encLogs.salt,

      encryptedChatHistory: encChat.ciphertext,
      ivChat: encChat.iv,
      saltChat: encChat.salt,
    };

    await db.saveAITrainerData(user.uid, payload);
  };

  const unlock = async (password: string, isSilent = false): Promise<boolean> => {
    if (!user) throw new Error("Not logged in");
    if (!isSilent) setState(s => ({ ...s, isLoading: true, error: null }));

    try {
      const db = new FirebaseDataService(user);
      const data = await db.getAITrainerData(user.uid) as EncryptedTrainerData;
      if (!data || !data.encryptedProfile) throw new Error("No profile found");

      const decProfileStr = await decryptData({
        ciphertext: data.encryptedProfile,
        iv: data.ivProfile,
        salt: data.saltProfile
      }, password);
      const profile = JSON.parse(decProfileStr) as AITrainerProfile;

      // ... rest of decryption logic
      let logs: HealthDataLog[] = [];
      if (data.encryptedHealthLogs) {
        const decLogsStr = await decryptData({
          ciphertext: data.encryptedHealthLogs,
          iv: data.ivLogs,
          salt: data.saltLogs
        }, password);
        logs = JSON.parse(decLogsStr);
      }

      let chat: Message[] = [];
      if (data.encryptedChatHistory) {
         const decChatStr = await decryptData({
           ciphertext: data.encryptedChatHistory,
           iv: data.ivChat,
           salt: data.saltChat
         }, password);
         chat = JSON.parse(decChatStr);
      }

      passwordRef.current = password;
      // Persist password key to session storage for refresh survivor
      sessionStorage.setItem(`${SESSION_KEY}_${user.uid}`, password);

      setState(s => ({
          ...s,
          isLocked: false,
          isLoading: false,
          profile,
          healthLogs: logs,
          chatHistory: chat,
          error: null
      }));

      return true;
    } catch (e: any) {
      if (!isSilent) {
        console.error(e);
        setState(s => ({ ...s, isLoading: false, error: "Incorrect password or failed to decrypt." }));
      }
      return false;
    }
  };

  const setupProfile = async (password: string, profile: AITrainerProfile): Promise<boolean> => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      await saveData(profile, [], [], password);
      passwordRef.current = password;
      // Persist password key
      if (user) sessionStorage.setItem(`${SESSION_KEY}_${user.uid}`, password);

      setState(s => ({
        ...s,
        hasProfile: true,
        isLocked: false,
        isLoading: false,
        profile,
        healthLogs: [],
        chatHistory: []
      }));
      return true;
    } catch (e: any) {
      setState(s => ({ ...s, isLoading: false, error: e.message }));
      return false;
    }
  };

  const logHealthData = async (log: HealthDataLog) => {
     if (!state.profile || state.isLocked) return;
     const newLogs = [...state.healthLogs, log];
     setState(s => ({ ...s, healthLogs: newLogs }));
     await saveData(state.profile, newLogs, state.chatHistory);
     
     // Proactively inform the AI about the new data so it can respond
     sendMessageToTrainer(`[SYSTEM: The user just logged new health data: ${JSON.stringify(log)}. Provide a very brief, single-sentence acknowledgment or insight based on this new data and your persona.]`);
  };

  const extractStatsFromThought = (thought: string) => {
     const updates: Partial<AITrainerState> = {};

     const capacityMatch = thought.match(/Capacity:\s*(\d{1,3})%/i);
     if (capacityMatch && capacityMatch[1]) {
         updates.predictedPerformance = parseInt(capacityMatch[1], 10);
     }

     const quoteMatch = thought.match(/Quote:\s*(.+)/i);
     if (quoteMatch && quoteMatch[1]) {
         updates.dailyQuote = quoteMatch[1].trim();
     }

     if (Object.keys(updates).length > 0) {
         setState(s => ({ ...s, ...updates }));
     }
  };

  const sendMessageToTrainer = async (content: string) => {
      if (!isInitialized || !state.profile || state.isLocked) {
          console.warn("Cannot send message. isInitialized:", isInitialized, "profile:", !!state.profile, "isLocked:", state.isLocked);
          return;
      }

      const userMessage: Message = { role: 'user', content };
      const newHistory = [...state.chatHistory, userMessage];
      const tempHistory = [...newHistory, { role: 'assistant', content: '' } as Message];
      
      setState(s => ({ ...s, chatHistory: tempHistory, isLoading: true, error: null }));

      try {
          // Prepare context
          const systemPrompt = generateAITrainerPrompt(state.profile);
          const recentLogs = state.healthLogs.slice(-5).map(l => JSON.stringify(l)).join("\\n");

          // Inject logs into system prompt or pass as context
          const fullPrompt = `${systemPrompt}\n\nRecent Health Logs:\n${recentLogs || 'No recent logs.'}`;

          let streamingContent = '';
          const { response, updatedHistory } = await streamMessage(content, {
              systemPrompt: fullPrompt,
              insights: [],
              summary: "A user chatting with their AI Trainer.",
              history: state.chatHistory // send old history
          }, (chunk) => {
              streamingContent += chunk;
              setState(s => {
                  const currentHistory = [...s.chatHistory];
                  if (currentHistory.length > 0 && currentHistory[currentHistory.length - 1].role === 'assistant') {
                      currentHistory[currentHistory.length - 1] = { ...currentHistory[currentHistory.length - 1], content: streamingContent };
                  }
                  return { ...s, chatHistory: currentHistory };
              });
          });

          // The updatedHistory will contain the new messages (including thought blocks)
          // We extract stats from the AI's latest response thought block
          const aiMessage = updatedHistory[updatedHistory.length - 1];
          if (aiMessage && aiMessage.role === 'assistant') {
              const thoughtMatch = aiMessage.content.match(/<thought>([\s\S]*?)<\/thought>/);
              if (thoughtMatch) {
                  extractStatsFromThought(thoughtMatch[1]);
              }
          }

          setState(s => ({ ...s, chatHistory: updatedHistory, isLoading: false }));
          await saveData(state.profile, state.healthLogs, updatedHistory);

      } catch (e: any) {
          console.error("Failed to send message", e);
          setState(s => ({ ...s, error: e.message || "Failed to get response." }));
      } finally {
          setState(s => ({ ...s, isLoading: false }));
      }
  };

  const lock = () => {
    passwordRef.current = null;
    setState({
      isLocked: true,
      hasProfile: state.hasProfile,
      isLoading: false,
      error: null,
      profile: null,
      healthLogs: [],
      chatHistory: [],
      predictedPerformance: null,
      dailyQuote: null,
    });
  };

  return (
    <AITrainerContext.Provider value={{
      ...state,
      unlock,
      setupProfile,
      logHealthData,
      sendMessageToTrainer,
      lock,
    }}>
      {children}
    </AITrainerContext.Provider>
  );
};

export const useAITrainer = () => {
  const ctx = useContext(AITrainerContext);
  if (!ctx) throw new Error("useAITrainer must be used within AITrainerProvider");
  return ctx;
};
