import React, { useState, useEffect, useRef } from 'react';
import { useAITrainer } from '../AITrainerContext';
import { Button } from '../../ui/button';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { InlineHealthForm } from './InlineForms';

export const AITrainerChat = () => {
  const { chatHistory, sendMessageToTrainer, isLoading, profile } = useAITrainer();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [formSubmitted, setFormSubmitted] = useState<Record<number, boolean>>({}); // track which forms are submitted

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const msg = input;
    setInput('');
    await sendMessageToTrainer(msg);
  };

  const renderContent = (content: string, msgIndex: number) => {
    // 1. Remove <thought> blocks from the public display
    let publicContent = content.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();

    // 2. Check for form triggers
    const hasHealthForm = publicContent.includes('[FORM:HEALTH_LOG]');

    if (hasHealthForm) {
      publicContent = publicContent.replace('[FORM:HEALTH_LOG]', '');
    }

    return (
      <div className="flex flex-col gap-2 w-full">
        {publicContent && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{publicContent}</ReactMarkdown>
          </div>
        )}

        {hasHealthForm && !formSubmitted[msgIndex] && (
          <InlineHealthForm onSubmitSuccess={() => setFormSubmitted(s => ({ ...s, [msgIndex]: true }))} />
        )}
        {hasHealthForm && formSubmitted[msgIndex] && (
          <div className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-primary inline-block"></span> Health Log Saved
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[600px] bg-card border rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
             <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">{profile?.name || 'AI Trainer'}</h3>
            <p className="text-xs text-muted-foreground">{profile?.traits.join(' • ')}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center px-6">
            <Bot className="w-12 h-12 mb-4 opacity-50" />
            <p>Welcome to your personal AI Trainer.</p>
            <p className="text-sm mt-2">I analyze your health data to optimize your performance and recovery.</p>
          </div>
        ) : (
          chatHistory.map((msg, idx) => {
            if (msg.role === 'system') return null;
            const isUser = msg.role === 'user';
            return (
              <div key={idx} className={`flex gap-3 max-w-[90%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl ${isUser ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted/50 border rounded-tl-sm w-full'}`}>
                  {renderContent(msg.content, idx)}
                </div>
              </div>
            );
          })
        )}
        {isLoading && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
             <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
             </div>
             <div className="p-4 rounded-2xl bg-muted/50 border rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Analyzing...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your trainer anything..."
            className="flex-1 bg-muted/50 border-0 rounded-full pl-6 pr-12 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 rounded-full w-8 h-8"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
