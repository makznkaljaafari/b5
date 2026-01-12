import React, { useEffect } from 'react';

export interface ToastProps {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'ai_alert';
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, title, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const config = {
    success: { 
      icon: '✅', 
      color: 'bg-[var(--color-accent-emerald)]', 
      bg: 'bg-[var(--color-background-secondary)] dark:bg-[var(--color-background-secondary)]/90', 
      border: 'border-[var(--color-accent-emerald)]/20 dark:border-[var(--color-accent-emerald)]/30', 
      text: 'text-[var(--color-accent-emerald)] dark:text-[var(--color-accent-emerald)]' 
    },
    warning: { 
      icon: '⚠️', 
      color: 'bg-[var(--color-accent-warning)]', 
      bg: 'bg-[var(--color-background-secondary)] dark:bg-[var(--color-background-secondary)]/90', 
      border: 'border-[var(--color-accent-warning)]/20 dark:border-[var(--color-accent-warning)]/30', 
      text: 'text-[var(--color-accent-warning)] dark:text-[var(--color-accent-warning)]' 
    },
    info: { 
      icon: 'ℹ️', 
      color: 'bg-[var(--color-accent-info)]', 
      bg: 'bg-[var(--color-background-secondary)] dark:bg-[var(--color-background-secondary)]/90', 
      border: 'border-[var(--color-accent-info)]/20 dark:border-[var(--color-accent-info)]/30', 
      text: 'text-[var(--color-accent-info)] dark:text-[var(--color-accent-info)]' 
    },
    ai_alert: { 
      icon: '🤖', 
      color: 'bg-[var(--color-accent-indigo)]', 
      bg: 'bg-[var(--color-background-secondary)] dark:bg-[var(--color-background-secondary)]/90', 
      border: 'border-[var(--color-accent-indigo)]/20 dark:border-[var(--color-accent-indigo)]/30', 
      text: 'text-[var(--color-accent-indigo)] dark:text-[var(--color-accent-indigo)]' 
    }
  };

  const current = config[type];

  return (
    <div 
      className={`w-full max-w-sm pointer-events-auto overflow-hidden rounded-[1.5rem] border-2 ${current.border} ${current.bg} backdrop-blur-xl shadow-2xl transform transition-all duration-500 animate-in slide-in-from-top-full fade-in`}
      onClick={() => onClose(id)}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 ${current.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-white/20`}>
            {current.icon}
          </div>
          <div className="flex-1 pt-1 text-right"> {/* Added text-right for RTL */}
            <h3 className={`font-black text-lg ${current.text} leading-none mb-1`}>{title}</h3>
            <p className={`text-sm font-bold opacity-80 ${current.text} leading-tight`}>{message}</p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(id); }} 
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-2xl"
            aria-label="إغلاق الإشعار"
          >
            ×
          </button>
        </div>
      </div>
      <div className="h-1 w-full bg-[var(--color-border-primary)]/20">
        <div 
          className={`h-full ${current.color} transition-all duration-[4000ms] ease-linear`}
          style={{ width: '0%', animation: 'progress 4s linear forwards' }}
        ></div>
      </div>
      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastProps[], removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] p-4 flex flex-col items-center gap-4 pointer-events-none w-full max-w-md">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  );
};