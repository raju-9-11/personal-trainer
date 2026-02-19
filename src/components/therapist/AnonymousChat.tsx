
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Brain, Send, User, Sparkles, ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';
import { AIProvider, useAI } from '../../lib/ai/ai-context';
import { Message } from '../../lib/ai/types';
import { AnimatePresence, motion } from 'framer-motion';

function AnonymousChatContent() {
  const { sendMessage, activeProvider, setProvider, availableProviders } = useAI();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi there. I'm here to listen. This chat is anonymous and nothing is saved. How are you feeling right now?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, error]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
        const contextMessages: Message[] = [
            { role: 'system', content: "You are a supportive, empathetic listener. This is an anonymous, ephemeral chat. Your goal is to provide immediate emotional support, validation, and grounding. Do not try to diagnose. Keep responses concise (under 3 sentences) and warm. If the user seems in crisis, suggest professional help." },
            ...messages,
            userMsg
        ];

        const response = await sendMessage(contextMessages);
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
        console.error("Chat error", error);
        setError("Connection failed.");
    } finally {
        setIsTyping(false);
    }
  };

  const handleRetry = (provider: any) => {
      setProvider(provider);
      // Retry logic: Remove failed attempt visualization if any, or just let user re-type?
      // Better: Re-send the last user message if the last message in history is user
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'user') {
          // Temporarily set input back to last message content to simulate re-send
          // Actually, we can just call an internal re-send logic, but handleSend consumes input state.
          // Let's just prompt user to try again for simplicity or implement complex retry
          // Simple retry:
          setIsTyping(true);
          setError(null);
          
          const contextMessages: Message[] = [
            { role: 'system', content: "You are a supportive, empathetic listener..." },
            ...messages
          ];
          
          sendMessage(contextMessages).then(response => {
              setMessages(prev => [...prev, { role: 'assistant', content: response }]);
          }).catch(e => {
              setError("Retry failed.");
          }).finally(() => setIsTyping(false));
      }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="flex-none bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
            <Link to="/therapy">
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            </Link>
            <div className="flex items-center gap-2">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-4 h-4" />
                </div>
                <div>
                    <h1 className="font-semibold text-slate-900 dark:text-white leading-tight">Anonymous Support</h1>
                    <p className="text-xs text-slate-500">Data is not saved.</p>
                </div>
            </div>
        </div>
        <Link to="/therapy/auth">
            <Button size="sm" variant="outline" className="hidden md:flex">
                Save Progress (Register)
            </Button>
        </Link>
      </header>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-2xl mx-auto space-y-6 py-4">
            {messages.map((msg, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-none ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300'}`}>
                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                        </div>
                        <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                </motion.div>
            ))}
            {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="flex gap-3 max-w-[85%]">
                         <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300 flex items-center justify-center flex-none">
                            <Brain className="w-4 h-4" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 flex gap-1 items-center">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
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
      </ScrollArea>

      {/* Input Area */}
      <div className="flex-none bg-white dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto flex gap-2">
            <Input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type your thoughts..."
                className="flex-1"
                autoFocus
            />
            <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
                <Send className="w-4 h-4" />
            </Button>
        </div>
      </div>
    </div>
  );
}

export default function AnonymousChat() {
    return (
        <AIProvider>
            <AnonymousChatContent />
        </AIProvider>
    );
}
