
import { useState, useRef, useEffect } from 'react';
import { TherapistLayout } from './ui/TherapistLayout';
import { TherapistAvatar, AvatarState } from './ui/TherapistAvatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Message, LLMProvider } from '../../lib/ai/types';
import { OpenRouterProvider } from '../../lib/ai/openrouter';
import { Send, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const INTAKE_SYSTEM_PROMPT = `You are a warm, professional, and empathetic Intake Specialist for a digital therapy platform.
Your goal is to conduct a preliminary assessment to match the user with the most suitable long-term therapist.

You need to gather information about:
1. Current emotional state and reasons for seeking therapy.
2. Brief history of mental health or therapy.
3. Childhood environment and significant relationships.
4. Any specific trauma or difficult life events (ask gently).
5. Goals for therapy (what does "better" look like?).

Guidelines:
- Ask ONE question at a time. Do not overwhelm the user.
- Be conversational. Follow up on their answers before moving to the next topic.
- If the user is brief, ask a gentle probing question.
- If the user reveals distress, validate them immediately.
- Maintain a neutral but supportive tone.
- Do not offer deep therapeutic interventions yet; your job is assessment.

Start by introducing yourself as the Intake Assistant and asking what brings them here today.`;

interface IntakeChatProps {
    onComplete: (transcript: Message[]) => void;
}

export function IntakeChat({ onComplete }: IntakeChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [avatarState, setAvatarState] = useState<AvatarState>('idle');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Greeting
    useEffect(() => {
        if (messages.length === 0) {
            const initial: Message = { 
                role: 'assistant', 
                content: "Hello. I'm your Intake Assistant. My goal is to understand your needs so I can match you with the perfect therapist. To start, could you tell me a little about what brings you here today?" 
            };
            setMessages([initial]);
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
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputText('');
        setIsStreaming(true);
        setAvatarState('thinking');

        try {
            const provider = new OpenRouterProvider();
            const systemMsg: Message = { role: 'system', content: INTAKE_SYSTEM_PROMPT };
            const fullContext = [systemMsg, ...newMessages];

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
            
            let responseContent = '';

            await provider.streamMessage(fullContext, (chunk) => {
                responseContent += chunk;
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'assistant', content: responseContent };
                    return updated;
                });
                setAvatarState('speaking');
            });

        } catch (error) {
            console.error("Intake error", error);
        } finally {
            setIsStreaming(false);
            setAvatarState('listening');
        }
    };

    return (
        <TherapistLayout title="Intake Session" showBack={false}>
            <div className="flex flex-col h-full max-w-3xl mx-auto">
                {/* Header / Avatar */}
                <div className="flex-none flex flex-col items-center py-4 border-b border-slate-100 dark:border-slate-800">
                    <TherapistAvatar state={avatarState} className="w-20 h-20 mb-2" />
                    <h2 className="text-lg font-medium text-slate-700 dark:text-slate-200">Intake Assistant</h2>
                    <p className="text-xs text-slate-400">Gathers context to find your perfect match</p>
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.map((msg, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] p-4 rounded-2xl text-base ${
                                msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-sm' 
                                : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-sm'
                            }`}>
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                    {isStreaming && (
                        <div className="flex justify-start">
                           <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm flex gap-1">
                             <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                             <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                             <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                           </div>
                         </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="flex-none p-4 bg-white/80 dark:bg-black/40 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
                    {messages.length > 5 && (
                        <div className="flex justify-center mb-4">
                            <Button 
                                variant="outline" 
                                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                onClick={() => onComplete(messages)}
                            >
                                I've shared enough for now <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    )}
                    
                    <div className="relative">
                        <Textarea 
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Type your response..."
                            className="pr-12 resize-none min-h-[60px]"
                        />
                        <Button 
                            size="icon"
                            className="absolute right-2 bottom-2 rounded-full"
                            onClick={handleSendMessage}
                            disabled={!inputText.trim() || isStreaming}
                        >
                            {isStreaming ? <Loader2 className="animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>
        </TherapistLayout>
    );
}
