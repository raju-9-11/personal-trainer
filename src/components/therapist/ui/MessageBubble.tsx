
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Message } from '../../../lib/ai/types';

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) return null; // Generally hide system prompts

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div
        className={`relative max-w-[85%] sm:max-w-[75%] px-5 py-4 text-[15px] leading-relaxed shadow-sm transition-all hover:shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-500/20'
            : 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-md text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl rounded-tl-sm shadow-slate-200/50 dark:shadow-none'
        }`}
      >
        <div className={`markdown-body ${isUser ? 'user-markdown' : 'therapist-markdown'}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Paragraphs: Add relaxed line height & spacing
                p: ({ node, ...props }) => <p className="mb-3 last:mb-0 leading-7 font-normal" {...props} />,
                
                // Bold: Make it pop slightly
                strong: ({ node, ...props }) => (
                  <strong className={`font-semibold ${isUser ? 'text-white' : 'text-indigo-900 dark:text-indigo-300'}`} {...props} />
                ),
                
                // Italic/Actions: Serif styling for therapist actions (*smiles*)
                em: ({ node, ...props }) => (
                  <em className={`block my-1 text-sm font-serif opacity-90 ${isUser ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`} {...props} />
                ),
                
                // Lists: Custom markers
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1 marker:text-current/60" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1 marker:text-current/60" {...props} />,
                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                
                // Blockquotes (Insights): Card-like styling
                blockquote: ({ node, ...props }) => (
                    <blockquote 
                        className={`border-l-4 pl-4 py-2 my-3 text-sm italic rounded-r-md ${
                            isUser 
                            ? 'border-white/40 bg-white/10 text-indigo-50' 
                            : 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200'
                        }`} 
                        {...props} 
                    />
                ),
                
                // Links: Underline & transition
                a: ({ node, ...props }) => (
                    <a className="underline underline-offset-2 hover:opacity-80 transition-opacity decoration-current/50" target="_blank" rel="noopener noreferrer" {...props} />
                ),

                // Code/Pre: Inline code blocks
                code: ({ node, className, children, ...props }: any) => { // Removed `inline` prop as types can be tricky
                    const match = /language-(\w+)/.exec(className || '')
                    return !match ? (
                        <code className={`px-1.5 py-0.5 rounded text-sm font-mono ${isUser ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-900 text-pink-600 dark:text-pink-400'}`} {...props}>
                            {children}
                        </code>
                    ) : (
                        <pre className="overflow-x-auto p-3 rounded-lg bg-slate-900 text-slate-100 text-sm my-2">
                             <code className={className} {...props}>
                                {children}
                            </code>
                        </pre>
                    )
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}
