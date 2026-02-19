
import { useState, useRef, useEffect } from 'react';
import { TherapistLayout } from './ui/TherapistLayout';
import { TherapistAvatar, AvatarState } from './ui/TherapistAvatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { OpenRouterProvider } from '../../lib/ai/openrouter';
import { Message, GeneratedTherapist, BaseContext } from '../../lib/ai/types';
import { getPersonaById, getDefaultPersona } from '../../lib/ai/personas';
import { Send, LogOut, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EndSessionModal } from './EndSessionModal';

interface SessionViewProps {
  unlockedProfile: {
    context: {
      context: BaseContext;
      personaId?: string; // Optional now
    };
    password: string;
  };
  currentTherapist?: GeneratedTherapist;
}

export function SessionView({ unlockedProfile, currentTherapist }: SessionViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { context, personaId } = unlockedProfile.context;

  // Determine Persona Details
  let name = '';
  let role = '';
  let systemPromptContent = '';
  let greeting = '';

  if (currentTherapist) {
    name = currentTherapist.name;
    role = currentTherapist.role;
    systemPromptContent = currentTherapist.systemPrompt;
    greeting = currentTherapist.greeting;
  } else {
    // Fallback to Legacy Persona
    const persona = getPersonaById(personaId || '') || getDefaultPersona();
    name = persona.name;
    role = persona.role;
    systemPromptContent = `${persona.prompt}\n\nUser Context:\n${JSON.stringify(context)}\n\nMaintain your persona strictly. Be concise but deep.`;
    greeting = `Hello. I'm ${persona.name}. How are you feeling today?`;
  }

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting: Message = {
        role: 'assistant',
        content: greeting
      };
      setMessages([initialGreeting]);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isStreaming) return;

    const userMsg: Message = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setAvatarState('thinking');
    setIsStreaming(true);

    try {
      // Construct system prompt
      const systemPrompt: Message = {
        role: 'system',
        content: systemPromptContent
      };

      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const fullMessages = [systemPrompt, ...history, userMsg];

      // Prepare placeholder for assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const provider = new OpenRouterProvider();

      let currentResponse = '';

      await provider.streamMessage(fullMessages, (chunk) => {
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
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting. Please try again." }]);
    } finally {
      setIsStreaming(false);
      setAvatarState('listening');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <TherapistLayout title={`Session with ${name}`} showBack={false}>
      <div className="flex flex-col h-full max-w-4xl mx-auto">

        {/* Top: Avatar & Controls */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-t-2xl">
           <div className="flex items-center gap-4">
              <div className="scale-75 origin-left">
                <TherapistAvatar state={avatarState} className="w-24 h-24" />
              </div>
              <div>
                <h3 className="font-medium text-lg">{name}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{role}</p>
              </div>
           </div>

           <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setShowEndModal(true)}>
             <LogOut className="w-4 h-4 mr-2" />
             End Session
           </Button>
        </div>

        {/* Middle: Chat Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-white/30 dark:bg-black/10 backdrop-blur-sm"
        >
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl text-base leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-100 dark:border-slate-700'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isStreaming && (
             <div className="flex justify-start">
               <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700 flex gap-1">
                 <motion.div className="w-2 h-2 bg-slate-400 rounded-full" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                 <motion.div className="w-2 h-2 bg-slate-400 rounded-full" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                 <motion.div className="w-2 h-2 bg-slate-400 rounded-full" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
               </div>
             </div>
          )}
        </div>

        {/* Bottom: Input Area */}
        <div className="flex-none p-4 bg-white/80 dark:bg-black/40 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 rounded-b-2xl">
          <div className="flex gap-2 relative">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[60px] max-h-[120px] pr-12 resize-none bg-transparent border-slate-200 dark:border-slate-700 focus:ring-indigo-500"
            />
            <Button
              size="icon"
              className="absolute right-2 bottom-2 h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:scale-105"
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isStreaming}
            >
              {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">
            Messages are encrypted. AI responses are generated in real-time.
          </p>
        </div>

        <EndSessionModal
          isOpen={showEndModal}
          onClose={() => setShowEndModal(false)}
          messages={messages}
          unlockedProfile={unlockedProfile}
        />

      </div>
    </TherapistLayout>
  );
}
