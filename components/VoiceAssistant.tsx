
import React, { memo, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAIProcessor } from '../hooks/useAIProcessor';
import { useGeminiLive } from '../hooks/useGeminiLive';

const VoiceAssistant: React.FC = () => {
  const { user, isVoiceActive, setIsVoiceActive } = useApp();
  const { pendingAction, setPendingAction, executeAction, validateToolCall } = useAIProcessor();
  
  const processingRef = useRef(false);

  const { isActive, statusText, start, stop } = useGeminiLive((fc) => {
    if (validateToolCall(fc.name, fc.args)) {
        setPendingAction(fc);
    }
  });

  useEffect(() => {
    if (isVoiceActive && !isActive && !processingRef.current) {
      processingRef.current = true;
      start().finally(() => { processingRef.current = false; });
    } else if (!isVoiceActive && isActive && !processingRef.current) {
      processingRef.current = true;
      stop().finally(() => { processingRef.current = false; });
    }
  }, [isVoiceActive, isActive, start, stop]);

  useEffect(() => {
    if (isActive !== isVoiceActive) setIsVoiceActive(isActive);
  }, [isActive, isVoiceActive, setIsVoiceActive]);

  const handleCloseSession = useCallback(async () => {
    setIsVoiceActive(false);
    await stop();
    setPendingAction(null);
  }, [setIsVoiceActive, stop, setPendingAction]);

  if (!user?.enable_voice_ai && !isActive) return null;

  return (
    <>
      <div className="fixed bottom-24 left-6 z-[80] no-print">
        <button 
          onClick={() => setIsVoiceActive(!isActive)} 
          className={`group relative w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-300 border-4 active:scale-95 ${
            isActive ? 'bg-rose-600 border-white/40 ring-4 ring-rose-500/20' : 'bg-indigo-600 border-white/10 shadow-lg'
          }`} 
        >
          {isActive && <div className="absolute inset-0 rounded-[2rem] border-2 border-white/50 animate-pulse"></div>}
          <span className="text-3xl relative z-10">{isActive ? '✕' : '🎙️'}</span>
        </button>
      </div>

      {isActive && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300 no-print">
          <div className="w-full max-w-md flex flex-col items-center gap-12 text-center text-white">
            
            {pendingAction ? (
              <div className="w-full bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl border-4 border-indigo-600 text-slate-900 dark:text-white animate-in zoom-in-95">
                <div className="flex items-center justify-center gap-3 mb-8">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${
                     pendingAction.name === 'deleteTransaction' ? 'bg-rose-600' : 'bg-indigo-600'
                   }`}>
                      {pendingAction.name === 'deleteTransaction' ? '🗑️' : '⚡'}
                   </div>
                   <h3 className="text-2xl font-black">
                      {pendingAction.name === 'deleteTransaction' ? 'تأكيد الحذف؟' : 
                       pendingAction.name === 'updateTransaction' ? 'تأكيد التعديل؟' : 'هل أؤكد العملية؟'}
                   </h3>
                </div>
                
                <div className={`bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] mb-10 text-right space-y-4 border-2 ${
                  pendingAction.name === 'deleteTransaction' ? 'border-rose-500/30' : 'border-slate-200 dark:border-slate-700'
                }`}>
                  <div className="flex justify-between border-b dark:border-slate-700/50 pb-2">
                     <span className="text-[10px] font-black text-slate-400">نوع الطلب</span>
                     <span className={`font-black ${pendingAction.name === 'deleteTransaction' ? 'text-rose-600' : 'text-indigo-600'}`}>
                        {pendingAction.name === 'recordSale' ? 'فاتورة بيع' : 
                         pendingAction.name === 'recordPurchase' ? 'مشتريات' :
                         pendingAction.name === 'deleteTransaction' ? 'حذف سجل' :
                         pendingAction.name === 'updateTransaction' ? 'تعديل سجل' :
                         pendingAction.name === 'managePerson' ? 'إضافة شخص' : 'عملية حسابية'}
                     </span>
                  </div>
                  {Object.entries(pendingAction.args || {}).map(([k, v]: any) => (
                    <div key={k} className="flex justify-between items-center border-b dark:border-slate-700/50 pb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase">{k}</span>
                      <span className="font-black text-sm">{String(v)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => executeAction()} 
                    className={`flex-[2] py-5 rounded-2xl font-black active:scale-95 shadow-xl text-white ${
                      pendingAction.name === 'deleteTransaction' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    تأكيد التنفيذ ✅
                  </button>
                  <button onClick={() => setPendingAction(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 py-5 rounded-2xl font-black text-slate-500">إلغاء</button>
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col items-center w-full">
                <div className="relative mb-12">
                   <div className="absolute inset-0 bg-indigo-500 blur-[60px] rounded-full opacity-20"></div>
                   <div className="w-48 h-48 bg-indigo-600 rounded-[3.5rem] flex items-center justify-center text-7xl border-8 border-white/5 relative z-10 shadow-2xl">🎙️</div>
                </div>
                <h2 className="text-2xl font-black leading-tight text-indigo-100 h-24 flex items-center justify-center">
                  {statusText || 'أنا أستمع إليك...'}
                </h2>
                <div className="flex gap-2.5 h-12 items-center justify-center mt-6">
                   {[0, 0.1, 0.2, 0.3, 0.4].map((delay) => (
                     <div key={delay} className="w-2 bg-indigo-400 rounded-full animate-waveform" style={{ animationDelay: `${delay}s` }}></div>
                   ))}
                </div>
              </div>
            )}
            
            <button onClick={handleCloseSession} className="w-full bg-rose-600 text-white px-12 py-5 rounded-2xl font-black shadow-2xl active:scale-95 border-b-4 border-rose-800">إغلاق المساعد الصوتي ✕</button>
          </div>
        </div>
      )}

      <style>{` 
        @keyframes waveform { 
          0%, 100% { height: 20%; opacity: 0.4; } 
          50% { height: 100%; opacity: 1; } 
        }
        .animate-waveform { animation: waveform 1s ease-in-out infinite; }
      `}</style>
    </>
  );
};

export default memo(VoiceAssistant);
