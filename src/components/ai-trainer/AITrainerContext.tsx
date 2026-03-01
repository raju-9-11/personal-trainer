import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { encryptData, decryptData } from '../../lib/encryption';
import { useAuth } from '../../lib/auth-context';
import { FirebaseDataService } from '../../lib/services/firebase-service';
import { AITrainerProfile, HealthDataLog, WorkoutPlan, Routine, Supplement } from '../../lib/types';
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

  encryptedRoutines?: string;
  ivRoutines?: string;
  saltRoutines?: string;
}

interface AITrainerState {
  isLocked: boolean;
  hasProfile: boolean;
  isOnboarding: boolean;
  isLoading: boolean;
  error: string | null;
  profile: AITrainerProfile | null;
  healthLogs: HealthDataLog[];
  chatHistory: Message[];
  routines: Routine[];
  predictedPerformance: number | null;
  dailyQuote: string | null;
  isGuest: boolean;
}

interface AITrainerContextType extends AITrainerState {
  unlock: (password: string) => Promise<boolean>;
  setupProfile: (password: string, profile: AITrainerProfile) => Promise<boolean>;
  updateProfile: (profileUpdates: Partial<AITrainerProfile>) => Promise<void>;
  logHealthData: (log: Partial<HealthDataLog>) => Promise<void>;
  addRoutine: (routine: Routine) => Promise<void>;
  updateRoutine: (id: string, updates: Partial<Routine>) => Promise<void>;
  sendMessageToTrainer: (content: string) => Promise<void>;
  lock: () => void;
  migrateGuestToUser: (password: string) => Promise<boolean>;
}

const AITrainerContext = createContext<AITrainerContextType | null>(null);

export const AITrainerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { streamMessage, isInitialized } = useAI();
  const [state, setState] = useState<AITrainerState>({
    isLocked: true,
    hasProfile: false,
    isOnboarding: false,
    isLoading: true,
    error: null,
    profile: null,
    healthLogs: [],
    chatHistory: [],
    routines: [],
    predictedPerformance: null,
    dailyQuote: null,
    isGuest: false,
  });

  const passwordRef = useRef<string | null>(null);
  const SESSION_KEY = 'titan_vault_session_pwd';
  const GUEST_STORAGE_KEY = 'guest_ai_vault';
  const SESSION_HINT_KEY = 'ai_trainer_has_profile_hint';

  // Check if user has an existing encrypted profile or if they have a guest vault
  useEffect(() => {
    const checkStatus = async () => {
      const hint = sessionStorage.getItem(SESSION_HINT_KEY);
      
      if (!user) {
        // GUEST MODE LOGIC
        const guestData = localStorage.getItem(GUEST_STORAGE_KEY);
        if (guestData) {
          try {
            const parsed = JSON.parse(guestData);
            setState(s => ({
              ...s,
              isLocked: false,
              hasProfile: true,
              isOnboarding: !parsed.profile?.onboardingComplete,
              isLoading: false,
              isGuest: true,
              profile: parsed.profile,
              healthLogs: parsed.healthLogs || [],
              chatHistory: parsed.chatHistory || [],
              routines: parsed.routines || [],
            }));
            sessionStorage.setItem(SESSION_HINT_KEY, 'true');
            // Initial stats extraction
            const lastMsg = parsed.chatHistory?.slice().reverse().find((m: Message) => m.role === 'assistant');
            if (lastMsg) extractStatsFromThought(lastMsg.content);
          } catch (e) {
             setState(s => ({ ...s, isLoading: false, isLocked: false, isGuest: true, hasProfile: false, isOnboarding: false }));
          }
        } else {
          setState(s => ({ ...s, isLoading: false, isLocked: false, isGuest: true, hasProfile: false, isOnboarding: false }));
        }
        return;
      }

      // AUTHENTICATED LOGIC
      // If we already have guest data, don't set isLoading to true immediately
      // This prevents the "flash" of onboarding.
      if (!hint) setState(s => ({ ...s, isLoading: true, error: null, isGuest: false }));
      
      try {
        const db = new FirebaseDataService(user);
        const data = await db.getAITrainerData(user.uid);
        
        // Session Recovery: Try to auto-unlock if password exists in session
        const sessionPwd = sessionStorage.getItem(`${SESSION_KEY}_${user.uid}`);
        
        if (data && data.encryptedProfile) {
          sessionStorage.setItem(SESSION_HINT_KEY, 'true');
          if (sessionPwd) {
            const unlocked = await unlock(sessionPwd, true);
            if (!unlocked) {
                setState(s => ({ ...s, hasProfile: true, isLocked: true, isLoading: false }));
            }
          } else {
            setState(s => ({ ...s, hasProfile: true, isLocked: true, isLoading: false }));
          }
        } else {
          // Check for Shadow Data (Cloud copy of guest data)
          const shadowData = await db.getAITrainerData(user.uid, true); // We'll update the service to accept a 'shadow' flag
          if (shadowData) {
              setState(s => ({
                  ...s,
                  isLocked: false,
                  hasProfile: true,
                  isOnboarding: !shadowData.profile?.onboardingComplete,
                  isLoading: false,
                  isGuest: true,
                  profile: shadowData.profile,
                  healthLogs: shadowData.healthLogs || [],
                  chatHistory: shadowData.chatHistory || [],
                  routines: shadowData.routines || [],
              }));
              sessionStorage.setItem(SESSION_HINT_KEY, 'true');
          } else if (state.hasProfile && state.isGuest) {
              // We have local guest data, keep it!
              setState(s => ({ ...s, isLoading: false }));
          } else {
              setState(s => ({ ...s, hasProfile: false, isLocked: false, isLoading: false, isOnboarding: false })); 
              sessionStorage.removeItem(SESSION_HINT_KEY);
          }
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

  const saveData = async (profileToSave: AITrainerProfile, logsToSave: HealthDataLog[], chatToSave: Message[], routinesToSave: Routine[], pwd?: string) => {
    sessionStorage.setItem(SESSION_HINT_KEY, 'true');
    
    if (!user) {
      // GUEST MODE SAVE (Local Only)
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify({
        profile: profileToSave,
        healthLogs: logsToSave,
        chatHistory: chatToSave,
        routines: routinesToSave,
      }));
      return;
    }

    const activePassword = pwd || passwordRef.current;
    if (!activePassword) {
      // SILENT SHADOW (Logged-in User, but in Guest/Unencrypted state)
      const db = new FirebaseDataService(user);
      await db.saveAITrainerData(user.uid, {
          profile: profileToSave,
          healthLogs: logsToSave,
          chatHistory: chatToSave,
          routines: routinesToSave,
          isShadow: true,
      }, true); // We'll update the service to support 'shadow' flag
      
      // Also save locally for instant access
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify({
        profile: profileToSave,
        healthLogs: logsToSave,
        chatHistory: chatToSave,
        routines: routinesToSave,
      }));
      return;
    }

    const db = new FirebaseDataService(user);

    const encProfile = await encryptData(JSON.stringify(profileToSave), activePassword);
    const encLogs = await encryptData(JSON.stringify(logsToSave), activePassword);
    const encChat = await encryptData(JSON.stringify(chatToSave), activePassword);
    const encRoutines = await encryptData(JSON.stringify(routinesToSave), activePassword);

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

      encryptedRoutines: encRoutines.ciphertext,
      ivRoutines: encRoutines.iv,
      saltRoutines: encRoutines.salt,
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

      let routines: Routine[] = [];
      if (data.encryptedRoutines && data.ivRoutines && data.saltRoutines) {
         const decRoutinesStr = await decryptData({
           ciphertext: data.encryptedRoutines,
           iv: data.ivRoutines,
           salt: data.saltRoutines
         }, password);
         routines = JSON.parse(decRoutinesStr);
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
          routines,
          isOnboarding: !profile.onboardingComplete,
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
      await saveData(profile, [], [], [], password);
      passwordRef.current = password;
      // Persist password key
      if (user) sessionStorage.setItem(`${SESSION_KEY}_${user.uid}`, password);

      setState(s => ({
        ...s,
        hasProfile: true,
        isLocked: false,
        isOnboarding: !profile.onboardingComplete,
        isLoading: false,
        profile,
        healthLogs: [],
        chatHistory: [],
        routines: [],
      }));
      return true;
    } catch (e: any) {
      setState(s => ({ ...s, isLoading: false, error: e.message }));
      return false;
    }
  };

  const migrateGuestToUser = async (password: string): Promise<boolean> => {
    if (!user || !state.isGuest || !state.profile) return false;
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      await saveData(state.profile, state.healthLogs, state.chatHistory, state.routines, password);
      passwordRef.current = password;
      sessionStorage.setItem(`${SESSION_KEY}_${user.uid}`, password);
      localStorage.removeItem(GUEST_STORAGE_KEY);
      
      setState(s => ({
        ...s,
        isGuest: false,
        isLocked: false,
        isOnboarding: !state.profile?.onboardingComplete,
        isLoading: false,
      }));
      return true;
    } catch (e: any) {
      setState(s => ({ ...s, isLoading: false, error: e.message }));
      return false;
    }
  };

  const updateProfile = async (profileUpdates: Partial<AITrainerProfile>) => {
    if (!state.profile || state.isLocked) return;
    const newProfile = { ...state.profile, ...profileUpdates };
    setState(s => ({ ...s, profile: newProfile, isOnboarding: !newProfile.onboardingComplete }));
    await saveData(newProfile, state.healthLogs, state.chatHistory, state.routines);
  };

  const addRoutine = async (routine: Routine) => {
    if (!state.profile || state.isLocked) return;
    const newRoutines = [...state.routines.filter(r => r.id !== routine.id), routine];
    setState(s => ({ ...s, routines: newRoutines }));
    await saveData(state.profile, state.healthLogs, state.chatHistory, newRoutines);
  };

  const updateRoutine = async (id: string, updates: Partial<Routine>) => {
    if (!state.profile || state.isLocked) return;
    const newRoutines = state.routines.map(r => r.id === id ? { ...r, ...updates } : r);
    setState(s => ({ ...s, routines: newRoutines }));
    await saveData(state.profile, state.healthLogs, state.chatHistory, newRoutines);
  };

  const logHealthData = async (log: Partial<HealthDataLog>) => {
     if (!state.profile || state.isLocked) return;
     
     // Find today's log or create a new one
     const today = log.date || new Date().toISOString().split('T')[0];
     const existingLogIndex = state.healthLogs.findIndex(l => l.date === today);
     
     let newLogs = [...state.healthLogs];
     if (existingLogIndex >= 0) {
       newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], ...log };
     } else {
       newLogs.push({ date: today, ...log } as HealthDataLog);
     }
     
     setState(s => ({ ...s, healthLogs: newLogs }));
     await saveData(state.profile, newLogs, state.chatHistory, state.routines);
     
     // Only proactively inform AI if it's a manual UI trigger (has fewer fields or specific context)
     // If it's the AI syncing data itself, we don't need to bounce a message back.
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

  const processActions = async (content: string) => {
      // Find all <action> tags
      const actionRegex = /<action\s+type="([^"]+)">([\s\S]*?)<\/action>/g;
      let match;
      while ((match = actionRegex.exec(content)) !== null) {
          const actionType = match[1];
          try {
              const payload = JSON.parse(match[2].trim());
              
              if (actionType === 'update_metrics') {
                  console.log("AI Action: update_metrics", payload);
                  await logHealthData(payload);
              } else if (actionType === 'sync_supplements') {
                  console.log("AI Action: sync_supplements", payload);
                  if (state.profile) {
                      const newSupps = [...(state.profile.supplements || []), { ...payload, id: Date.now().toString() }];
                      await updateProfile({ supplements: newSupps });
                  }
              } else if (actionType === 'propose_routine') {
                   console.log("AI Action: propose_routine", payload);
                   const newRoutine: Routine = {
                       ...payload,
                       id: Date.now().toString(),
                       date: new Date().toISOString().split('T')[0],
                       status: 'proposed'
                   };
                   await addRoutine(newRoutine);
              } else if (actionType === 'complete_onboarding') {
                  console.log("AI Action: complete_onboarding");
                  await updateProfile({ onboardingComplete: true });
              }
          } catch (e) {
              console.error("Failed to parse action payload", e);
          }
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
              // Process any action tags
              await processActions(aiMessage.content);
          }

          setState(s => ({ ...s, chatHistory: updatedHistory, isLoading: false }));
          await saveData(state.profile!, state.healthLogs, updatedHistory, state.routines);

      } catch (e: any) {
          console.error("Failed to send message", e);
          setState(s => ({ ...s, error: e.message || "Failed to get response." }));
      } finally {
          setState(s => ({ ...s, isLoading: false }));
      }
  };

  const lock = () => {
    passwordRef.current = null;
    setState(s => ({
      isLocked: true,
      hasProfile: s.hasProfile,
      isOnboarding: s.isOnboarding,
      isLoading: false,
      error: null,
      profile: null,
      healthLogs: [],
      chatHistory: [],
      routines: [],
      predictedPerformance: null,
      dailyQuote: null,
      isGuest: s.isGuest,
    }));
  };

  return (
    <AITrainerContext.Provider value={{
      ...state,
      unlock,
      setupProfile,
      updateProfile,
      logHealthData,
      addRoutine,
      updateRoutine,
      sendMessageToTrainer,
      lock,
      migrateGuestToUser,
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
