
import React, { memo } from 'react';
import { useApp } from '../context/AppContext';

const BottomNav: React.FC = memo(() => {
  const { currentPage, navigate } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: '🏠' },
    { id: 'sales', label: 'المبيعات', icon: '💰' },
    { id: 'add-sale', label: 'إضافة', icon: '＋', primary: true },
    { id: 'ai-advisor', label: 'الذكاء', icon: '🤖' },
    { id: 'customers', label: 'العملاء', icon: '👥' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-2 pb-safe pointer-events-none lg:hidden">
      <nav className="w-full max-w-md bg-[var(--color-background-card)] dark:bg-[var(--color-background-page)] h-14 flex justify-around items-center rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] pointer-events-auto border-t border-[var(--color-border-default)]" aria-label="شريط التنقل الرئيسي">
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => navigate(item.id as any)}
            aria-label={item.label}
            aria-current={currentPage === item.id ? 'page' : undefined}
            className={`flex flex-col items-center justify-center transition-all relative flex-1 h-full ${
              item.primary ? 'pb-0' : 'active:scale-90'
            }`}
          >
            {item.primary ? (
              <div className="relative -top-5">
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-accent-sky)] to-[var(--color-accent-sky)]/80 rounded-xl flex items-center justify-center text-3xl text-[var(--color-text-inverse)] shadow-xl border-2 border-white dark:border-[var(--color-background-input)] transform active:scale-90" aria-hidden="true">
                  {item.icon}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center pt-1">
                <span className={`text-lg transition-all ${currentPage === item.id ? 'scale-110 text-[var(--color-accent-sky)] dark:text-[var(--color-accent-emerald)]' : 'opacity-40 text-[var(--color-text-muted)]'}`} aria-hidden="true">
                  {item.icon}
                </span>
                <span className={`text-[7px] font-black tracking-tighter uppercase mt-0.5 ${currentPage === item.id ? 'text-[var(--color-accent-sky)] dark:text-[var(--color-accent-emerald)]' : 'opacity-40 text-[var(--color-text-muted)]'}`}>
                  {item.label}
                </span>
                {currentPage === item.id && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--color-accent-sky)] dark:bg-[var(--color-accent-emerald)]" aria-hidden="true"></div>
                )}
              </div>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
});

export default BottomNav;
