
import React from 'react';
import { ChatMessage } from '../../types';

interface ChatHistoryProps {
  messages: ChatMessage[];
  isTyping: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isTyping, scrollRef }) => {
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar pb-44 space-y-6 pt-4 px-2" role="log" aria-live="polite">
      {messages.map((m) => (
        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2`}>
          <div className={`max-w-[85%] p-5 rounded-[2rem] shadow-2xl relative ${
            m.role === 'user' 
              ? 'bg-[var(--color-background-card)] text-[var(--color-text-default)] rounded-bl-none border border-[var(--color-border-default)]' 
              : 'bg-gradient-to-br from-[var(--color-accent-indigo)] to-[var(--color-accent-indigo)]/80 text-[var(--color-text-inverse)] rounded-br-none'
          }`} role="status">
            <p className="font-bold text-xs md:text-base leading-relaxed whitespace-pre-line">{m.text}</p>
            <div className="flex justify-between items-center mt-3 opacity-30 text-[var(--color-text-muted)]">
               <span className="text-[7px] font-black tabular-nums">{new Date(m.timestamp).toLocaleTimeString('ar-YE', {hour:'2-digit', minute:'2-digit'})}</span>
               <span className="text-[7px] font-black uppercase tracking-widest">{m.role === 'user' ? 'المدير' : 'Gemini AI'}</span>
            </div>
          </div>
        </div>
      ))}
      {isTyping && (
        <div className="flex justify-end p-4">
           <div className="glass-ai px-6 py-3 rounded-full flex gap-1 items-center animate-pulse">
              <div className="w-1.5 h-1.5 bg-[var(--color-accent-indigo)] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[var(--color-accent-indigo)] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-[var(--color-accent-indigo)] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
           </div>
        </div>
      )}
    </div>
  );
};
