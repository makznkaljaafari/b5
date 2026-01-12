
import React, { memo, useMemo } from 'react';
import { useApp } from '../context/AppContext';

const Sidebar: React.FC = memo(() => {
  const { currentPage, navigate, logoutAction, user, isSidebarCollapsed, toggleSidebar, theme } = useApp();

  const menuItems = useMemo(() => [
    { id: 'dashboard', label: 'الرئيسية', icon: '🏠' },
    { id: 'sales', label: 'المبيعات', icon: '💰' },
    { id: 'purchases', label: 'المشتريات', icon: '📦' },
    { id: 'vouchers', label: 'السندات', icon: '📥' },
    { id: 'debts', label: 'الميزانية', icon: '⚖️' },
    { id: 'customers', label: 'العملاء', icon: '👥' },
    { id: 'suppliers', label: 'الموردين', icon: '🚛' },
    { id: 'categories', label: 'المخزون', icon: '🌿' },
    { id: 'reports', label: 'التقارير', icon: '📊' },
    { id: 'expenses', label: 'المصاريف', icon: '💸' },
    { id: 'waste', label: 'التالف', icon: '🥀' },
    { id: 'activity-log', label: 'الرقابة', icon: '🛡️' },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️' },
  ], []);

  return (
    <aside 
      className={`hidden lg:flex flex-col h-screen sticky top-0 right-0 z-50 transition-all duration-500 overflow-y-auto no-scrollbar shadow-[25px_0_60px_-15px_rgba(0,0,0,0.1)] ${isSidebarCollapsed ? 'w-24' : 'w-80'} ${theme === 'dark' ? 'bg-[var(--color-background-secondary)] border-l border-[var(--color-border-primary)]' : 'bg-[var(--color-background-secondary)] border-l border-slate-200'}`}
      aria-label="قائمة التنقل الرئيسية"
    >
      <button 
        onClick={toggleSidebar}
        className="absolute left-4 top-10 w-10 h-10 bg-[var(--color-accent-sky)] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-[var(--color-accent-sky)]/80 active:scale-90 transition-all z-50 border-4 border-white dark:border-[var(--color-background-tertiary)]"
      >
        <span className={`text-xl transition-transform duration-500 ${isSidebarCollapsed ? 'rotate-180' : 'rotate-0'}`}>←</span>
      </button>

      <div className={`p-8 lg:p-10 flex flex-col h-full transition-all duration-500 ${isSidebarCollapsed ? 'items-center' : ''}`}>
        <div className={`flex items-center gap-6 mb-16 group cursor-pointer transition-all duration-500 ${isSidebarCollapsed ? 'justify-center' : ''}`} onClick={() => navigate('dashboard')}>
          <div className={`rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/20 group-hover:scale-110 transition-all ${isSidebarCollapsed ? 'w-14 h-14 text-2xl' : 'w-18 h-18 text-3xl'} ${theme === 'dark' ? 'bg-gradient-to-br from-[var(--color-accent-emerald)] to-[var(--color-accent-emerald)]/80' : 'bg-gradient-to-br from-[var(--color-accent-sky)] to-[var(--color-accent-info)]'}`}>🌿</div>
          {!isSidebarCollapsed && (
            <div className="text-right">
              <h1 className={`font-black text-2xl tracking-tighter ${theme === 'dark' ? 'text-[var(--color-accent-emerald)]' : 'text-[var(--color-accent-sky)]'}`}>وكالة الشويع</h1>
              <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mt-1">الذكاء المحاسبي</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id as any)}
              className={`w-full flex items-center gap-6 rounded-[1.5rem] font-black transition-all duration-300 ${isSidebarCollapsed ? 'justify-center p-4' : 'px-6 py-4 text-sm'} ${
                currentPage === item.id
                  ? 'bg-[var(--color-accent-sky)] text-white shadow-xl translate-x-[-8px]'
                  : `text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)] hover:text-[var(--color-accent-sky)]`
              }`}
            >
              <span className={`${isSidebarCollapsed ? 'text-3xl' : 'text-2xl'}`}>{item.icon}</span>
              {!isSidebarCollapsed && <span className="flex-1 text-right">{item.label}</span>}
              {!isSidebarCollapsed && currentPage === item.id && <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-sm"></div>}
            </button>
          ))}
        </nav>

        <div className={`mt-10 pt-8 border-t border-[var(--color-border-primary)] space-y-4`}>
          {!isSidebarCollapsed && (
            <div className={`flex items-center gap-4 p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[var(--color-background-tertiary)]/50 border-[var(--color-border-primary)]' : 'bg-slate-50 border-slate-100'}`}>
              <div className="w-12 h-12 bg-[var(--color-accent-sky)] rounded-xl flex items-center justify-center text-white font-black">{user?.full_name?.[0] || 'A'}</div>
              <div className="text-right flex-1 min-w-0">
                <p className="text-sm font-black text-[var(--color-text-primary)] truncate">{user?.full_name || 'المدير'}</p>
                <p className="text-[10px] text-[var(--color-text-secondary)] truncate italic">مشرف النظام</p>
              </div>
            </div>
          )}
          <button onClick={() => logoutAction()} className={`w-full flex items-center gap-6 rounded-2xl font-black text-[var(--color-accent-rose)] hover:bg-[var(--color-accent-rose)]/10 transition-all ${isSidebarCollapsed ? 'justify-center p-4' : 'px-6 py-4 text-sm'}`}>
            <span className="text-2xl">🚪</span>
            {!isSidebarCollapsed && <span className="flex-1 text-right">تسجيل خروج</span>}
          </button>
        </div>
      </div>
    </aside>
  );
});

export default Sidebar;
