
import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';

export const InstallPWAButton: React.FC = () => {
  const { installPrompt, promptInstall } = useUI();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!installPrompt || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[70] w-full max-w-sm px-4 pointer-events-none lg:hidden">
      <div 
        className="bg-[var(--color-accent-sky)] text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-white pointer-events-auto animate-in slide-in-from-bottom-full fade-in"
        role="alert"
        aria-live="polite"
      >
        <span className="text-3xl" aria-hidden="true">⬇️</span>
        <div className="flex-1">
          <p className="font-black text-sm">ثبت التطبيق على جهازك</p>
          <p className="text-[10px] opacity-80">للحصول على تجربة أسرع ودون اتصال بالإنترنت</p>
        </div>
        <button 
          onClick={promptInstall}
          aria-label="تثبيت التطبيق على الشاشة الرئيسية"
          className="bg-white text-[var(--color-accent-sky)] px-4 py-2 rounded-xl font-black text-xs active:scale-95 transition-transform shadow-md"
        >
          تثبيت
        </button>
        <button 
          onClick={() => setIsDismissed(true)}
          aria-label="إغلاق لافتة التثبيت"
          className="text-white/80 hover:text-white text-xl ml-2"
        >
          &times;
        </button>
      </div>
    </div>
  );
};