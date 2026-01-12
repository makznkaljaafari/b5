
import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GlobalSearch } from './molecules/GlobalSearch';
import { BaseButton } from './atoms/BaseButton';

interface LayoutProps {
  title: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  onBack?: () => void;
  floatingButton?: React.ReactNode;
}

export const PageLayout: React.FC<LayoutProps> = memo(({ title, headerExtra, children, onBack, floatingButton }) => {
  const { navigate, notifications, user, theme, toggleTheme } = useApp(); // Use toggleTheme
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="flex flex-col h-full bg-[var(--color-background-page)] transition-colors duration-500 w-full relative">
      <GlobalSearch isOpen={isSearchOpen} onClose={useCallback(() => setIsSearchOpen(false), [])} />

      <div className="z-40 w-full flex flex-col items-center px-2 md:px-4 pt-2 lg:pt-8 shrink-0">
        <header className={`w-full max-w-7xl rounded-2xl lg:rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 ${
          theme === 'dark' ? 'bg-slate-900/80 backdrop-blur-2xl border-white/5' : 'bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-500'
        }`}>
          <div className="flex items-center justify-between px-3 lg:px-12 h-16 lg:h-28 gap-2">
            
            <div className="flex items-center gap-3 lg:gap-8 shrink-0 max-w-[45%]">
              {onBack && (
                <button 
                  onClick={onBack} 
                  className="w-9 h-9 lg:w-16 lg:h-16 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl lg:text-3xl text-[var(--color-text-inverse)] active:scale-90 transition-all border border-white/10"
                >
                  →
                </button>
              )}
              <div className="flex flex-col min-w-0">
                <h1 className="text-sm lg:text-3xl font-black text-[var(--color-text-inverse)] truncate leading-tight tracking-tight mb-0.5">{title}</h1>
                <div className="flex items-center gap-1.5 opacity-80 overflow-hidden">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                  <span className="text-[7px] lg:text-[12px] font-black text-[var(--color-text-inverse)]/90 truncate uppercase tracking-[0.2em]">نظام الشويع الذكي</span>
                </div>
              </div>
            </div>

            <button 
                onClick={() => setIsSearchOpen(true)}
                className="h-10 lg:h-16 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 flex items-center justify-center px-4 gap-3 transition-all grow-0 shrink-0 w-12 sm:w-14 lg:w-64"
            >
                <span className="text-xl lg:text-3xl opacity-90 text-[var(--color-text-inverse)]">🔍</span>
                <span className="hidden lg:inline text-lg font-black text-white/40 truncate">بحث سحابي متطور...</span>
            </button>
            
            <div className="flex items-center gap-1.5 lg:gap-5 shrink-0">
              {headerExtra}
              <button 
                onClick={toggleTheme} 
                className="w-9 h-9 lg:w-16 lg:h-16 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl lg:text-3xl text-[var(--color-text-inverse)] active:scale-90 transition-all border border-white/10"
                aria-label="تغيير المظهر"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button 
                onClick={() => navigate('notifications')} 
                className="relative w-9 h-9 lg:w-16 lg:h-16 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl lg:text-3xl text-[var(--color-text-inverse)] active:scale-90 transition-all border border-white/10"
                aria-label="التنبيهات"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -left-1 w-4 h-4 lg:w-8 lg:h-8 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] lg:text-xs font-black shadow-lg animate-bounce">
                     {unreadCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => navigate('settings')} 
                className="w-9 h-9 lg:w-16 lg:h-16 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl lg:text-3xl text-[var(--color-text-inverse)] active:scale-90 transition-all border border-white/10"
                aria-label="الإعدادات"
              >⚙️</button>
            </div>
          </div>
        </header>

        <div className="w-full max-w-7xl px-6 py-3 flex justify-between items-center animate-in fade-in slide-in-from-top-1 text-right">
           <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm shadow-inner group-hover:rotate-12 transition-transform">👋</div>
              <p className="text-[10px] lg:text-sm font-black text-[var(--color-text-default)]">أهلاً بك يا <span className="text-indigo-600 dark:text-sky-400 decoration-wavy underline-offset-4">{user?.full_name || 'مدير'}</span></p>
           </div>
           <div className="flex items-center gap-4 text-[9px] lg:text-xs font-black text-[var(--color-text-muted)] opacity-70 tabular-nums">
              <span className="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-[var(--color-border-primary)]">📅 {currentTime.toLocaleDateString('ar-YE', {weekday: 'short', day:'numeric', month:'short'})}</span>
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-[var(--color-border-primary)]">🕒 {currentTime.toLocaleTimeString('ar-YE', {hour:'2-digit', minute:'2-digit'})}</span>
           </div>
        </div>
      </div>

      <main className="flex-1 w-full px-2 md:px-6 lg:px-16 pt-2 pb-44 overflow-y-auto no-scrollbar flex flex-col items-center">
        <div className="w-full max-w-7xl page-enter relative">
          {children}
        </div>
      </main>

      {floatingButton && (
        <div className="fixed bottom-24 right-6 lg:right-16 z-[100]">
          {floatingButton}
        </div>
      )}
    </div>
  );
});
