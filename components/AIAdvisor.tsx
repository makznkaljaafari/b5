
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage, AppError } from '../types';
import { useAIProcessor } from '../hooks/useAIProcessor';
import { useIsMounted } from '../hooks/useIsMounted';
import { ChatHistory } from './ai/ChatHistory';
import { ConfirmationDialog } from './ai/ConfirmationDialog';

const AIAdvisor: React.FC = () => {
  const { sales, customers, purchases, vouchers, categories, suppliers, exchangeRates, navigate, addNotification } = useApp();
  const { 
    pendingAction, setPendingAction, validateToolCall, executeAction 
  } = useAIProcessor();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isComponentMounted = useIsMounted();

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome', role: 'model',
        text: 'أهلاً يا مدير. أنا رفيقك الذكي Gemini، جاهز لإدارة الحسابات وتنفيذ الأوامر الصوتية والنصية. كيف يمكنني مساعدتك اليوم؟',
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponse = await getChatResponse(input, messages, { sales, customers, purchases, vouchers, categories, suppliers, rates: exchangeRates });
      if (!isComponentMounted()) return;

      if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
        const tool = aiResponse.toolCalls[0];
        if (validateToolCall(tool.name, tool.args)) setPendingAction(tool);
      }

      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), role: 'model', 
        text: aiResponse.text || "أبشر يا مدير، جاري تنفيذ طلبك...", 
        timestamp: new Date().toISOString() 
      }]);
    } catch (err: any) {
      if (!isComponentMounted()) return;
      const errorMessage = err instanceof AppError ? err.message : "المعذرة، واجهت مشكلة في الاتصال.";
      addNotification("خطأ AI ❌", errorMessage, "warning");
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: errorMessage, timestamp: new Date().toISOString() }]);
    } finally {
      if (isComponentMounted()) setIsTyping(false);
    }
  };

  return (
    <PageLayout title="المحاسب الذكي Gemini" onBack={() => navigate('dashboard')}>
      <div className="flex flex-col h-[78vh] max-w-4xl mx-auto px-2 relative">
        <ChatHistory messages={messages} isTyping={isTyping} scrollRef={scrollRef} />
        
        <ConfirmationDialog 
          pendingAction={pendingAction} 
          onConfirm={() => executeAction()} 
          onCancel={() => setPendingAction(null)} 
        />

        <div className="fixed bottom-24 left-0 right-0 px-4 max-w-4xl mx-auto z-50">
           <form onSubmit={handleSend} className="relative group">
              <input 
                type="text" 
                className="w-full rounded-full p-6 pr-8 pl-24 font-black text-sm md:text-xl shadow-3xl border-4 outline-none transition-all bg-[var(--color-background-card)] border-[var(--color-border-subtle)] text-[var(--color-text-default)] focus:border-[var(--color-accent-indigo)]"
                placeholder="اسأل Gemini (بيع، توريد، ديون)..."
                value={input} onChange={e => setInput(e.target.value)}
                disabled={isTyping}
              />
              <button 
                type="submit" 
                disabled={isTyping}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-[var(--color-accent-indigo)] text-[var(--color-text-inverse)] rounded-full shadow-xl active:scale-90 transition-all flex items-center justify-center text-2xl"
              >🚀</button>
           </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default AIAdvisor;
