
import { useState, useRef, useEffect } from 'react';
import { TherapistLayout } from './ui/TherapistLayout';
import { ArtisticAvatar, AvatarState } from './ui/ArtisticAvatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useAI } from '../../lib/ai/ai-context';
import { Message, GeneratedTherapist, BaseContext } from '../../lib/ai/types';
import { Send, LogOut, Loader2, Save, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './ui/MessageBubble';
import { Card } from '../ui/card';

interface SessionViewProps {
  initialContext: BaseContext;
  therapist: GeneratedTherapist;
  onSave: (updatedContext: BaseContext) => Promise<void>;
}

export function SessionView({ initialContext, therapist, onSave }: SessionViewProps) {
  const { streamMessage, setProvider, activeProvider, availableProviders } = useAI();
  const [messages, setMessages] = useState<Message[]>([]);
  const contextRef = useRef<BaseContext>(initialContext);
  
  const [inputText, setInputText] = useState('');
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [avatarAction, setAvatarAction] = useState<string | undefined>(undefined);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Extract therapist details
  const { name, role, systemPrompt, greeting, gender, archetypeId } = therapist;

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming, error]);

  // Parse actions
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant') {
      const content = lastMsg.content;
      const matches = content.match(/\*([a-zA-Z\s]+)\*/g);
      
      if (matches && matches.length > 0) {
        const lastAction = matches[matches.length - 1].replace(/\*/g, '').trim().toLowerCase();
        
        if (lastAction.includes('smile') || lastAction.includes('laugh')) setAvatarAction('smile');
        else if (lastAction.includes('nod') || lastAction.includes('agree')) setAvatarAction('nod');
        else if (lastAction.includes('lean')) setAvatarAction('lean_in');
        else if (lastAction.includes('think') || lastAction.includes('ponder')) setAvatarState('thinking');
        else setAvatarAction(undefined);

        const timer = setTimeout(() => setAvatarAction(undefined), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [messages]);

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || isStreaming) return;

    // Only add user message if it's a fresh send, not a retry
    if (!textOverride) {
        const userMsg: Message = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
    }
    
    setError(null);
    setAvatarState('thinking');
    setIsStreaming(true);

    try {
      // Get current history including the just-added user message
      // Note: If retrying, the user message is already in 'messages' state
      const currentMessages = textOverride ? messages : [...messages, { role: 'user', content: textToSend }];
      
      const sysMsg: Message = { role: 'system', content: systemPrompt };
      const history = currentMessages.map(m => ({ role: m.role, content: m.content }));
      const fullMessages = [sysMsg, ...history];

      // Placeholder for assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let currentResponse = '';

      await streamMessage(fullMessages as Message[], (chunk) => {
        currentResponse += chunk;
        setMessages(prev => {
          const newMsgs = [...prev];
          const lastMsgIndex = newMsgs.length - 1;
          const lastMsg = { ...newMsgs[lastMsgIndex] };
          if (lastMsg.role === 'assistant') {
            lastMsg.content = currentResponse;
            newMsgs[lastMsgIndex] = lastMsg;
          }
          return newMsgs;
        });
        setAvatarState('speaking');
      });

    } catch (error) {
      console.error("Chat error:", error);
      // Remove the empty assistant placeholder if it exists and is empty
      setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last.role === 'assistant' && !last.content) {
              return prev.slice(0, -1);
          }
          return prev;
      });
      setError("Connection failed. Try switching providers.");
    } finally {
      setIsStreaming(false);
      setAvatarState('idle');
    }
  };

  const handleRetry = (provider: any) => {
      setProvider(provider);
      // Find the last user message to retry
      const lastUserMsg = messages.filter(m => m.role === 'user').pop();
      if (lastUserMsg) {
          handleSendMessage(lastUserMsg.content);
      }
  };

  const handleEndSession = async () => {
      // Create a summary (mock for now, or use LLM)
      const newSessionCount = (contextRef.current.sessionCount || 0) + 1;
      
      const updatedContext: BaseContext = {
          ...contextRef.current,
          sessionCount: newSessionCount,
          lastSessionSummary: `Session on ${new Date().toLocaleDateString()}`
      };
      
      await onSave(updatedContext);
      setShowEndModal(false);
      // Maybe redirect or show "Session Saved" state
      alert("Session saved securely.");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <TherapistLayout title={`Session with ${name}`} showBack={false}>
      <div className="flex flex-col h-full max-w-4xl mx-auto relative">
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-t-2xl z-10">
           <div className="flex items-center gap-4">
              <div className="scale-75 origin-left">
                <ArtisticAvatar 
                  gender={gender}
                  archetype={archetypeId}
                  state={avatarState} 
                  action={avatarAction}
                  className="w-24 h-24" 
                />
              </div>
              <div>
                <h3 className="font-medium text-lg">{name}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{role}</p>
              </div>
           </div>

           <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setShowEndModal(true)}>
             <LogOut className="w-4 h-4 mr-2" />
             End
           </Button>
        </div>

        {/* Chat Log */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth bg-gradient-to-b from-slate-50/50 to-white/30 dark:from-black/10 dark:to-black/30 backdrop-blur-sm pb-32">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
               <MessageBubble key={idx} message={msg} isLast={idx === messages.length - 1} />
            ))}
          </AnimatePresence>
          
          {isStreaming && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-6">
                 <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100" />
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
                 </div>
               </motion.div>
          )}

          {error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center my-4">
                  <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4 max-w-md w-full">
                      <div className="flex items-start gap-3 mb-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-none" />
                          <div>
                              <h4 className="text-sm font-bold text-red-800 dark:text-red-200">Connection Failed</h4>
                              <p className="text-xs text-red-600 dark:text-red-300 mt-1">{error}</p>
                          </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                          {availableProviders.filter(p => p !== activeProvider).map(p => (
                              <Button key={p} size="sm" variant="outline" onClick={() => handleRetry(p)} className="bg-white dark:bg-black/40">
                                  Switch to {p.charAt(0).toUpperCase() + p.slice(1)} & Retry
                              </Button>
                          ))}
                          <Button size="sm" onClick={() => handleRetry(activeProvider)}>
                              <RefreshCw className="w-3 h-3 mr-2" /> Retry
                          </Button>
                      </div>
                  </Card>
              </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="absolute bottom-6 left-0 right-0 px-4 pointer-events-none flex justify-center z-20">
          <div className="pointer-events-auto w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl shadow-indigo-500/10 dark:shadow-black/50 p-2 flex items-end gap-2 transition-all focus-within:ring-2 ring-indigo-500/20">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full min-h-[50px] max-h-[150px] py-3 px-4 resize-none bg-transparent border-none focus:outline-none text-[16px] placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
            />
            <Button
              size="icon"
              className={`h-11 w-11 rounded-full flex-none mb-1 transition-all ${
                  inputText.trim() 
                  ? 'bg-indigo-600 text-white shadow-lg scale-100' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 scale-95'
              }`}
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isStreaming}
            >
              {isStreaming ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* End Modal (Simplified for now) */}
        {showEndModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                    <h3 className="text-xl font-bold mb-2">End Session?</h3>
                    <p className="text-slate-500 mb-6">Your progress will be encrypted and saved to your Vault.</p>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setShowEndModal(false)}>Cancel</Button>
                        <Button className="flex-1" onClick={handleEndSession}>
                            <Save className="w-4 h-4 mr-2" /> Save & End
                        </Button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </TherapistLayout>
  );
}
